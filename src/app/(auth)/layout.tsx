import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 sm:py-16 dark:bg-black">
      {children}
    </div>
  );
}
