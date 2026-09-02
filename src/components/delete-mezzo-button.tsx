"use client";

import { deleteMezzo } from "@/lib/mezzi/actions";

export function DeleteMezzoButton({ id, nome }: { id: string; nome: string }) {
  return (
    <form
      action={deleteMezzo}
      onSubmit={(e) => {
        if (
          !confirm(
            `Eliminare "${nome}"? Verranno rimossi anche i suoi interventi. L'operazione non è reversibile.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
      >
        Elimina
      </button>
    </form>
  );
}
