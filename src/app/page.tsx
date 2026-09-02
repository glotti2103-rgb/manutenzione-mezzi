import Link from "next/link";
import { signOut } from "@/lib/supabase/auth-actions";
import { createClient } from "@/lib/supabase/server";
import { calcolaScadenze, type StatoScadenza } from "@/lib/scadenze";
import { EmptyState } from "@/components/empty-state";
import { ErrorNotice } from "@/components/error-notice";
import type { Intervento, Mezzo } from "@/lib/types";

const STATO_STYLE: Record<StatoScadenza, string> = {
  ritardo: "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/50",
  imminente:
    "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
  futura: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
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

  const [mezziRes, interventiRes] = await Promise.all([
    supabase.from("mezzi").select("*"),
    supabase.from("interventi").select("*"),
  ]);

  const erroreCaricamento = Boolean(mezziRes.error || interventiRes.error);
  const scadenze = calcolaScadenze(
    (mezziRes.data ?? []) as Mezzo[],
    (interventiRes.data ?? []) as Intervento[],
  );
  const inRitardo = scadenze.filter((s) => s.stato === "ritardo").length;
  const inArrivo = scadenze.filter((s) => s.stato === "imminente").length;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              App personale
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl dark:text-zinc-50">
              Manutenzione Mezzi
            </h1>
          </div>
          {user && (
            <div className="flex max-w-full items-center gap-2 self-start rounded-full border border-zinc-200 bg-white py-1.5 pl-3 pr-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <span className="truncate text-zinc-600 dark:text-zinc-400">
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
            {(inRitardo > 0 || inArrivo > 0) && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {inRitardo > 0 && (
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {inRitardo} in ritardo
                  </span>
                )}
                {inRitardo > 0 && inArrivo > 0 && " · "}
                {inArrivo > 0 && <span>{inArrivo} in arrivo</span>}
              </p>
            )}
          </div>

          <div className="mt-4">
            {erroreCaricamento ? (
              <ErrorNotice description="Impossibile caricare le scadenze. Riprova più tardi." />
            ) : scadenze.length === 0 ? (
              <EmptyState
                title="Nessuna scadenza in programma"
                description="Quando registri un intervento puoi impostare una “prossima scadenza”: comparirà qui, con in evidenza quelle in ritardo."
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {scadenze.map((s) => (
                  <li key={s.interventoId + s.tipo}>
                    <Link
                      href={`/mezzi/${s.mezzoId}`}
                      className={`flex flex-col gap-1 rounded-xl border p-4 transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 ${STATO_STYLE[s.stato]}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 font-medium text-black dark:text-zinc-50">
                          <span className="break-words">{s.mezzoNome}</span>
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
                      <span className="break-words text-sm text-zinc-700 dark:text-zinc-300">
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
          </div>
        </section>

        <Link
          href="/mezzi"
          className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-fit dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          I miei mezzi
        </Link>
      </div>
    </div>
  );
}
