-- 0001_init.sql — Schema iniziale "App Manutenzione Mezzi"
-- Riferimento: requisiti.md
--
-- Nota multi-utente: anche con un solo utente, ogni riga è collegata ad auth.users
-- tramite user_id, e la Row Level Security limita l'accesso al proprietario.

-- ============================================================
-- Enum
-- ============================================================

create type categoria_mezzo as enum (
  'auto', 'jeep', 'scooter', 'bicicletta', 'gommone', 'sci', 'carrello'
);

create type tipo_bici as enum ('mtb', 'corsa', 'citta', 'ebike');

-- Come è espressa la "prossima scadenza" di un intervento.
create type tipo_scadenza as enum ('data', 'uso');

-- ============================================================
-- Funzione di supporto: aggiorna updated_at ad ogni UPDATE
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Tabella: mezzi
-- ============================================================

create table mezzi (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,

  -- Campi comuni a ogni categoria
  nome          text not null,
  categoria     categoria_mezzo not null,
  marca         text,
  modello       text,
  anno          smallint check (anno between 1900 and 2100),
  foto_url      text,

  -- Campi specifici per categoria: valorizzati solo quando pertinenti.
  -- Il form mostra solo i campi della categoria scelta (vedi requisiti.md).
  targa                   text,      -- auto, jeep, scooter, carrello
  cilindrata              integer,   -- scooter (opzionale)
  tipo_bici               tipo_bici, -- bicicletta
  numero_immatricolazione text,      -- gommone
  marca_motore            text,      -- gommone
  potenza_motore          numeric,   -- gommone
  lunghezza               numeric,   -- sci (cm)
  portata_massima         numeric,   -- carrello (kg)

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index mezzi_user_id_idx on mezzi (user_id);

create trigger mezzi_set_updated_at
  before update on mezzi
  for each row execute function set_updated_at();

-- ============================================================
-- Tabella: interventi
-- ============================================================

create table interventi (
  id            uuid primary key default gen_random_uuid(),
  mezzo_id      uuid not null references mezzi (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,

  data          date not null,
  tipo          text not null,        -- testo libero (es. "cambio olio", "tagliando")
  valore_uso    numeric,              -- km o ore motore al momento; null per sci/carrello
  costo         numeric(10, 2),
  officina      text,
  note          text,
  ricevuta_url  text,

  -- Promemoria "prossima scadenza" (opzionale): per data OPPURE per km/ore
  prossima_scadenza_tipo       tipo_scadenza,
  prossima_scadenza_data       date,
  prossima_scadenza_valore_uso numeric,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint prossima_scadenza_coerente check (
    prossima_scadenza_tipo is null
    or (prossima_scadenza_tipo = 'data' and prossima_scadenza_data is not null)
    or (prossima_scadenza_tipo = 'uso'  and prossima_scadenza_valore_uso is not null)
  )
);

create index interventi_mezzo_id_idx on interventi (mezzo_id);
create index interventi_user_id_idx on interventi (user_id);

-- Per la home: scadenze più vicine / in ritardo su tutti i mezzi.
create index interventi_prossima_scadenza_data_idx
  on interventi (prossima_scadenza_data)
  where prossima_scadenza_data is not null;

create trigger interventi_set_updated_at
  before update on interventi
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table mezzi enable row level security;
alter table interventi enable row level security;

create policy "mezzi_select_proprio" on mezzi
  for select using (auth.uid() = user_id);
create policy "mezzi_insert_proprio" on mezzi
  for insert with check (auth.uid() = user_id);
create policy "mezzi_update_proprio" on mezzi
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mezzi_delete_proprio" on mezzi
  for delete using (auth.uid() = user_id);

create policy "interventi_select_proprio" on interventi
  for select using (auth.uid() = user_id);
create policy "interventi_insert_proprio" on interventi
  for insert with check (auth.uid() = user_id);
create policy "interventi_update_proprio" on interventi
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "interventi_delete_proprio" on interventi
  for delete using (auth.uid() = user_id);
