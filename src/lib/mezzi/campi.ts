import { CONFIG_PER_CATEGORIA } from "@/lib/categorie";
import type { CategoriaMezzo } from "@/lib/types";

export interface CampoSpecifico {
  name: string; // = colonna DB
  label: string;
  input: "text" | "number" | "select";
  required: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  help?: string;
}

export const CAMPI_SPECIFICI: Record<string, CampoSpecifico> = {
  targa: { name: "targa", label: "Targa", input: "text", required: true },
  cilindrata: {
    name: "cilindrata",
    label: "Cilindrata (cc)",
    input: "number",
    required: false,
    min: 0,
    step: 1,
    help: "Opzionale",
  },
  tipo_bici: {
    name: "tipo_bici",
    label: "Tipo di bici",
    input: "select",
    required: true,
    options: [
      { value: "mtb", label: "MTB" },
      { value: "corsa", label: "Corsa" },
      { value: "citta", label: "Città" },
      { value: "ebike", label: "E-bike" },
    ],
  },
  numero_immatricolazione: {
    name: "numero_immatricolazione",
    label: "Numero di immatricolazione",
    input: "text",
    required: true,
  },
  marca_motore: {
    name: "marca_motore",
    label: "Marca motore",
    input: "text",
    required: true,
  },
  potenza_motore: {
    name: "potenza_motore",
    label: "Potenza motore (CV)",
    input: "number",
    required: true,
    min: 0,
  },
  lunghezza: {
    name: "lunghezza",
    label: "Lunghezza (cm)",
    input: "number",
    required: true,
    min: 0,
  },
  portata_massima: {
    name: "portata_massima",
    label: "Portata massima (kg)",
    input: "number",
    required: true,
    min: 0,
  },
};

/** Campi numerici: vanno convertiti a Number (o null) prima di salvare. */
export const CAMPI_NUMERICI = new Set([
  "anno",
  "cilindrata",
  "potenza_motore",
  "lunghezza",
  "portata_massima",
]);

export function campiPerCategoria(categoria: CategoriaMezzo): CampoSpecifico[] {
  return CONFIG_PER_CATEGORIA[categoria].campiSpecifici.map(
    (key) => CAMPI_SPECIFICI[key],
  );
}
