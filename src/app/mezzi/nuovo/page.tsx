import { MezzoForm } from "@/components/mezzo-form";
import { createMezzo } from "@/lib/mezzi/actions";

export default function NuovoMezzoPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Nuovo mezzo
      </h1>
      <p className="mt-1 mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        I campi mostrati dipendono dalla categoria selezionata.
      </p>
      <MezzoForm action={createMezzo} />
    </div>
  );
}
