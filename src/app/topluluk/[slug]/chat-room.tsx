"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { gravatarUrl } from "@/lib/gravatar";
import { relativeTime } from "@/lib/utils";

interface ChatMessage {
  id: number;
  content: string;
  created_at: string;
  author_id: string;
  author: {
    id: string;
    nickname: string;
    email: string;
    role: string;
  } | null;
}

interface ChatRoomProps {
  channelId: number;
  canPost: boolean;
  currentUserId: string;
  currentNickname: string;
  isAdmin: boolean;
  initialMessages: ChatMessage[];
}

export function ChatRoom({
  channelId,
  canPost,
  currentUserId,
  currentNickname,
  isAdmin,
  initialMessages,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const supabase = useRef(createClient()).current;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Omit<ChatMessage, "author">;
          // author bilgisini çek
          const { data: author } = await supabase
            .from("profiles")
            .select("id, nickname, email, role")
            .eq("id", newMsg.author_id)
            .maybeSingle();

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, {
              ...newMsg,
              author: author as ChatMessage["author"],
            }];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const updated = payload.new as { id: number; deleted_at: string | null };
          if (updated.deleted_at) {
            setMessages((prev) => prev.filter((m) => m.id !== updated.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, supabase]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setError(null);

    const optimisticId = -Date.now();
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      content,
      created_at: new Date().toISOString(),
      author_id: currentUserId,
      author: {
        id: currentUserId,
        nickname: currentNickname,
        email: "",
        role: isAdmin ? "moderator" : "member",
      },
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft("");

    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({
        channel_id: channelId,
        author_id: currentUserId,
        content,
      })
      .select("id, content, created_at, author_id")
      .single();

    if (insertError) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setError(insertError.message);
      setDraft(content);
    } else if (data) {
      const inserted = data as { id: number; content: string; created_at: string; author_id: string };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId
            ? { ...m, id: inserted.id, created_at: inserted.created_at }
            : m,
        ),
      );
    }

    setSending(false);
  }

  async function deleteMessage(messageId: number) {
    await supabase
      .from("messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }

  return (
    <div className="rounded-2xl border border-ink-900 bg-white shadow-card overflow-hidden flex flex-col h-[70vh] min-h-[500px]">
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
      >
        {messages.length === 0 && (
          <div className="m-auto text-center text-sm text-ink-400">
            Henüz mesaj yok. İlk yazan sen ol!
          </div>
        )}
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const isOwn = m.author_id === currentUserId;
          const grouped =
            prev?.author_id === m.author_id &&
            new Date(m.created_at).getTime() -
              new Date(prev.created_at).getTime() <
              5 * 60 * 1000;
          return (
            <div
              key={m.id}
              className={`flex gap-3 group ${grouped ? "-mt-2" : ""}`}
            >
              {!grouped ? (
                <Image
                  src={gravatarUrl(m.author?.email ?? "", 64)}
                  alt={m.author?.nickname ?? "?"}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border border-ink-200 shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-9 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                {!grouped && (
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                      className={`font-semibold text-sm ${
                        m.author?.role === "owner"
                          ? "text-brand-700"
                          : m.author?.role === "moderator"
                            ? "text-brand-600"
                            : "text-ink-900"
                      }`}
                    >
                      {m.author?.nickname ?? "?"}
                    </span>
                    {m.author?.role === "owner" && (
                      <span className="text-[10px] uppercase tracking-wider text-brand-700 font-bold">
                        owner
                      </span>
                    )}
                    {m.author?.role === "moderator" && (
                      <span className="text-[10px] uppercase tracking-wider text-brand-600 font-medium">
                        mod
                      </span>
                    )}
                    <span className="text-xs text-ink-400">
                      {relativeTime(m.created_at)}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <p className="text-[15px] text-ink-800 leading-relaxed break-words flex-1">
                    {m.content}
                  </p>
                  {(isOwn || isAdmin) && m.id > 0 && (
                    <button
                      onClick={() => deleteMessage(m.id)}
                      aria-label="Sil"
                      className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-danger-600 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-ink-200/70 p-4 bg-ink-50/50">
        {!canPost ? (
          <p className="text-center text-sm text-ink-500 py-2">
            Bu kanalda sadece yönetim mesaj atabilir.
          </p>
        ) : (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Mesajını yaz... (Enter ile gönder)"
              maxLength={2000}
              autoComplete="off"
              className="flex-1 h-11 rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <Button type="submit" disabled={!draft.trim() || sending}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}
        {error && (
          <p className="mt-2 text-xs text-danger-600">{error}</p>
        )}
      </div>
    </div>
  );
}
