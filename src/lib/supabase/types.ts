// Minimal tip — daha sonra `npx supabase gen types typescript` ile üretilebilir.

export type UserRole =
  | "owner"
  | "co_owner"
  | "admin"
  | "moderator"
  | "helper"
  | "trusted"
  | "member";

export const ROLE_HIERARCHY: UserRole[] = [
  "owner",
  "co_owner",
  "admin",
  "moderator",
  "helper",
  "trusted",
  "member",
];

export const ADMIN_ROLES: UserRole[] = [
  "owner",
  "co_owner",
  "admin",
  "moderator",
];
export type VerificationStatus = "pending" | "approved" | "rejected";
export type BanDuration = "permanent" | "7d" | "30d" | "90d";
export type WarningSeverity = "low" | "medium" | "high";
export type ReportStatus =
  | "pending"
  | "investigating"
  | "resolved"
  | "rejected";
export type ReportCategory =
  | "insult"
  | "sabotage"
  | "cheat"
  | "spam"
  | "stream_sniping"
  | "other";

export type EventType = "raffle" | "tournament" | "community" | "other";
export type EventStatus =
  | "draft"
  | "published"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface Player {
  id: string;
  ggd_user_id: string;
  nickname: string;
  main_name: string | null;
  keyword: string | null;
  level: number | null;
  notes: string | null;
  added_by: string | null;
  claimed_profile_id: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  nickname: string;
  ggd_user_id: string;
  ggd_main_name: string | null;
  ggd_level: number | null;
  avatar_path: string | null;
  role: UserRole;
  verification_status: VerificationStatus;
  bio: string | null;
  joined_at: string;
  last_active_at: string;
}

export interface Ban {
  id: number;
  ggd_user_id: string | null;
  target_nickname: string;
  target_main_name: string | null;
  reason: string;
  reason_tags: string[];
  duration: BanDuration;
  expires_at: string | null;
  banned_by: string;
  is_active: boolean;
  created_at: string;
}

export interface Warning {
  id: number;
  ggd_user_id: string | null;
  target_nickname: string;
  target_main_name: string | null;
  reason: string;
  reason_tags: string[];
  severity: WarningSeverity;
  issued_by: string;
  is_active: boolean;
  created_at: string;
}

export interface Report {
  id: number;
  reporter_id: string;
  target_ggd_user_id: string | null;
  target_nickname: string;
  target_main_name: string | null;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  resolution_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  ai_severity: number | null;
  ai_summary: string | null;
  ai_recommendation: string | null;
  ai_analyzed_at: string | null;
  created_at: string;
}

export interface ReportEvidence {
  id: number;
  report_id: number;
  storage_path: string;
  media_type: "image" | "video";
  file_size_bytes: number | null;
  created_at: string;
}

export interface Channel {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  locked: boolean;
  position: number;
  created_at: string;
}

export interface Message {
  id: number;
  channel_id: number;
  author_id: string;
  content: string;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  tag: string;
  pinned: boolean;
  author_id: string;
  published_at: string;
  created_at: string;
}

export interface RoomCode {
  id: number;
  code: string;
  note: string | null;
  map: string | null;
  mode: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  starts_at: string;
  ends_at: string | null;
  prize: string | null;
  max_participants: number | null;
  winner_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  event_id: number;
  user_id: string;
  joined_at: string;
}

export type SupportCategory =
  | "ban_appeal"
  | "account_approval"
  | "account_issue"
  | "bug_report"
  | "general";

export interface SupportTicket {
  id: number;
  user_id: string | null;
  contact_email: string | null;
  subject: string;
  body: string;
  category: SupportCategory;
  status: "open" | "in_progress" | "resolved" | "closed";
  handled_by: string | null;
  created_at: string;
}

export interface SupportAttachment {
  id: number;
  ticket_id: number;
  storage_path: string;
  media_type: "image" | "video";
  file_size_bytes: number | null;
  created_at: string;
}

export interface RedZoneEntry {
  id: number;
  ggd_user_id: string | null;
  nickname: string;
  main_name: string | null;
  reason: string;
  description: string | null;
  source: string | null;
  evidence_url: string | null;
  added_by: string | null;
  is_active: boolean;
  created_at: string;
}

type TableShape<TRow> = {
  Row: TRow;
  Insert: Partial<TRow>;
  Update: Partial<TRow>;
  Relationships: [];
};

// Supabase'in tam Database tipi — Functions/Enums/Views/CompositeTypes da gerekir
export type Database = {
  public: {
    Tables: {
      profiles: TableShape<Profile>;
      players: TableShape<Player>;
      bans: TableShape<Ban>;
      warnings: TableShape<Warning>;
      reports: TableShape<Report>;
      report_evidence: TableShape<ReportEvidence>;
      channels: TableShape<Channel>;
      messages: TableShape<Message>;
      announcements: TableShape<Announcement>;
      room_code: TableShape<RoomCode>;
      audit_log: TableShape<AuditLog>;
      support_tickets: TableShape<SupportTicket>;
      support_attachments: TableShape<SupportAttachment>;
      red_zone: TableShape<RedZoneEntry>;
      events: TableShape<Event>;
      event_participants: TableShape<EventParticipant>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      verification_status: VerificationStatus;
      ban_duration: BanDuration;
      warning_severity: WarningSeverity;
      report_status: ReportStatus;
      report_category: ReportCategory;
      event_type: EventType;
      event_status: EventStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
