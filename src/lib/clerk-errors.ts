// Clerk error code'larini Turkce mesajlara cevirir.
// signIn/signUp/setActive vb. tum Clerk SDK cagrilarinin catch'inde kullan.

interface ClerkErrorLike {
  errors?: { code?: string; message?: string; longMessage?: string }[];
  message?: string;
}

const TR_MESSAGES: Record<string, string> = {
  // Identifier / kullanici bulunamadi
  form_identifier_not_found: "Bu email ile kayıtlı kullanıcı bulunamadı.",
  form_identifier_exists: "Bu email zaten kayıtlı.",
  identifier_already_signed_in: "Zaten giriş yapmışsın.",

  // Sifre
  form_password_incorrect: "Şifre yanlış.",
  form_password_pwned:
    "Bu şifre güvensiz (geçmişte sızdırılmış). Başka bir şifre seç.",
  form_password_length_too_short:
    "Şifre çok kısa — en az 8 karakter olmalı.",
  form_password_validation_failed: "Şifre kurallara uymuyor.",
  form_password_not_strong_enough:
    "Şifre yeterince güçlü değil — büyük/küçük harf ve rakam ekle.",

  // Code / kod dogrulama
  form_code_incorrect: "Kod yanlış veya süresi dolmuş.",
  verification_expired: "Doğrulama süresi doldu. Tekrar dene.",
  verification_failed: "Doğrulama başarısız oldu.",
  verification_already_verified: "Bu kod zaten kullanıldı.",

  // Form / input
  form_param_format_invalid: "Girdiğin bilgi geçerli bir formatta değil.",
  form_param_nil: "Lütfen tüm alanları doldur.",
  form_param_max_length_exceeded: "Girdiğin değer çok uzun.",

  // Strategy / akis
  strategy_for_user_invalid:
    "Bu hesap için bu yöntem kullanılamaz (örn. Google ile giriş yapmışsan şifre sıfırlanamaz).",
  identification_claimed:
    "Bu email başka bir hesaba bağlı. Farklı bir email kullan.",

  // Session
  session_exists: "Zaten giriş yapmışsın.",

  // Rate limit
  too_many_requests:
    "Çok fazla deneme yaptın. Birkaç dakika sonra tekrar dene.",

  // OAuth
  oauth_access_denied: "Google ile giriş iptal edildi.",
  oauth_email_domain_reserved_by_saml:
    "Bu email domain'i için Google ile giriş aktif değil.",

  // External / network
  network_error: "İnternet bağlantısında sorun var. Tekrar dene.",
  external_account_not_found: "Google hesabı bulunamadı.",

  // Bot / captcha
  captcha_invalid: "Doğrulama başarısız oldu. Sayfayı yenile, tekrar dene.",
  captcha_unavailable:
    "Bot koruması yüklenemedi. Sayfayı yenile, tekrar dene.",
};

const FALLBACK = "Beklenmedik bir hata oluştu. Birazdan tekrar dene.";

/**
 * Clerk SDK'dan gelen error'u Turkce mesaja cevirir.
 * Tanidik degilse fallback doner.
 */
export function clerkErrorToTr(err: unknown): string {
  const e = err as ClerkErrorLike;
  const first = e?.errors?.[0];
  if (first?.code && TR_MESSAGES[first.code]) {
    return TR_MESSAGES[first.code];
  }
  // longMessage > message > generic
  if (first?.longMessage) return first.longMessage;
  if (first?.message) return first.message;
  if (e?.message) return e.message;
  return FALLBACK;
}
