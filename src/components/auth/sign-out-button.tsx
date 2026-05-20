"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SignOutButtonProps {
  className?: string;
  children: React.ReactNode;
}

export function SignOutButton({ className, children }: SignOutButtonProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    if (pending) return;
    setPending(true);
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("sign-out failed:", err);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      data-sound="off"
      className={className}
    >
      {children}
    </button>
  );
}
