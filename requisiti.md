# Requisiti — App Manutenzione Mezzi

## Obiettivo

App web personale per tenere traccia di tutti gli interventi di manutenzione dei miei mezzi. Un solo utente (io), accesso da più dispositivi (computer e telefono), dati salvati online così non si perdono e sono sempre aggiornati.

## 1. Mezzi da gestire

I mezzi appartengono a queste categorie: **auto, jeep/fuoristrada, motorino/scooter, bicicletta, gommone, sci, carrello rimorchio**.

Campi comuni a ogni mezzo, qualunque sia la categoria:

- Nome/soprannome (es. "Panda gialla", "Defender") — per riconoscerlo a colpo d'occhio
- Categoria (una di quelle sopra)
- Marca
- Modello
- Anno
- Foto (opzionale)

Ogni categoria ha poi una metrica d'uso diversa e qualche campo specifico — il form di inserimento deve mostrare solo i campi pertinenti alla categoria scelta:

| Categoria | Metrica d'uso | Campi specifici |
|---|---|---|
| Auto | km | targa |
| Jeep / fuoristrada | km | targa |
| Motorino / scooter | km | targa, cilindrata (opzionale) |
| Bicicletta | km (opzionale, spesso non tracciato) | tipo (mtb, corsa, città, e-bike) |
| Gommone | ore motore | numero di immatricolazione, marca e potenza del motore |
| Sci | nessuna (uso stagionale, non km/ore) | lunghezza |
| Carrello rimorchio | nessuna (revisione a scadenza fissa, non km) | targa, portata massima |

## 2. Interventi di manutenzione

Per ogni intervento registrato su un mezzo, questi dati:

- Data dell'intervento
- Tipo di intervento (testo libero: es. "cambio olio", "tagliando", "revisione", "sciolinatura", "cambio gomme", "cambio catena")
- Valore d'uso al momento (km o ore motore — campo vuoto/non richiesto per le categorie che non lo usano, es. sci e carrello)
- Costo
- Officina / fornitore (opzionale)
- Note (opzionale)
- Foto della ricevuta (opzionale)

## 3. Promemoria scadenze

Ogni intervento ha un campo opzionale "prossima scadenza", espresso nel modo più adatto al mezzo:

- **Per data** (es. tra 6 mesi) → auto, jeep, motorino, carrello rimorchio (revisione), sci (sciolinatura a inizio stagione)
- **Per km/ore** (es. tra 5.000 km o tra 100 ore) → auto, jeep, motorino, bicicletta, gommone

La schermata iniziale dell'app deve mostrare le scadenze più vicine su tutti i mezzi insieme, evidenziando quelle già in ritardo.

## Note per Claude Code

- Anche se oggi l'app ha un solo utente, i dati vanno strutturati come se fossero multi-utente (ogni mezzo collegato a uno `user_id`), nel caso in futuro venga condivisa o usata da più persone.
- Il form per aggiungere/modificare un mezzo deve adattarsi alla categoria selezionata, mostrando solo i campi pertinenti (es. niente "targa" per la bicicletta, niente "km" per gli sci).
- Il tipo di intervento è testo libero: non serve un elenco fisso di opzioni, dato che varia molto tra le categorie.
