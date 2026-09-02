import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { signIn } from "@/lib/supabase/auth-actions";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const { error } = await searchParams;
  const notice =
    error === "conferma"
      ? "Link di conferma non valido o scaduto. Prova ad accedere o a registrarti di nuovo."
      : undefined;

  return <AuthForm mode="login" action={signIn} notice={notice} />;
}
