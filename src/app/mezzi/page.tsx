import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CONFIG_PER_CATEGORIA } from "@/lib/categorie";
import { DeleteMezzoButton } from "@/components/delete-mezzo-button";
import { EmptyState } from "@/components/empty-state";
import { ErrorNotice } from "@/components/error-notice";
import type { Mezzo } from "@/lib/types";

export default async function MezziPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mezzi")
    .select("*")
    .order("nome", { ascending: true });
  const mezzi = (data ?? []) as Mezzo[];

  return (
    <>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          I miei mezzi
        </h1>
        <Link
          href="/mezzi/nuovo"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          + Aggiungi mezzo
        </Link>
      </header>

      <div className="mt-6">
        {error ? (
          <ErrorNotice description="Impossibile caricare i mezzi. Riprova più tardi." />
        ) : mezzi.length === 0 ? (
          <EmptyState
            title="Nessun mezzo, ancora"
            description="Aggiungi il tuo primo mezzo per iniziare a registrarne gli interventi di manutenzione."
            action={{ href: "/mezzi/nuovo", label: "Aggiungi un mezzo" }}
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {mezzi.map((m) => {
              const marcaModello = [m.marca, m.modello]
                .filter(Boolean)
                .join(" ");
              return (
                <li
                  key={m.id}
                  className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                >
                  <span className="w-fit rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {CONFIG_PER_CATEGORIA[m.categoria].label}
                  </span>
                  <h2 className="mt-2 text-lg font-semibold text-black dark:text-zinc-50">
                    <Link
                      href={`/mezzi/${m.id}`}
                      className="break-words hover:underline"
                    >
                      {m.nome}
                    </Link>
                  </h2>
                  <p className="break-words text-sm text-zinc-500 dark:text-zinc-400">
                    {marcaModello || "—"}
                    {m.anno ? ` · ${m.anno}` : ""}
                  </p>
                  <div className="mt-4 flex items-center gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <Link
                      href={`/mezzi/${m.id}`}
                      className="text-sm font-medium text-black hover:underline dark:text-zinc-50"
                    >
                      Dettaglio
                    </Link>
                    <Link
                      href={`/mezzi/${m.id}/modifica`}
                      className="text-sm font-medium text-black hover:underline dark:text-zinc-50"
                    >
                      Modifica
                    </Link>
                    <DeleteMezzoButton id={m.id} nome={m.nome} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
