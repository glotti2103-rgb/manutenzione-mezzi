// Modello dati — rispecchia lo schema del DB (colonne snake_case).
// Vedi supabase/migrations/0001_init.sql e requisiti.md

export type CategoriaMezzo =
  | "auto"
  | "jeep"
  | "scooter"
  | "bicicletta"
  | "gommone"
  | "sci"
  | "carrello";

/** Metrica d'uso associata a una categoria di mezzo. */
export type MetricaUso = "km" | "ore" | "nessuna";

export type TipoBici = "mtb" | "corsa" | "citta" | "ebike";

export type TipoScadenza = "data" | "uso";

export interface Mezzo {
  id: string;
  user_id: string;

  // Campi comuni
  nome: string;
  categoria: CategoriaMezzo;
  marca: string | null;
  modello: string | null;
  anno: number | null;
  foto_url: string | null;

  // Campi specifici per categoria (valorizzati solo quando pertinenti)
  targa: string | null;
  cilindrata: number | null;
  tipo_bici: TipoBici | null;
  numero_immatricolazione: string | null;
  marca_motore: string | null;
  potenza_motore: number | null;
  lunghezza: number | null;
  portata_massima: number | null;

  created_at: string;
  updated_at: string;
}

export interface Intervento {
  id: string;
  mezzo_id: string;
  user_id: string;

  data: string; // ISO date
  tipo: string; // testo libero
  valore_uso: number | null; // km o ore motore al momento
  costo: number | null;
  officina: string | null;
  note: string | null;
  ricevuta_url: string | null;

  prossima_scadenza_tipo: TipoScadenza | null;
  prossima_scadenza_data: string | null;
  prossima_scadenza_valore_uso: number | null;

  created_at: string;
  updated_at: string;
}
