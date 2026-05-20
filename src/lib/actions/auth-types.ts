export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const INITIAL_STATE: ActionState = { ok: false };
