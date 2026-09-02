import { CONFIG_PER_CATEGORIA, UNITA_USO } from "@/lib/categorie";
import { formatData, formatNumero, oggiISO } from "@/lib/format";
import type { Intervento, Mezzo } from "@/lib/types";

export type StatoScadenza = "ritardo" | "imminente" | "futura";

export interface ScadenzaCalcolata {
  interventoId: string;
  mezzoId: string;
  mezzoNome: string;
  categoriaLabel: string;
  tipoIntervento: string;
  tipo: "data" | "uso";
  dettaglio: string;
  stato: StatoScadenza;
  /** Chiave di ordinamento: negativa se scaduta (più negativa = più urgente). */
  urgenza: number;
}

const RANK: Record<StatoScadenza, number> = {
  ritardo: 0,
  imminente: 1,
  futura: 2,
};

/** Soglia "imminente" per le scadenze a uso, per metrica. */
const SOGLIA_USO = { km: 500, ore: 20, nessuna: 0 } as const;
/** Soglia "imminente" per le scadenze a data (giorni). */
const SOGLIA_GIORNI = 30;

const giorni = (n: number) => `${n} ${Math.abs(n) === 1 ? "giorno" : "giorni"}`;

export function calcolaScadenze(
  mezzi: Mezzo[],
  interventi: Intervento[],
): ScadenzaCalcolata[] {
  const perMezzo = new Map(mezzi.map((m) => [m.id, m]));

  // "Uso attuale" stimato = valore d'uso più alto registrato per il mezzo.
  const usoAttuale = new Map<string, number>();
  for (const i of interventi) {
    if (i.valore_uso != null) {
      usoAttuale.set(
        i.mezzo_id,
        Math.max(usoAttuale.get(i.mezzo_id) ?? 0, i.valore_uso),
      );
    }
  }

  const oggi = new Date(`${oggiISO()}T00:00:00`).getTime();
  const risultati: ScadenzaCalcolata[] = [];

  for (const i of interventi) {
    if (!i.prossima_scadenza_tipo) continue;
    const mezzo = perMezzo.get(i.mezzo_id);
    if (!mezzo) continue;

    const cfg = CONFIG_PER_CATEGORIA[mezzo.categoria];
    const unita = UNITA_USO[cfg.metrica];
    const base = {
      interventoId: i.id,
      mezzoId: i.mezzo_id,
      mezzoNome: mezzo.nome,
      categoriaLabel: cfg.label,
      tipoIntervento: i.tipo,
    };

    if (i.prossima_scadenza_tipo === "data" && i.prossima_scadenza_data) {
      const target = new Date(
        `${i.prossima_scadenza_data}T00:00:00`,
      ).getTime();
      const g = Math.round((target - oggi) / 86_400_000);
      const stato: StatoScadenza =
        g < 0 ? "ritardo" : g <= SOGLIA_GIORNI ? "imminente" : "futura";
      const dettaglio =
        g < 0
          ? `In ritardo di ${giorni(-g)} (${formatData(i.prossima_scadenza_data)})`
          : g === 0
            ? `Scade oggi (${formatData(i.prossima_scadenza_data)})`
            : `Tra ${giorni(g)} (${formatData(i.prossima_scadenza_data)})`;
      risultati.push({ ...base, tipo: "data", dettaglio, stato, urgenza: g });
      continue;
    }

    if (
      i.prossima_scadenza_tipo === "uso" &&
      i.prossima_scadenza_valore_uso != null
    ) {
      const target = i.prossima_scadenza_valore_uso;
      const attuale = usoAttuale.get(i.mezzo_id) ?? 0;
      const mancano = target - attuale;
      const soglia = SOGLIA_USO[cfg.metrica];
      const stato: StatoScadenza =
        mancano <= 0 ? "ritardo" : mancano <= soglia ? "imminente" : "futura";
      const dettaglio =
        mancano <= 0
          ? `Superata di ${formatNumero(-mancano)} ${unita} (soglia ${formatNumero(target)} ${unita})`
          : `Tra ${formatNumero(mancano)} ${unita} (soglia ${formatNumero(target)} ${unita})`;
      risultati.push({
        ...base,
        tipo: "uso",
        dettaglio,
        stato,
        urgenza: mancano,
      });
    }
  }

  risultati.sort(
    (a, b) => RANK[a.stato] - RANK[b.stato] || a.urgenza - b.urgenza,
  );
  return risultati;
}
