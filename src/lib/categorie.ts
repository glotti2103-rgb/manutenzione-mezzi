import type { CategoriaMezzo, MetricaUso, TipoScadenza } from "./types";

export interface ConfigCategoria {
  valore: CategoriaMezzo;
  label: string;
  metrica: MetricaUso;
  /** Nomi dei campi specifici (= colonne DB) mostrati nel form per questa categoria. */
  campiSpecifici: string[];
  /** Modi ammessi per esprimere la "prossima scadenza" di un intervento (vedi requisiti.md). */
  scadenze: TipoScadenza[];
}

export const CATEGORIE: ConfigCategoria[] = [
  {
    valore: "auto",
    label: "Auto",
    metrica: "km",
    campiSpecifici: ["targa"],
    scadenze: ["data", "uso"],
  },
  {
    valore: "jeep",
    label: "Jeep / fuoristrada",
    metrica: "km",
    campiSpecifici: ["targa"],
    scadenze: ["data", "uso"],
  },
  {
    valore: "scooter",
    label: "Motorino / scooter",
    metrica: "km",
    campiSpecifici: ["targa", "cilindrata"],
    scadenze: ["data", "uso"],
  },
  {
    valore: "bicicletta",
    label: "Bicicletta",
    metrica: "km",
    campiSpecifici: ["tipo_bici"],
    scadenze: ["uso"],
  },
  {
    valore: "gommone",
    label: "Gommone",
    metrica: "ore",
    campiSpecifici: ["numero_immatricolazione", "marca_motore", "potenza_motore"],
    scadenze: ["uso"],
  },
  {
    valore: "sci",
    label: "Sci",
    metrica: "nessuna",
    campiSpecifici: ["lunghezza"],
    scadenze: ["data"],
  },
  {
    valore: "carrello",
    label: "Carrello rimorchio",
    metrica: "nessuna",
    campiSpecifici: ["targa", "portata_massima"],
    scadenze: ["data"],
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

/** Etichetta per il campo "valore d'uso" di un intervento. */
export const VALORE_USO_LABEL: Record<MetricaUso, string> = {
  km: "Chilometri (km)",
  ore: "Ore motore",
  nessuna: "",
};

/** Unità breve, per mostrare i valori nello storico. */
export const UNITA_USO: Record<MetricaUso, string> = {
  km: "km",
  ore: "ore",
  nessuna: "",
};
