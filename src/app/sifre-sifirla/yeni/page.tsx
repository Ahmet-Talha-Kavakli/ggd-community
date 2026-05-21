import { redirect } from "next/navigation";

// Eski iki sayfali akistan kalma route. Yeni tek sayfa multi-step
// /sifre-sifirla'ya redirect.
export default function YeniSifrePage() {
  redirect("/sifre-sifirla");
}
