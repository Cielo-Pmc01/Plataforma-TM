-- Registro de cambios del Editor de anuncios (Plataforma TM).
-- Cada vez que se edita un anuncio (mensaje de bienvenida, textos) queda anotado qué cambió, quién y cuándo,
-- y la creatividad anterior para poder "Deshacer". Solo lo pueden leer y escribir los administradores.

create table if not exists platform.ad_changes (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  user_id              uuid not null default auth.uid() references auth.users (id),
  user_email           text,
  ad_account_id        text not null,
  ad_id                text not null,
  ad_name              text,
  previous_creative_id text not null,
  new_creative_id      text,
  changes              jsonb not null default '{}'::jsonb,
  status               text not null check (status in ('applied', 'failed', 'undone')),
  error                text,
  undone_at            timestamptz,
  undone_by            uuid references auth.users (id)
);

create index if not exists ad_changes_ad_idx on platform.ad_changes (ad_id, created_at desc);

alter table platform.ad_changes enable row level security;

create policy ad_changes_select_admin on platform.ad_changes
  for select to authenticated using (platform.is_admin());

create policy ad_changes_insert_admin on platform.ad_changes
  for insert to authenticated with check (platform.is_admin());

create policy ad_changes_update_admin on platform.ad_changes
  for update to authenticated using (platform.is_admin()) with check (platform.is_admin());

grant select, insert, update on platform.ad_changes to authenticated;
