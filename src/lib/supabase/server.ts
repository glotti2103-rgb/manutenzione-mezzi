import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase per Server Components, Route Handlers e Server Actions.
 * Legge/scrive i cookie di sessione tramite l'API `cookies()` di Next.
 *
 * In un Server Component la scrittura dei cookie non è consentita: il
 * blocco try/catch la ignora, perché al refresh del token pensa comunque
 * il proxy (src/proxy.ts) ad ogni richiesta.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Chiamato da un Server Component: ignorabile.
          }
        },
      },
    },
  );
}
