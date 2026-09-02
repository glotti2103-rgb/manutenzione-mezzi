import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// In Next.js 16 il "middleware" si chiama Proxy. Qui rinfresca la
// sessione Supabase ad ogni richiesta (cookie di auth).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Tutte le richieste tranne:
     * - _next/static, _next/image
     * - favicon.ico e file statici comuni (immagini, font)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
