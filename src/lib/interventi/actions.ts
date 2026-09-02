"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONFIG_PER_CATEGORIA } from "@/lib/categorie";
import type { CategoriaMezzo, TipoScadenza } from "@/lib/types";

export type InterventoFormState = { error?: string };

function testo(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function numeroNonNegativo(value: string): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const MAX_RICEVUTA_BYTES = 10 * 1024 * 1024; // 10 MB
const RICEVUTA_MIME_OK = /^(image\/|application\/pdf$)/;

/** Carica la foto/PDF della ricevuta nel bucket privato e ritorna il path. */
async function caricaRicevuta(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  if (file.size > MAX_RICEVUTA_BYTES) {
    return { error: "La ricevuta supera i 10 MB." };
  }
  if (file.type && !RICEVUTA_MIME_OK.test(file.type)) {
    return { error: "La ricevuta deve essere un'immagine o un PDF." };
  }
  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")
    : file.type === "application/pdf"
      ? "pdf"
      : "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext || "bin"}`;
  const { error } = await supabase.storage
    .from("ricevute")
    .upload(path, file, { contentType: file.type || undefined });
  if (error) return { error: `Errore caricamento ricevuta: ${error.message}` };
  return { path };
}

export async function createIntervento(
  _prev: InterventoFormState,
  formData: FormData,
): Promise<InterventoFormState> {
  const mezzoId = String(formData.get("mezzo_id") ?? "");
  if (!mezzoId) return { error: "Mezzo non trovato." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: mezzo } = await supabase
    .from("mezzi")
    .select("categoria")
    .eq("id", mezzoId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!mezzo) return { error: "Mezzo non trovato." };

  const config = CONFIG_PER_CATEGORIA[mezzo.categoria as CategoriaMezzo];

  const data = String(formData.get("data") ?? "").trim();
  if (!data) return { error: "La data è obbligatoria." };

  const tipo = String(formData.get("tipo") ?? "").trim();
  if (!tipo) return { error: "Il tipo di intervento è obbligatorio." };

  const costoRaw = String(formData.get("costo") ?? "").trim();
  const costo = costoRaw === "" ? null : numeroNonNegativo(costoRaw);
  if (costo === null) return { error: "Inserisci un costo valido." };

  // Valore d'uso: solo per le categorie che tracciano km/ore.
  let valore_uso: number | null = null;
  if (config.metrica !== "nessuna") {
    const raw = String(formData.get("valore_uso") ?? "").trim();
    if (raw !== "") {
      valore_uso = numeroNonNegativo(raw);
      if (valore_uso === null) return { error: "Valore d'uso non valido." };
    }
  }

  // Prossima scadenza (opzionale), coerente con la categoria.
  const scadTipo = String(
    formData.get("prossima_scadenza_tipo") ?? "",
  ) as TipoScadenza | "";
  let prossima_scadenza_tipo: TipoScadenza | null = null;
  let prossima_scadenza_data: string | null = null;
  let prossima_scadenza_valore_uso: number | null = null;

  if (scadTipo === "data" || scadTipo === "uso") {
    if (!config.scadenze.includes(scadTipo)) {
      return { error: "Tipo di scadenza non valido per questo mezzo." };
    }
    prossima_scadenza_tipo = scadTipo;

    if (scadTipo === "data") {
      prossima_scadenza_data = String(
        formData.get("prossima_scadenza_data") ?? "",
      ).trim();
      if (!prossima_scadenza_data) {
        return { error: "Indica la data della prossima scadenza." };
      }
    } else {
      const raw = String(
        formData.get("prossima_scadenza_valore_uso") ?? "",
      ).trim();
      prossima_scadenza_valore_uso = raw === "" ? null : numeroNonNegativo(raw);
      if (prossima_scadenza_valore_uso === null) {
        return { error: "Indica il valore (km/ore) della prossima scadenza." };
      }
    }
  }

  // Foto ricevuta (opzionale).
  let ricevuta_url: string | null = null;
  const file = formData.get("ricevuta");
  if (file instanceof File && file.size > 0) {
    const esito = await caricaRicevuta(supabase, user.id, file);
    if ("error" in esito) return { error: esito.error };
    ricevuta_url = esito.path;
  }

  const { error } = await supabase.from("interventi").insert({
    mezzo_id: mezzoId,
    user_id: user.id,
    data,
    tipo,
    valore_uso,
    costo,
    officina: testo(formData, "officina"),
    note: testo(formData, "note"),
    ricevuta_url,
    prossima_scadenza_tipo,
    prossima_scadenza_data,
    prossima_scadenza_valore_uso,
  });
  if (error) {
    if (ricevuta_url) {
      await supabase.storage.from("ricevute").remove([ricevuta_url]);
    }
    return { error: `Errore nel salvataggio: ${error.message}` };
  }

  revalidatePath(`/mezzi/${mezzoId}`);
  redirect(`/mezzi/${mezzoId}`);
}

export async function deleteIntervento(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const mezzoId = String(formData.get("mezzo_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("interventi")
    .select("ricevuta_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  await supabase
    .from("interventi")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (row?.ricevuta_url) {
    await supabase.storage.from("ricevute").remove([row.ricevuta_url]);
  }

  revalidatePath(`/mezzi/${mezzoId}`);
}
