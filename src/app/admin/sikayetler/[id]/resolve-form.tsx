"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { resolveReportAction } from "@/lib/actions/admin";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";

export function ResolveReportForm({
  reportId,
  targetGgdUserId,
  targetNickname,
  currentStatus,
}: {
  reportId: number;
  targetGgdUserId: string;
  targetNickname: string;
  currentStatus: string;
}) {
  const [state, action, pending] = useActionState(
    resolveReportAction,
    INITIAL_ADMIN_STATE,
  );

  const banLink = `/admin/kara-liste/yeni?ggd=${encodeURIComponent(targetGgdUserId)}&nick=${encodeURIComponent(targetNickname)}`;
  const warnLink = `/admin/uyarilar/yeni?ggd=${encodeURIComponent(targetGgdUserId)}&nick=${encodeURIComponent(targetNickname)}`;

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="report_id" value={reportId} />

      <div>
        <Label htmlFor="status">Karar</Label>
        <select
          id="status"
          name="status"
          defaultValue={
            currentStatus === "pending" ? "investigating" : currentStatus
          }
          className="flex h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="investigating">İnceleniyor</option>
          <option value="resolved">Çözüldü (haklı / aksiyon alındı)</option>
          <option value="rejected">Reddedildi (asılsız / yetersiz)</option>
        </select>
      </div>

      <div>
        <Label htmlFor="resolution_note">Karar notu (şikayet sahibine görünür)</Label>
        <Textarea
          id="resolution_note"
          name="resolution_note"
          placeholder="Kararın gerekçesi ve alınan aksiyon..."
          maxLength={2000}
        />
      </div>

      {state.error && (
        <div className="rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state.ok && state.message && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "Kararı Kaydet"
          )}
        </Button>
        <div className="ml-auto flex gap-2">
          <Link href={warnLink}>
            <Button type="button" variant="outline" size="sm">
              Uyarı ver →
            </Button>
          </Link>
          <Link href={banLink}>
            <Button type="button" variant="outline" size="sm">
              Banla →
            </Button>
          </Link>
        </div>
      </div>
    </form>
  );
}
