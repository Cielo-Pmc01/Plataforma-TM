import { createClient } from "@supabase/supabase-js";

/**
 * Client used only for password recovery.
 *
 * The app's regular browser client uses PKCE, which rejects links carrying
 * #access_token and only works in the browser that requested the email.
 * The implicit flow lets the link be opened on any device, and the session
 * stays in memory so it never replaces the cookie session.
 */
export function createRecoveryClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        flowType: "implicit",
        detectSessionInUrl: false,
        persistSession: false,
        autoRefreshToken: false,
        storageKey: "tm-platform-recovery",
      },
    },
  );
}
