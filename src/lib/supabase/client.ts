import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase per i Client Components (browser).
 * La sessione di autenticazione è gestita via cookie, in coordinamento
 * con il client server e il proxy (vedi src/proxy.ts).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
