import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { signUp } from "@/lib/supabase/auth-actions";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return <AuthForm mode="register" action={signUp} />;
}
