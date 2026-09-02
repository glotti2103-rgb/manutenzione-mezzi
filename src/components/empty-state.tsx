import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  action?: { href: string; label: string };
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-950">
      <p className="text-sm font-semibold text-black dark:text-zinc-50">
        {title}
      </p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
