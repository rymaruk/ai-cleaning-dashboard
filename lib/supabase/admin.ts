import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

/** Service role client — server-only, bypasses RLS. For product processing. */
export function getAdminClient() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return client;
}
