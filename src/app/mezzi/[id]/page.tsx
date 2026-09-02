import Link from "next/link";
import { notFound } from "next/navigation";
import { InterventoForm } from "@/components/intervento-form";
import { DeleteInterventoButton } from "@/components/delete-intervento-button";
import {
  CONFIG_PER_CATEGORIA,
  UNITA_USO,
} from "@/lib/categorie";
import { CAMPI_SPECIFICI } from "@/lib/mezzi/campi";
import { formatData, formatEuro, formatNumero } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Intervento, Mezzo } from "@/lib/types";

function scadenzaLabel(i: Intervento, unita: string): string | null {
  if (i.prossima_scadenza_tipo === "data" && i.prossima_scadenza_data) {
    return `Prossima scadenza: ${formatData(i.prossima_scadenza_data)}`;
  }
  if (
    i.prossima_scadenza_tipo === "uso" &&
    i.prossima_scadenza_valore_uso != null
  ) {
    return `Prossima scadenza: a ${formatNumero(i.prossima_scadenza_valore_uso)} ${unita}`;
  }
  return null;
}

export default async function MezzoDettaglioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: mezzoData } = await supabase
    .from("mezzi")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!mezzoData) notFound();
  const mezzo = mezzoData as Mezzo;

  const { data: interventiData } = await supabase
    .from("interventi")
    .select("*")
    .eq("mezzo_id", id)
    .order("data", { ascending: false })
    .order("created_at", { ascending: false });
  const interventi = (interventiData ?? []) as Intervento[];

  const config = CONFIG_PER_CATEGORIA[mezzo.categoria];
  const unita = UNITA_USO[config.metrica];
  const totale = interventi.reduce((somma, i) => somma + (i.costo ?? 0), 0);

  const marcaModello = [mezzo.marca, mezzo.modello].filter(Boolean).join(" ");
  const dettagliSpecifici = config.campiSpecifici
    .map((key) => {
      const valore = mezzo[key as keyof Mezzo];
      if (valore === null || valore === undefined || valore === "") return null;
      const campo = CAMPI_SPECIFICI[key];
      const testo =
        campo?.input === "select"
          ? (campo.options?.find((o) => o.value === valore)?.label ??
            String(valore))
          : String(valore);
      return { label: campo?.label ?? key, valore: testo };
    })
    .filter((x): x is { label: string; valore: string } => x !== null);

  return (
    <>
      <Link
        href="/mezzi"
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        ← I miei mezzi
      </Link>

      {/* Intestazione mezzo */}
      <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {config.label}
            </span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {mezzo.nome}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {marcaModello || "—"}
              {mezzo.anno ? ` · ${mezzo.anno}` : ""}
            </p>
          </div>
          <Link
            href={`/mezzi/${mezzo.id}/modifica`}
            className="text-sm font-medium text-black hover:underline dark:text-zinc-50"
          >
            Modifica
          </Link>
        </div>

        {dettagliSpecifici.length > 0 && (
          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {dettagliSpecifici.map((d) => (
              <div key={d.label} className="flex justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">{d.label}</dt>
                <dd className="text-black dark:text-zinc-50">{d.valore}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Totale speso */}
      <section className="mt-4 flex items-baseline justify-between rounded-xl border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Totale speso
        </span>
        <span className="text-2xl font-semibold tracking-tight text-black tabular-nums dark:text-zinc-50">
          {formatEuro(totale)}
        </span>
      </section>

      {/* Nuovo intervento */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
          Registra intervento
        </h2>
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <InterventoForm mezzoId={mezzo.id} categoria={mezzo.categoria} />
        </div>
      </section>

      {/* Storico */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
          Storico interventi
          <span className="ml-2 text-sm font-normal text-zinc-400">
            {interventi.length}
          </span>
        </h2>

        {interventi.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Nessun intervento registrato per questo mezzo.
          </p>
        ) : (
          <ol className="mt-3 flex flex-col gap-3">
            {interventi.map((i) => {
              const scad = scadenzaLabel(i, unita);
              return (
                <li
                  key={i.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-black dark:text-zinc-50">
                        {i.tipo}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {formatData(i.data)}
                        {i.valore_uso != null
                          ? ` · ${formatNumero(i.valore_uso)} ${unita}`
                          : ""}
                        {i.officina ? ` · ${i.officina}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold text-black tabular-nums dark:text-zinc-50">
                        {formatEuro(i.costo ?? 0)}
                      </span>
                      <DeleteInterventoButton
                        id={i.id}
                        mezzoId={mezzo.id}
                        descrizione={`${i.tipo} del ${formatData(i.data)}`}
                      />
                    </div>
                  </div>

                  {i.note && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                      {i.note}
                    </p>
                  )}
                  {scad && (
                    <p className="mt-2 w-fit rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      {scad}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </>
  );
}
