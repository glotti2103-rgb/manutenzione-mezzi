"use client";

import { useActionState, useState } from "react";
import {
  CONFIG_PER_CATEGORIA,
  UNITA_USO,
  VALORE_USO_LABEL,
} from "@/lib/categorie";
import { oggiISO } from "@/lib/format";
import { createIntervento } from "@/lib/interventi/actions";
import type { CategoriaMezzo } from "@/lib/types";

const fieldClass =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function InterventoForm({
  mezzoId,
  categoria,
}: {
  mezzoId: string;
  categoria: CategoriaMezzo;
}) {
  const [state, formAction, pending] = useActionState<
    { error?: string },
    FormData
  >(createIntervento, {});
  const [scadenza, setScadenza] = useState<"" | "data" | "uso">("");

  const config = CONFIG_PER_CATEGORIA[categoria];
  const tracciaUso = config.metrica !== "nessuna";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="mezzo_id" value={mezzoId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Data
          <input
            type="date"
            name="data"
            required
            defaultValue={oggiISO()}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Tipo di intervento
          <input
            type="text"
            name="tipo"
            required
            placeholder="es. cambio olio, tagliando, revisione"
            className={fieldClass}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Costo (€)
          <input
            type="number"
            name="costo"
            required
            min={0}
            step="0.01"
            className={fieldClass}
          />
        </label>
        {tracciaUso && (
          <label className={labelClass}>
            {VALORE_USO_LABEL[config.metrica]} al momento
            <input
              type="number"
              name="valore_uso"
              min={0}
              step={config.metrica === "ore" ? "0.1" : "1"}
              className={fieldClass}
            />
            <span className="mt-1 block text-xs font-normal text-zinc-400">
              Opzionale
            </span>
          </label>
        )}
      </div>

      <label className={labelClass}>
        Officina / fornitore
        <input type="text" name="officina" className={fieldClass} />
        <span className="mt-1 block text-xs font-normal text-zinc-400">
          Opzionale
        </span>
      </label>

      <label className={labelClass}>
        Note
        <textarea name="note" rows={2} className={fieldClass} />
        <span className="mt-1 block text-xs font-normal text-zinc-400">
          Opzionale
        </span>
      </label>

      <label className={labelClass}>
        Foto ricevuta
        <input
          type="file"
          name="ricevuta"
          accept="image/*,application/pdf"
          className="mt-1 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-200"
        />
        <span className="mt-1 block text-xs font-normal text-zinc-400">
          Opzionale — immagine o PDF, max 10 MB
        </span>
      </label>

      <fieldset className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <legend className="px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Prossima scadenza (opzionale)
        </legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Promemoria
            <select
              name="prossima_scadenza_tipo"
              value={scadenza}
              onChange={(e) =>
                setScadenza(e.target.value as "" | "data" | "uso")
              }
              className={fieldClass}
            >
              <option value="">Nessuna</option>
              {config.scadenze.includes("data") && (
                <option value="data">Per data</option>
              )}
              {config.scadenze.includes("uso") && (
                <option value="uso">
                  Per {config.metrica === "ore" ? "ore motore" : "km"}
                </option>
              )}
            </select>
          </label>

          {scadenza === "data" && (
            <label className={labelClass}>
              Data prossima scadenza
              <input
                type="date"
                name="prossima_scadenza_data"
                required
                className={fieldClass}
              />
            </label>
          )}
          {scadenza === "uso" && (
            <label className={labelClass}>
              Alla soglia di ({UNITA_USO[config.metrica]})
              <input
                type="number"
                name="prossima_scadenza_valore_uso"
                required
                min={0}
                step={config.metrica === "ore" ? "0.1" : "1"}
                className={fieldClass}
              />
            </label>
          )}
        </div>
      </fieldset>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-fit items-center justify-center rounded-lg bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
      >
        {pending ? "Salvataggio…" : "Registra intervento"}
      </button>
    </form>
  );
}
