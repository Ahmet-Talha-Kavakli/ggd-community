import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/nextjs/server";
import { randomUUID } from "node:crypto";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

// Clerk webhook → Supabase profile sync
// Events: user.created, user.updated, user.deleted

type ClerkEvent =
  | {
      type: "user.created" | "user.updated";
      data: {
        id: string;
        email_addresses: { email_address: string; id: string }[];
        primary_email_address_id?: string;
        username?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        image_url?: string;
        public_metadata?: Record<string, unknown>;
        unsafe_metadata?: Record<string, unknown>;
      };
    }
  | {
      type: "user.deleted";
      data: { id: string; deleted: boolean };
    };

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET tanımlı değil.");
    return NextResponse.json({ error: "webhook misconfigured" }, { status: 500 });
  }

  const headerStore = await headers();
  const svixId = headerStore.get("svix-id");
  const svixTimestamp = headerStore.get("svix-timestamp");
  const svixSignature = headerStore.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  let evt: ClerkEvent;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch (err) {
    console.error("svix verify failed:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  if (evt.type === "user.created") {
    const u = evt.data;
    const email =
      u.email_addresses.find((e) => e.id === u.primary_email_address_id)
        ?.email_address ??
      u.email_addresses[0]?.email_address ??
      "";
    const meta = (u.unsafe_metadata ?? {}) as Record<string, unknown>;
    const nickname =
      (typeof meta.nickname === "string" && meta.nickname.trim()) ||
      u.username?.trim() ||
      email.split("@")[0] ||
      "kullanici";
    const ggdUserId =
      typeof meta.ggd_user_id === "string" ? meta.ggd_user_id.trim() : "";
    const ggdMainName =
      typeof meta.ggd_main_name === "string"
        ? meta.ggd_main_name.trim() || null
        : null;
    const ggdLevel =
      typeof meta.ggd_level === "number"
        ? meta.ggd_level
        : typeof meta.ggd_level === "string" && meta.ggd_level
          ? Number(meta.ggd_level) || null
          : null;

    // 1) clerk_user_id ile profile ara (idempotency — retry'larda skip)
    const { data: existingByClerk } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", u.id)
      .maybeSingle();

    let profileId: string;

    if ((existingByClerk as { id: string } | null)?.id) {
      profileId = (existingByClerk as { id: string }).id;
    } else if (email) {
      // 2) Email ile ara — eski Supabase auth artigi veya orphan (webhook
      // daha onceden fail olmus) profile olabilir. Yeni satir insert
      // edersek UNIQUE constraint patlar, onun yerine mevcut satira
      // clerk_user_id'yi bagla.
      const { data: existingByEmail } = await supabase
        .from("profiles")
        .select("id, clerk_user_id")
        .eq("email", email)
        .maybeSingle();

      const byEmail = existingByEmail as {
        id: string;
        clerk_user_id: string | null;
      } | null;

      if (byEmail?.id) {
        profileId = byEmail.id;
        if (!byEmail.clerk_user_id) {
          const { error } = await supabase
            .from("profiles")
            .update({
              clerk_user_id: u.id,
              nickname,
              ggd_user_id: ggdUserId,
              ggd_main_name: ggdMainName,
              ggd_level: ggdLevel,
            })
            .eq("id", profileId);
          if (error) {
            console.error("orphan profile link failed:", error.message);
            return NextResponse.json(
              { error: error.message },
              { status: 500 },
            );
          }
        } else if (byEmail.clerk_user_id !== u.id) {
          // Email baska bir Clerk user_id ile bagli — collision. Sessiz
          // gec, alarm logla. Manual mudahale gerekir.
          console.error(
            `email collision: ${email} already linked to ${byEmail.clerk_user_id}, skipping ${u.id}`,
          );
          return NextResponse.json(
            { error: "email already linked to another user" },
            { status: 409 },
          );
        }
      } else {
        profileId = randomUUID();
        const { error } = await supabase.from("profiles").insert({
          id: profileId,
          clerk_user_id: u.id,
          email,
          nickname,
          ggd_user_id: ggdUserId,
          ggd_main_name: ggdMainName,
          ggd_level: ggdLevel,
          role: "member",
          verification_status: "pending",
        });
        if (error) {
          console.error("profile insert failed:", error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    } else {
      // Edge case: hic email yok. Yeni profile insert.
      profileId = randomUUID();
      const { error } = await supabase.from("profiles").insert({
        id: profileId,
        clerk_user_id: u.id,
        email,
        nickname,
        ggd_user_id: ggdUserId,
        ggd_main_name: ggdMainName,
        ggd_level: ggdLevel,
        role: "member",
        verification_status: "pending",
      });
      if (error) {
        console.error("profile insert failed:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Clerk publicMetadata'ya profile_id yaz — JWT template bunu sub claim
    // olarak kullanacak, böylece auth.uid() doğru UUID'yi döndürür
    try {
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(u.id, {
        publicMetadata: {
          ...(u.public_metadata ?? {}),
          profile_id: profileId,
        },
      });
    } catch (err) {
      console.error("clerk metadata update failed:", err);
    }

    // Hos geldin maili — sadece YENI yaratilan profile icin (orphan link
    // durumunda email gondermeyelim, kullanici muhtemelen daha onceden almis).
    const isNewProfile = !(existingByClerk as { id: string } | null)?.id;
    if (isNewProfile && email) {
      sendWelcomeEmail({ to: email, nickname }).catch((err) =>
        console.error("welcome email failed:", err),
      );
    }

    return NextResponse.json({ ok: true, profile_id: profileId });
  }

  if (evt.type === "user.updated") {
    const u = evt.data;
    const email =
      u.email_addresses.find((e) => e.id === u.primary_email_address_id)
        ?.email_address ?? u.email_addresses[0]?.email_address;
    if (email) {
      await supabase
        .from("profiles")
        .update({ email })
        .eq("clerk_user_id", u.id);
    }
    return NextResponse.json({ ok: true });
  }

  if (evt.type === "user.deleted") {
    await supabase.from("profiles").delete().eq("clerk_user_id", evt.data.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: true });
}
