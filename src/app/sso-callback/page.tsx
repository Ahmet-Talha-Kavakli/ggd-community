"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="flex-1 grid place-items-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="mt-4 text-sm text-ink-500">Giriş tamamlanıyor...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
