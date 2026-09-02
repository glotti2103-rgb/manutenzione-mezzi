"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/lib/supabase/auth-actions";

type Props = {
  mode: "login" | "register";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  notice?: string;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export function AuthForm({ mode, action, notice }: Props) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );
  const isLogin = mode === "login";

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {isLogin ? "Accedi" : "Crea un account"}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {isLogin
          ? "Entra con la tua email e password."
          : "Registrati con email e password."}
      </p>

      {notice && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {notice}
        </p>
      )}

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={isLogin ? undefined : 8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            className={inputClass}
          />
        </label>

        {state.error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 flex h-11 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {pending
            ? "Attendi…"
            : isLogin
              ? "Accedi"
              : "Registrati"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {isLogin ? (
          <>
            Non hai un account?{" "}
            <Link
              href="/register"
              className="font-medium text-black underline dark:text-zinc-50"
            >
              Registrati
            </Link>
          </>
        ) : (
          <>
            Hai già un account?{" "}
            <Link
              href="/login"
              className="font-medium text-black underline dark:text-zinc-50"
            >
              Accedi
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
