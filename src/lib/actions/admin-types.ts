export type AdminActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
};

export const INITIAL_ADMIN_STATE: AdminActionState = { ok: false };
