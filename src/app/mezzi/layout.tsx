import type { ReactNode } from "react";
import Link from "next/link";

export default function MezziLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ← Home
        </Link>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
