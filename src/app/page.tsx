import Link from "next/link";
import { signOut } from "@/lib/supabase/auth-actions";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          App personale
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl dark:text-zinc-50">
          Manutenzione Mezzi
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Tieni traccia di tutti gli interventi di manutenzione dei tuoi mezzi e
          delle scadenze in arrivo.
        </p>

        {user && (
          <>
            <Link
              href="/mezzi"
              className="mt-8 flex h-11 items-center rounded-lg bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              I miei mezzi
            </Link>
            <div className="mt-4 flex items-center gap-4 rounded-full border border-zinc-200 bg-white py-2 pl-4 pr-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <span className="text-zinc-600 dark:text-zinc-400">
                {user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full bg-black px-3 py-1.5 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                >
                  Esci
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
