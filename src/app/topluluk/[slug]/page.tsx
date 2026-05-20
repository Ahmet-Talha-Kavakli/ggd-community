import Link from "next/link";
import { notFound } from "next/navigation";
import { Hash, Lock, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ChatRoom } from "./chat-room";
import type { Channel, Message, Profile } from "@/lib/supabase/types";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  return { title: `#${slug}` };
}

type MessageWithAuthor = Message & {
  author: Pick<Profile, "id" | "nickname" | "email" | "role"> | null;
};

export default async function KanalPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: channelData } = await supabase
    .from("channels")
    .select("id, slug, name, description, locked")
    .eq("slug", slug)
    .maybeSingle();

  const channel = channelData as Pick<
    Channel,
    "id" | "slug" | "name" | "description" | "locked"
  > | null;
  if (!channel) notFound();

  const current = await getCurrentUser();

  if (!current || !current.isApproved) {
    return (
      <section className="container-page py-14">
        <Link
          href="/topluluk"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-800 mb-4"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Kanallar
        </Link>
        <Card>
          <CardContent className="p-10 text-center max-w-lg mx-auto">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-700">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold text-ink-900">
              #{channel.name}
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              {!current
                ? "Sohbete katılmak için giriş yap veya kayıt ol."
                : "Hesabın onay bekliyor. Onaylandıktan sonra mesaj atabilirsin."}
            </p>
            <div className="mt-5 flex gap-2 justify-center">
              {!current ? (
                <>
                  <Link href={`/giris?next=/topluluk/${slug}`}>
                    <Button variant="outline">Giriş</Button>
                  </Link>
                  <Link href="/kayit">
                    <Button>Kayıt Ol</Button>
                  </Link>
                </>
              ) : (
                <Link href="/profil">
                  <Button>Profile dön</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Onaylı üye — mesajları getir
  const { data: messagesData } = await supabase
    .from("messages")
    .select(
      "id, channel_id, author_id, content, created_at, edited_at, deleted_at, author:profiles!messages_author_id_fkey(id, nickname, email, role)",
    )
    .eq("channel_id", channel.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  const messages = ((messagesData ?? []) as unknown as MessageWithAuthor[]).reverse();

  const canPost = !channel.locked || current.isAdmin;

  return (
    <section className="container-page py-8 md:py-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <Link
            href="/topluluk"
            className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-800 mb-2"
          >
            <ChevronLeft className="h-3 w-3" />
            Kanallar
          </Link>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
              {channel.locked ? (
                <Lock className="h-5 w-5" />
              ) : (
                <Hash className="h-5 w-5" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                #{channel.name}
              </h1>
              {channel.description && (
                <p className="text-sm text-ink-500">{channel.description}</p>
              )}
            </div>
            {channel.locked && (
              <Badge variant="outline">Sadece yönetim yazabilir</Badge>
            )}
          </div>
        </div>
      </div>

      <ChatRoom
        channelId={channel.id}
        canPost={canPost}
        currentUserId={current.user.id}
        currentNickname={current.nickname}
        isAdmin={current.isAdmin}
        initialMessages={messages.map((m) => ({
          id: m.id,
          content: m.content,
          created_at: m.created_at,
          author_id: m.author_id,
          author: m.author
            ? {
                id: m.author.id,
                nickname: m.author.nickname,
                email: m.author.email,
                role: m.author.role,
              }
            : null,
        }))}
      />
    </section>
  );
}
