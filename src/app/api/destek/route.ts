import { NextResponse, type NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM_PROMPT = `Sen GGD Topluluk web sitesinin destek asistanısın. Goose Goose Duck (GGD) topluluğunun lobi yönetim platformuna yardım eden bir AI asistansın.

Sitenin özellikleri:
- Üye kayıt/giriş (email + şifre, Google OAuth opsiyonel, GGD Friend Code zorunlu)
- Kayıt sonrası admin manuel onayı bekleniyor
- Ban / uyarı sistemi (3 uyarı = otomatik 30 günlük ban önerisi)
- Şikayet sistemi (foto/video kanıt ile)
- Topluluk chat (kanallı: #genel, #lobi-arama, #şikayet, #duyuru)
- Aktif lobi oda kodu paylaşımı
- Yönetim ekibi: Owner + Moderatörler
- Audit log (tüm admin işlemleri kayıtlı)

Sayfalar:
- /sorgu — User ID ile sorgu (public)
- /kara-liste — ban listesi
- /uyarilar — uyarı listesi
- /kurallar — lobi kuralları
- /sikayet — şikayet formu (üyelere açık)
- /topluluk — chat kanalları
- /duyurular — duyuru bülteni

Kurallar:
1. Sadece Türkçe yanıt ver. Profesyonel ama samimi bir ton tut.
2. Kısa ve net cevap ver. 2-3 cümleyi aşma çoğu zaman.
3. Kullanıcının doğrudan adresleyemediğin bir sorununa "Yönetime ulaş formundan ekibe yazabilirsin, 48 saatte dönüş alırsın" de.
4. Kişisel veri, anahtar, şifre talep etme. Birisi kendi şifresinden bahsederse "şifreni paylaşma" diye uyar.
5. GGD oyunu hakkında detay bilgiyi (oyun mekaniği vs.) bilmiyorsan "ben site asistanıyım, oyun mekaniği için Discord topluluğuna sor" de.
6. Politik, kişiye saldırı veya nefret içeren mesajlara cevap verme.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI servisi şu an aktif değil." },
      { status: 503 },
    );
  }

  let body: { message?: string; history?: { role: "user" | "assistant"; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const userMessage = (body.message ?? "").trim();
  if (!userMessage) {
    return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
  }
  if (userMessage.length > 1000) {
    return NextResponse.json(
      { error: "Mesaj en fazla 1000 karakter olabilir." },
      { status: 400 },
    );
  }

  const history = (body.history ?? []).slice(-10);

  const openai = new OpenAI({ apiKey });

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      max_tokens: 400,
      temperature: 0.6,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: userMessage },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode("\n\n[Hata: bağlantı kesildi]"),
          );
          console.error(err);
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("OpenAI error", err);
    return NextResponse.json(
      { error: "AI yanıt üretemedi, lütfen tekrar dene." },
      { status: 500 },
    );
  }
}
