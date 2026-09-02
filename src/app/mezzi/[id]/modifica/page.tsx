import { notFound } from "next/navigation";
import { MezzoForm } from "@/components/mezzo-form";
import { updateMezzo } from "@/lib/mezzi/actions";
import { createClient } from "@/lib/supabase/server";
import type { Mezzo } from "@/lib/types";

export default async function ModificaMezzoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("mezzi")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Modifica mezzo
      </h1>
      <MezzoForm action={updateMezzo} mezzo={data as Mezzo} />
    </div>
  );
}
