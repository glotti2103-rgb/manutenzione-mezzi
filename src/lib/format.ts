const eur = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const numero = new Intl.NumberFormat("it-IT");

const dataBreve = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const formatEuro = (n: number) => eur.format(n);

export const formatNumero = (n: number) => numero.format(n);

/** Formatta una data ISO (`YYYY-MM-DD`) senza slittamenti di fuso orario. */
export const formatData = (iso: string) =>
  dataBreve.format(new Date(`${iso}T00:00:00`));

/** Data odierna in formato `YYYY-MM-DD`, ora locale. */
export const oggiISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
