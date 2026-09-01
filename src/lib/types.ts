// Modello dati di base — vedi requisiti.md

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

export interface Mezzo {
  id: string;
  /** Anche con un solo utente, i mezzi sono collegati a un utente (vedi requisiti.md). */
  userId: string;
  nome: string;
  categoria: CategoriaMezzo;
  marca?: string;
  modello?: string;
  anno?: number;
  fotoUrl?: string;

  // Campi specifici per categoria (solo quelli pertinenti vengono valorizzati)
  targa?: string;
  cilindrata?: number;
  tipoBici?: "mtb" | "corsa" | "citta" | "ebike";
  numeroImmatricolazione?: string;
  marcaMotore?: string;
  potenzaMotore?: number;
  lunghezza?: number;
  portataMassima?: number;
}

export type TipoScadenza = "data" | "uso";

export interface Scadenza {
  tipo: TipoScadenza;
  /** ISO date, valorizzata se tipo === "data" */
  data?: string;
  /** km oppure ore motore, valorizzata se tipo === "uso" */
  valoreUso?: number;
}

export interface Intervento {
  id: string;
  mezzoId: string;
  userId: string;
  data: string; // ISO date
  tipo: string; // testo libero
  valoreUso?: number; // km o ore motore al momento dell'intervento
  costo?: number;
  officina?: string;
  note?: string;
  ricevutaUrl?: string;
  prossimaScadenza?: Scadenza;
}
