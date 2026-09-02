import type { CategoriaMezzo, MetricaUso } from "./types";

export interface ConfigCategoria {
  valore: CategoriaMezzo;
  label: string;
  metrica: MetricaUso;
  /** Nomi dei campi specifici (= colonne DB) mostrati nel form per questa categoria. */
  campiSpecifici: string[];
}

export const CATEGORIE: ConfigCategoria[] = [
  { valore: "auto", label: "Auto", metrica: "km", campiSpecifici: ["targa"] },
  {
    valore: "jeep",
    label: "Jeep / fuoristrada",
    metrica: "km",
    campiSpecifici: ["targa"],
  },
  {
    valore: "scooter",
    label: "Motorino / scooter",
    metrica: "km",
    campiSpecifici: ["targa", "cilindrata"],
  },
  {
    valore: "bicicletta",
    label: "Bicicletta",
    metrica: "km",
    campiSpecifici: ["tipo_bici"],
  },
  {
    valore: "gommone",
    label: "Gommone",
    metrica: "ore",
    campiSpecifici: ["numero_immatricolazione", "marca_motore", "potenza_motore"],
  },
  {
    valore: "sci",
    label: "Sci",
    metrica: "nessuna",
    campiSpecifici: ["lunghezza"],
  },
  {
    valore: "carrello",
    label: "Carrello rimorchio",
    metrica: "nessuna",
    campiSpecifici: ["targa", "portata_massima"],
  },
];

export const CONFIG_PER_CATEGORIA: Record<CategoriaMezzo, ConfigCategoria> =
  Object.fromEntries(CATEGORIE.map((c) => [c.valore, c])) as Record<
    CategoriaMezzo,
    ConfigCategoria
  >;

export const METRICA_LABEL: Record<MetricaUso, string> = {
  km: "chilometri",
  ore: "ore motore",
  nessuna: "nessuna metrica d'uso",
};
