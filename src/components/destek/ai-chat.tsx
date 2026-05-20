"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER: Message = {
  role: "assistant",
  content: "Merhaba! Sana nasıl yardım edebilirim?",
};

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([STARTER]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setLoading(true);
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/destek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.filter((m) => m.role !== "assistant" || m.content),
        }),
      });

      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({}));
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content:
              "❌ " +
              (errBody.error ?? "Bir hata oluştu, lütfen tekrar dene."),
          };
          return next;
        });
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: buffer };
          return next;
        });
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: "❌ Bağlantı hatası. Tekrar dene.",
        };
        return next;
      });
    }

    setLoading(false);
  }

  function reset() {
    setMessages([STARTER]);
  }

  return (
    <>
      <div
        ref={scrollerRef}
        className="rounded-xl border border-ink-200 bg-ink-50 p-5 min-h-[280px] max-h-[420px] overflow-y-auto flex flex-col gap-3 text-sm"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <span
              className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold shrink-0 ${
                m.role === "user"
                  ? "bg-ink-700 text-white"
                  : "bg-brand-600 text-white"
              }`}
            >
              {m.role === "user" ? "SEN" : "AI"}
            </span>
            <div
              className={`rounded-2xl px-4 py-2.5 max-w-[80%] whitespace-pre-wrap break-words ${
                m.role === "user"
                  ? "bg-brand-600 text-white rounded-tr-sm"
                  : "bg-white border border-ink-200 text-ink-800 rounded-tl-sm"
              }`}
            >
              {m.content || (
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-400 animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-400 animate-pulse [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-400 animate-pulse [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Sorunu yaz..."
          maxLength={1000}
          autoComplete="off"
          className="flex-1 h-11 rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        <Button type="submit" disabled={!input.trim() || loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
        {messages.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            onClick={reset}
            aria-label="Sıfırla"
            size="icon"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
      </form>
    </>
  );
}
