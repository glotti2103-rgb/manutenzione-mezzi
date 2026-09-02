"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONFIG_PER_CATEGORIA } from "@/lib/categorie";
import { CAMPI_NUMERICI } from "@/lib/mezzi/campi";
import type { CategoriaMezzo } from "@/lib/types";

export type MezzoFormState = { error?: string };

const CATEGORIE_VALIDE: CategoriaMezzo[] = [
  "auto",
  "jeep",
  "scooter",
  "bicicletta",
  "gommone",
  "sci",
  "carrello",
];

const TUTTI_CAMPI_SPECIFICI = [
  "targa",
  "cilindrata",
  "tipo_bici",
  "numero_immatricolazione",
  "marca_motore",
  "potenza_motore",
  "lunghezza",
  "portata_massima",
];

function testo(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function numero(formData: FormData, key: string): number | null {
  const v = String(formData.get(key) ?? "").trim();
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

type Payload = Record<string, string | number | null>;

function costruisciPayload(
  formData: FormData,
): { payload: Payload } | { error: string } {
  const categoria = String(formData.get("categoria") ?? "") as CategoriaMezzo;
  if (!CATEGORIE_VALIDE.includes(categoria)) {
    return { error: "Categoria non valida." };
  }

  const nome = testo(formData, "nome");
  if (!nome) {
    return { error: "Il nome è obbligatorio." };
  }

  const payload: Payload = {
    nome,
    categoria,
    marca: testo(formData, "marca"),
    modello: testo(formData, "modello"),
    anno: numero(formData, "anno"),
  };

  // Azzera tutti i campi specifici, poi valorizza solo quelli della categoria.
  for (const campo of TUTTI_CAMPI_SPECIFICI) payload[campo] = null;
  for (const campo of CONFIG_PER_CATEGORIA[categoria].campiSpecifici) {
    payload[campo] = CAMPI_NUMERICI.has(campo)
      ? numero(formData, campo)
      : testo(formData, campo);
  }

  return { payload };
}

export async function createMezzo(
  _prev: MezzoFormState,
  formData: FormData,
): Promise<MezzoFormState> {
  const res = costruisciPayload(formData);
  if ("error" in res) return res;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("mezzi")
    .insert({ ...res.payload, user_id: user.id });
  if (error) return { error: `Errore nel salvataggio: ${error.message}` };

  revalidatePath("/mezzi");
  redirect("/mezzi");
}

export async function updateMezzo(
  _prev: MezzoFormState,
  formData: FormData,
): Promise<MezzoFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Mezzo non trovato." };

  const res = costruisciPayload(formData);
  if ("error" in res) return res;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("mezzi")
    .update(res.payload)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: `Errore nel salvataggio: ${error.message}` };

  revalidatePath("/mezzi");
  revalidatePath(`/mezzi/${id}/modifica`);
  redirect("/mezzi");
}

export async function deleteMezzo(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("mezzi").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/mezzi");
}
