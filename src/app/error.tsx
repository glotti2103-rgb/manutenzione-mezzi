"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-24 text-center dark:bg-black">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Si è verificato un errore
      </h1>
      <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        Non è stato possibile completare l&apos;operazione. Riprova; se il
        problema persiste, ricarica la pagina.
      </p>
      <button
        onClick={reset}
        className="h-10 rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
      >
        Riprova
      </button>
    </div>
  );
}
