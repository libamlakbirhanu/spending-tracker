import { AuthChangeEvent } from "@supabase/supabase-js";

export type SupabaseSubscription = {
  unsubscribe: () => void;
};

// Re-export Supabase's AuthChangeEvent for convenience
export type { AuthChangeEvent };

// Constants matching Supabase's auth events
export const AUTH_EVENTS = {
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
} as const satisfies Record<string, AuthChangeEvent>;
