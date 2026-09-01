-- 0002_storage.sql — Bucket per le foto (mezzi e ricevute)
-- Riferimento: requisiti.md (foto mezzo opzionale, foto ricevuta opzionale)
--
-- Convenzione path: <user_id>/<nome_file>  → la RLS controlla che la prima
-- cartella del path coincida con l'utente autenticato.

insert into storage.buckets (id, name, public)
values
  ('foto-mezzi', 'foto-mezzi', false),
  ('ricevute',   'ricevute',   false)
on conflict (id) do nothing;

create policy "foto_mezzi_proprio" on storage.objects
  for all
  using (
    bucket_id = 'foto-mezzi'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'foto-mezzi'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "ricevute_proprio" on storage.objects
  for all
  using (
    bucket_id = 'ricevute'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'ricevute'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
