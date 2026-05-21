import { Resend } from "resend";
import { SITE } from "@/config/site";

const FROM_DEFAULT =
  process.env.RESEND_FROM ?? `${SITE.name} <onboarding@resend.dev>`;

let cached: Resend | null = null;
function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Email gönderir. RESEND_API_KEY yoksa sessizce no-op döner — devde test
 * olmadan da kod hata vermez.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailParams): Promise<{ ok: boolean; id?: string; error?: string }> {
  const resend = getClient();
  if (!resend) {
    console.log(`[email:noop] to=${to} subject="${subject}"`);
    return { ok: false, error: "RESEND_API_KEY tanımlı değil" };
  }

  try {
    const result = await resend.emails.send({
      from: from ?? FROM_DEFAULT,
      to,
      subject,
      html,
      text: text ?? "",
    });
    if (result.error) {
      console.error("[email:error]", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    console.error("[email:exception]", err);
    return { ok: false, error: String(err) };
  }
}

// =============================================================================
// Email şablonları
// =============================================================================

function layout(title: string, body: string) {
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5">
    <tr><td style="padding:32px 16px">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7">
        <tr><td style="padding:24px 28px;background:linear-gradient(135deg,#10b981,#047857);color:#fff">
          <div style="font-weight:700;font-size:18px;letter-spacing:-0.02em">🪿 GooseCage</div>
        </td></tr>
        <tr><td style="padding:32px 28px">
          ${body}
        </td></tr>
        <tr><td style="padding:20px 28px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;text-align:center">
          Goose Goose Duck topluluk yönetim platformu. Bu emaili almak istemiyorsan profil → bildirimler ayarlarından kapatabilirsin.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:999px;font-weight:500;font-size:14px">${label}</a>`;
}

function siteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

// -----------------------------------------------------------------------------
// Şikayet sonucu
// -----------------------------------------------------------------------------
interface ReportResolvedEmailParams {
  to: string;
  reporterNickname: string;
  targetNickname: string;
  status: "resolved" | "rejected" | "investigating";
  note: string | null;
}

export async function sendReportResolvedEmail({
  to,
  reporterNickname,
  targetNickname,
  status,
  note,
}: ReportResolvedEmailParams) {
  const statusText = {
    resolved: "Şikayetin haklı bulundu ve aksiyon alındı.",
    rejected: "Şikayetin yeterli kanıt olmadığı için reddedildi.",
    investigating: "Şikayetin şu an inceleniyor.",
  }[status];

  const subjectStatus = {
    resolved: "kabul edildi",
    rejected: "reddedildi",
    investigating: "inceleniyor",
  }[status];

  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;letter-spacing:-0.02em">Merhaba ${reporterNickname},</h1>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;line-height:1.6">
      <strong>${targetNickname}</strong> hakkındaki şikayetin değerlendirildi.
    </p>
    <div style="background:#f4f4f5;border-radius:12px;padding:16px;margin:16px 0">
      <p style="margin:0;color:#18181b;font-weight:500">${statusText}</p>
      ${note ? `<p style="margin:12px 0 0;color:#52525b;font-size:14px;line-height:1.5;font-style:italic">"${note}"</p>` : ""}
    </div>
    <p style="margin:24px 0 0">${button(siteUrl("/profil/sikayetlerim"), "Şikayetlerimi gör")}</p>
  `;

  return sendEmail({
    to,
    subject: `Şikayetin ${subjectStatus} — GooseCage`,
    html: layout("Şikayet sonucu", body),
    text: `Merhaba ${reporterNickname}, ${targetNickname} hakkındaki şikayetin: ${statusText}${
      note ? ` Not: ${note}` : ""
    }`,
  });
}

// -----------------------------------------------------------------------------
// Hesap onayı / reddi
// -----------------------------------------------------------------------------
export async function sendVerificationEmail({
  to,
  nickname,
  status,
}: {
  to: string;
  nickname: string;
  status: "approved" | "rejected";
}) {
  if (status === "approved") {
    const body = `
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;letter-spacing:-0.02em">Hoş geldin ${nickname}! 🎉</h1>
      <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;line-height:1.6">
        Hesabın onaylandı. Artık tüm topluluk özelliklerini kullanabilirsin:
      </p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#3f3f46;font-size:14px;line-height:1.8">
        <li>Topluluk chat'inde mesaj yazabilirsin</li>
        <li>Şikayet açabilirsin (foto/video kanıtla)</li>
        <li>Diğer oyuncuların sicilini sorgulayabilirsin</li>
      </ul>
      <p style="margin:24px 0 0">${button(siteUrl("/topluluk"), "Topluluğa katıl")}</p>
    `;
    return sendEmail({
      to,
      subject: `Hesabın onaylandı — GooseCage`,
      html: layout("Hoş geldin", body),
      text: `Hoş geldin ${nickname}! Hesabın onaylandı, artık tüm özellikleri kullanabilirsin.`,
    });
  }

  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;letter-spacing:-0.02em">Merhaba ${nickname},</h1>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;line-height:1.6">
      Üyelik başvurun şu anda <strong>reddedildi</strong>. Sebep:
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#3f3f46;font-size:14px;line-height:1.7">
      <li>GGD User ID doğrulanamadı (yanlış format veya sahte olabilir)</li>
      <li>Daha önce banlanmış bir hesapla ilişkili olabilir</li>
    </ul>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px">
      Bilgilerini güncelleyip tekrar başvurabilir veya destek hattından
      yönetimle iletişime geçebilirsin.
    </p>
    <p style="margin:24px 0 0">${button(siteUrl("/destek"), "Destek hattı")}</p>
  `;
  return sendEmail({
    to,
    subject: `Üyelik başvurun — GooseCage`,
    html: layout("Başvuru sonucu", body),
    text: `Merhaba ${nickname}, üyelik başvurun reddedildi. Destek hattından iletişime geç.`,
  });
}

// -----------------------------------------------------------------------------
// Hoş geldin — yeni kayıt sonrası
// -----------------------------------------------------------------------------
export async function sendWelcomeEmail({
  to,
  nickname,
}: {
  to: string;
  nickname: string;
}) {
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;letter-spacing:-0.02em">Hoş geldin ${nickname}! 🪿</h1>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;line-height:1.6">
      GooseCage'e kayıt olduğun için teşekkürler. Hesabın şu anda
      <strong>onay bekliyor</strong> — yönetim ekibi kısa süre içinde
      üyeliğini değerlendirecek.
    </p>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;line-height:1.6">
      Onay sonrası şunları yapabileceksin:
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#3f3f46;font-size:14px;line-height:1.8">
      <li>Topluluk chat'inde konuşabilirsin</li>
      <li>Toksik oyuncuları şikayet edebilirsin (foto/video kanıtla)</li>
      <li>Diğer oyuncuların sicilini sorgulayabilirsin</li>
    </ul>
    <p style="margin:24px 0 0">${button(siteUrl("/"), "Siteye dön")}</p>
  `;
  return sendEmail({
    to,
    subject: `Hoş geldin ${nickname} — GooseCage`,
    html: layout("Hoş geldin", body),
    text: `Hoş geldin ${nickname}! Hesabın onay bekliyor, yönetim kısa sürede değerlendirecek.`,
  });
}

// -----------------------------------------------------------------------------
// Şikayet alındı — raporcuya
// -----------------------------------------------------------------------------
export async function sendReportReceivedEmail({
  to,
  reporterNickname,
  targetNickname,
  reportId,
}: {
  to: string;
  reporterNickname: string;
  targetNickname: string;
  reportId: number;
}) {
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;letter-spacing:-0.02em">Şikayetin alındı, ${reporterNickname}</h1>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;line-height:1.6">
      <strong>${targetNickname}</strong> hakkındaki şikayetin yönetim ekibine
      iletildi. En kısa sürede incelenecek.
    </p>
    <div style="background:#f4f4f5;border-radius:12px;padding:14px 16px;margin:16px 0;font-size:13px;color:#52525b">
      Şikayet referans no: <span style="font-family:monospace;color:#18181b;font-weight:500">#${reportId}</span>
    </div>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;line-height:1.6">
      Sonuç çıktığında ayrı bir email alacaksın. Süreç hakkında soru sormak
      için destek hattını kullanabilirsin.
    </p>
    <p style="margin:24px 0 0">${button(siteUrl("/profil/sikayetlerim"), "Şikayetlerimi takip et")}</p>
  `;
  return sendEmail({
    to,
    subject: `Şikayetin alındı (#${reportId}) — GooseCage`,
    html: layout("Şikayet alındı", body),
    text: `Şikayetin alındı, ${reporterNickname}. ${targetNickname} hakkında. Referans no: #${reportId}`,
  });
}

// -----------------------------------------------------------------------------
// Uyarı bildirimi — uyarılan kayıtlıysa
// -----------------------------------------------------------------------------
export async function sendWarningNotificationEmail({
  to,
  nickname,
  reason,
  severity,
}: {
  to: string;
  nickname: string;
  reason: string;
  severity: "low" | "medium" | "high";
}) {
  const severityText = {
    low: "düşük",
    medium: "orta",
    high: "yüksek",
  }[severity];
  const severityColor = {
    low: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
    medium: { bg: "#fef3c7", border: "#fcd34d", text: "#78350f" },
    high: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  }[severity];

  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;letter-spacing:-0.02em">Bir uyarı aldın</h1>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;line-height:1.6">
      Merhaba ${nickname}, yönetim sana <strong>${severityText} seviye</strong>
      bir uyarı verdi. Detayı:
    </p>
    <div style="background:${severityColor.bg};border:1px solid ${severityColor.border};border-radius:12px;padding:16px;margin:16px 0;color:${severityColor.text};font-size:14px;line-height:1.5">
      ${reason}
    </div>
    <p style="margin:16px 0;color:#52525b;font-size:14px;line-height:1.6">
      <strong>3 aktif uyarı = otomatik ban.</strong> Lobi kurallarına dikkat
      etmen önemli. İtirazın varsa destek hattından bildirebilirsin.
    </p>
    <p style="margin:24px 0 0">${button(siteUrl("/uyarilar"), "Uyarılarımı gör")}</p>
  `;
  return sendEmail({
    to,
    subject: `Bir uyarı aldın — GooseCage`,
    html: layout("Uyarı bildirimi", body),
    text: `Merhaba ${nickname}, ${severityText} seviye uyarı aldın. Sebep: ${reason}. 3 uyarı = ban.`,
  });
}

// -----------------------------------------------------------------------------
// Ban / uyarı bildirim (banlanan/uyarılan kayıtlıysa)
// -----------------------------------------------------------------------------
export async function sendBanNotificationEmail({
  to,
  nickname,
  reason,
  duration,
}: {
  to: string;
  nickname: string;
  reason: string;
  duration: string;
}) {
  const durationText =
    duration === "permanent" ? "kalıcı" : `${duration} süreli`;
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;letter-spacing:-0.02em">Hesabın ${durationText} banlandı</h1>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;line-height:1.6">
      Merhaba ${nickname}, hesabın topluluğumuzdan banlandı. Aşağıdaki sebepten:
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0;color:#991b1b;font-size:14px;line-height:1.5">
      ${reason}
    </div>
    <p style="margin:16px 0;color:#52525b;font-size:14px;line-height:1.6">
      İtirazın varsa destek hattından başvurabilirsin. Yönetim 48 saat içinde
      değerlendirecek.
    </p>
    <p style="margin:24px 0 0">${button(siteUrl("/destek"), "İtirazını bildir")}</p>
  `;
  return sendEmail({
    to,
    subject: `Hesabın ${durationText} banlandı — GooseCage`,
    html: layout("Ban bildirimi", body),
    text: `Merhaba ${nickname}, hesabın ${durationText} banlandı. Sebep: ${reason}`,
  });
}
