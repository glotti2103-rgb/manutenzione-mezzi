import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-50 px-6 py-24 text-center dark:bg-black">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
        Errore 404
      </p>
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Pagina non trovata
      </h1>
      <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        La pagina che cerchi non esiste o è stata rimossa.
      </p>
      <Link
        href="/"
        className="mt-1 inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
      >
        Torna alla home
      </Link>
    </div>
  );
}
