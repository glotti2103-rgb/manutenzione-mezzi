"use client";

import { deleteIntervento } from "@/lib/interventi/actions";

export function DeleteInterventoButton({
  id,
  mezzoId,
  descrizione,
}: {
  id: string;
  mezzoId: string;
  descrizione: string;
}) {
  return (
    <form
      action={deleteIntervento}
      onSubmit={(e) => {
        if (!confirm(`Eliminare l'intervento "${descrizione}"?`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="mezzo_id" value={mezzoId} />
      <button
        type="submit"
        className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
      >
        Elimina
      </button>
    </form>
  );
}
