"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          padding: "48px 24px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          background:
            "linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            textAlign: "center",
            background: "#fff",
            padding: 40,
            borderRadius: 24,
            border: "1px solid #e4e4e7",
            boxShadow: "0 4px 24px -8px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto",
              borderRadius: 16,
              background: "#fef2f2",
              display: "grid",
              placeItems: "center",
              fontSize: 28,
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              margin: "24px 0 8px",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#18181b",
            }}
          >
            Kritik bir hata oluştu
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              color: "#71717a",
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            Beklenmedik bir durum yüzünden uygulama yüklenemedi. Sayfayı
            yenileyerek tekrar dene.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              background: "#059669",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Tekrar dene
          </button>
          {error.digest && (
            <p
              style={{
                marginTop: 24,
                fontSize: 11,
                color: "#a1a1aa",
                fontFamily: "monospace",
              }}
            >
              {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
