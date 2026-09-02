import Link from "next/link";
import { signOut } from "@/lib/supabase/auth-actions";
import { createClient } from "@/lib/supabase/server";
import { calcolaScadenze, type StatoScadenza } from "@/lib/scadenze";
import type { Intervento, Mezzo } from "@/lib/types";

const STATO_STYLE: Record<StatoScadenza, string> = {
  ritardo:
    "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/50",
  imminente:
    "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
  futura:
    "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
};

const STATO_BADGE: Record<StatoScadenza, string> = {
  ritardo: "bg-red-600 text-white",
  imminente: "bg-amber-500 text-white",
  futura: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

const STATO_LABEL: Record<StatoScadenza, string> = {
  ritardo: "In ritardo",
  imminente: "In arrivo",
  futura: "Futura",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: mezziData }, { data: interventiData }] = await Promise.all([
    supabase.from("mezzi").select("*"),
    supabase.from("interventi").select("*"),
  ]);

  const scadenze = calcolaScadenze(
    (mezziData ?? []) as Mezzo[],
    (interventiData ?? []) as Intervento[],
  );
  const inRitardo = scadenze.filter((s) => s.stato === "ritardo").length;
  const inArrivo = scadenze.filter((s) => s.stato === "imminente").length;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              App personale
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Manutenzione Mezzi
            </h1>
          </div>
          {user && (
            <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white py-1.5 pl-3 pr-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <span className="text-zinc-600 dark:text-zinc-400">
                {user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                >
                  Esci
                </button>
              </form>
            </div>
          )}
        </header>

        <section className="mt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Scadenze
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {inRitardo > 0 && (
                <span className="font-medium text-red-600 dark:text-red-400">
                  {inRitardo} in ritardo
                </span>
              )}
              {inRitardo > 0 && inArrivo > 0 && " · "}
              {inArrivo > 0 && <span>{inArrivo} in arrivo</span>}
            </p>
          </div>

          {scadenze.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Nessuna scadenza impostata. Aggiungi una &ldquo;prossima
              scadenza&rdquo; quando registri un intervento.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {scadenze.map((s) => (
                <li key={s.interventoId + s.tipo}>
                  <Link
                    href={`/mezzi/${s.mezzoId}`}
                    className={`flex flex-col gap-1 rounded-xl border p-4 transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 ${STATO_STYLE[s.stato]}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-black dark:text-zinc-50">
                        {s.mezzoNome}
                        <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                          {s.categoriaLabel}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATO_BADGE[s.stato]}`}
                      >
                        {STATO_LABEL[s.stato]}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {s.tipoIntervento}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {s.dettaglio}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link
          href="/mezzi"
          className="mt-8 flex h-11 w-fit items-center rounded-lg bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          I miei mezzi
        </Link>
      </div>
    </div>
  );
}
