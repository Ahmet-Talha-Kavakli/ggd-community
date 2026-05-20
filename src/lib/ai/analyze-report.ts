import OpenAI from "openai";

const CATEGORY_LABELS: Record<string, string> = {
  insult: "Hakaret",
  sabotage: "Sabotaj",
  cheat: "Hile",
  spam: "Spam",
  stream_sniping: "Stream sniping",
  other: "Diğer",
};

const SYSTEM_PROMPT = `Sen GGD topluluğunun moderasyon asistanısın. Sana bir şikayet metni veriliyor; admin'in önceliklendirmesi için ciddiyet skoru ve öneri çıkarmanı istiyoruz.

Şikayet türleri ve ağırlık:
- Hakaret: ağırlık katsayısı 3-5 (içerik ne kadar sert/sürekliyse o kadar yüksek)
- Sabotaj: 3-4 (takım oyununa kasıtlı zarar)
- Hile: 4-5 (cheat kullanımı kanıtlı veya iddialı)
- Spam: 1-3 (rahatsız edici ama tehlikesiz)
- Stream sniping: 2-3 (etik dışı ama oyunsal)
- Diğer: 1-5 (içeriğe göre)

Çıktı formatı KESİNLİKLE şu JSON olmalı:
{
  "severity": 1-5 arası tek tamsayı,
  "summary": "20-80 karakter Türkçe özet — admin bir bakışta anlasın",
  "recommendation": "ban" | "warn" | "investigate" | "reject" | "more_info"
}

severity:
  1 = bilgilendirici / önemsiz
  2 = düşük öncelik
  3 = orta — bakılmalı
  4 = yüksek — hızla aksiyon gerek
  5 = kritik — derhal ban/uzaklaştırma

recommendation:
  "ban"          → kanıt güçlü, doğrudan kara liste
  "warn"         → uyarı yeter
  "investigate"  → daha çok delil/araştırma gerek
  "reject"       → şikayet asılsız/yetersiz
  "more_info"    → şikayet eden ek bilgi vermeli`;

export type ReportAnalysis = {
  severity: number;
  summary: string;
  recommendation: "ban" | "warn" | "investigate" | "reject" | "more_info";
};

export async function analyzeReport(opts: {
  category: string;
  description: string;
  targetNickname: string;
  hasEvidence: boolean;
}): Promise<ReportAnalysis | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const openai = new OpenAI({ apiKey });
  const userMsg = `Şikayet kategorisi: ${CATEGORY_LABELS[opts.category] ?? opts.category}
Şikayet edilen oyuncu: ${opts.targetNickname}
Foto/video kanıt: ${opts.hasEvidence ? "var" : "yok"}

Şikayet metni:
"""
${opts.description}
"""`;

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
    });
    const raw = resp.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as Partial<ReportAnalysis>;

    const severity = Number(parsed.severity);
    if (!Number.isFinite(severity) || severity < 1 || severity > 5) return null;

    const validRec = ["ban", "warn", "investigate", "reject", "more_info"];
    const recommendation = validRec.includes(parsed.recommendation ?? "")
      ? (parsed.recommendation as ReportAnalysis["recommendation"])
      : "investigate";

    const summary =
      typeof parsed.summary === "string"
        ? parsed.summary.slice(0, 200)
        : "Özet alınamadı";

    return {
      severity: Math.round(severity),
      summary,
      recommendation,
    };
  } catch (err) {
    console.error("AI report analysis failed:", err);
    return null;
  }
}
