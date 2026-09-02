"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CATEGORIE, CONFIG_PER_CATEGORIA, METRICA_LABEL } from "@/lib/categorie";
import { campiPerCategoria } from "@/lib/mezzi/campi";
import type { MezzoFormState } from "@/lib/mezzi/actions";
import type { CategoriaMezzo, Mezzo } from "@/lib/types";

type Props = {
  action: (
    state: MezzoFormState,
    formData: FormData,
  ) => Promise<MezzoFormState>;
  mezzo?: Mezzo;
};

const fieldClass =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
const labelClass =
  "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

function valoreIniziale(mezzo: Mezzo | undefined, name: string): string | number {
  if (!mezzo) return "";
  const v = mezzo[name as keyof Mezzo];
  return v === null || v === undefined ? "" : (v as string | number);
}

export function MezzoForm({ action, mezzo }: Props) {
  const [state, formAction, pending] = useActionState<MezzoFormState, FormData>(
    action,
    {},
  );
  const [categoria, setCategoria] = useState<CategoriaMezzo>(
    mezzo?.categoria ?? "auto",
  );

  const campi = campiPerCategoria(categoria);
  const config = CONFIG_PER_CATEGORIA[categoria];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {mezzo && <input type="hidden" name="id" value={mezzo.id} />}

      <label className={labelClass}>
        Nome / soprannome
        <input
          type="text"
          name="nome"
          required
          defaultValue={valoreIniziale(mezzo, "nome")}
          placeholder="es. Panda gialla"
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Categoria
        <select
          name="categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as CategoriaMezzo)}
          className={fieldClass}
        >
          {CATEGORIE.map((c) => (
            <option key={c.valore} value={c.valore}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className={labelClass}>
          Marca
          <input
            type="text"
            name="marca"
            defaultValue={valoreIniziale(mezzo, "marca")}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Modello
          <input
            type="text"
            name="modello"
            defaultValue={valoreIniziale(mezzo, "modello")}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Anno
          <input
            type="number"
            name="anno"
            min={1900}
            max={2100}
            defaultValue={valoreIniziale(mezzo, "anno")}
            className={fieldClass}
          />
        </label>
      </div>

      {campi.length > 0 && (
        <fieldset className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <legend className="px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Dettagli {config.label}
          </legend>
          <div className="mt-2 grid gap-5 sm:grid-cols-2">
            {campi.map((campo) => (
              <label key={campo.name} className={labelClass}>
                {campo.label}
                {campo.input === "select" ? (
                  <select
                    name={campo.name}
                    required={campo.required}
                    defaultValue={valoreIniziale(mezzo, campo.name)}
                    className={fieldClass}
                  >
                    <option value="">Seleziona…</option>
                    {campo.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={campo.input}
                    name={campo.name}
                    required={campo.required}
                    min={campo.min}
                    max={campo.max}
                    step={campo.step}
                    defaultValue={valoreIniziale(mezzo, campo.name)}
                    className={fieldClass}
                  />
                )}
                {campo.help && (
                  <span className="mt-1 block text-xs font-normal text-zinc-400">
                    {campo.help}
                  </span>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Uso tracciato in: <strong>{METRICA_LABEL[config.metrica]}</strong>
      </p>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 items-center justify-center rounded-lg bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {pending
            ? "Salvataggio…"
            : mezzo
              ? "Salva modifiche"
              : "Aggiungi mezzo"}
        </button>
        <Link
          href="/mezzi"
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          Annulla
        </Link>
      </div>
    </form>
  );
}
