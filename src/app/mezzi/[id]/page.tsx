import Link from "next/link";
import { notFound } from "next/navigation";
import { InterventoForm } from "@/components/intervento-form";
import { DeleteInterventoButton } from "@/components/delete-intervento-button";
import { EmptyState } from "@/components/empty-state";
import { ErrorNotice } from "@/components/error-notice";
import { CONFIG_PER_CATEGORIA, UNITA_USO } from "@/lib/categorie";
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

  const { data: mezzoData, error: mezzoError } = await supabase
    .from("mezzi")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (mezzoError) throw new Error(mezzoError.message);
  if (!mezzoData) notFound();
  const mezzo = mezzoData as Mezzo;

  const { data: interventiData, error: interventiError } = await supabase
    .from("interventi")
    .select("*")
    .eq("mezzo_id", id)
    .order("data", { ascending: false })
    .order("created_at", { ascending: false });
  const interventi = (interventiData ?? []) as Intervento[];

  // URL firmati (bucket privato) per le ricevute allegate.
  const ricevutaPaths = interventi
    .map((i) => i.ricevuta_url)
    .filter((p): p is string => !!p);
  const ricevutaUrl = new Map<string, string>();
  if (ricevutaPaths.length > 0) {
    const { data: firmati } = await supabase.storage
      .from("ricevute")
      .createSignedUrls(ricevutaPaths, 60 * 60);
    for (const f of firmati ?? []) {
      if (f.path && f.signedUrl) ricevutaUrl.set(f.path, f.signedUrl);
    }
  }

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
      <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {config.label}
            </span>
            <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {mezzo.nome}
            </h1>
            <p className="break-words text-sm text-zinc-500 dark:text-zinc-400">
              {marcaModello || "—"}
              {mezzo.anno ? ` · ${mezzo.anno}` : ""}
            </p>
          </div>
          <Link
            href={`/mezzi/${mezzo.id}/modifica`}
            className="inline-flex h-9 shrink-0 items-center rounded-lg border border-zinc-300 px-3 text-sm font-medium text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Modifica
          </Link>
        </div>

        {dettagliSpecifici.length > 0 && (
          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {dettagliSpecifici.map((d) => (
              <div key={d.label} className="flex justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">{d.label}</dt>
                <dd className="break-words text-right text-black dark:text-zinc-50">
                  {d.valore}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Totale speso */}
      <section className="mt-4 flex items-baseline justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
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
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <InterventoForm mezzoId={mezzo.id} categoria={mezzo.categoria} />
        </div>
      </section>

      {/* Storico */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
          Storico interventi
          {interventi.length > 0 && (
            <span className="ml-2 text-sm font-normal text-zinc-400">
              {interventi.length}
            </span>
          )}
        </h2>

        <div className="mt-3">
          {interventiError ? (
            <ErrorNotice description="Impossibile caricare lo storico degli interventi." />
          ) : interventi.length === 0 ? (
            <EmptyState
              title="Nessun intervento registrato"
              description="Usa il modulo qui sopra per registrare il primo intervento di questo mezzo."
            />
          ) : (
            <ol className="flex flex-col gap-3">
              {interventi.map((i) => {
                const scad = scadenzaLabel(i, unita);
                return (
                  <li
                    key={i.id}
                    className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-medium text-black dark:text-zinc-50">
                          {i.tipo}
                        </p>
                        <p className="break-words text-sm text-zinc-500 dark:text-zinc-400">
                          {formatData(i.data)}
                          {i.valore_uso != null
                            ? ` · ${formatNumero(i.valore_uso)} ${unita}`
                            : ""}
                          {i.officina ? ` · ${i.officina}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
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
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-600 dark:text-zinc-400">
                        {i.note}
                      </p>
                    )}
                    {i.ricevuta_url && ricevutaUrl.has(i.ricevuta_url) && (
                      <a
                        href={ricevutaUrl.get(i.ricevuta_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-black underline dark:text-zinc-50"
                      >
                        Ricevuta allegata
                      </a>
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
        </div>
      </section>
    </>
  );
}
