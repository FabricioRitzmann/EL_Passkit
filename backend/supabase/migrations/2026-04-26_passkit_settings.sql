-- Globale Passkit-Parameter für pass.json und Pass-Ausgabe

create table if not exists passkit_settings (
  id uuid primary key default gen_random_uuid(),
  pass_type_identifier text not null default 'pass.el.promillo',
  team_identifier text not null default 'ABCDE12345',
  organization_name text not null default 'Egli+Vitali AG',
  logo_text text not null default 'EL Passkit',
  description text not null default 'Digitale Kundenkarte',
  contact_email text not null default 'info@example.com',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function touch_passkit_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_passkit_settings_updated_at on passkit_settings;
create trigger trg_passkit_settings_updated_at
before update on passkit_settings
for each row
execute function touch_passkit_settings_updated_at();

alter table passkit_settings enable row level security;

drop policy if exists passkit_settings_select_all on passkit_settings;
create policy passkit_settings_select_all
on passkit_settings for select
using (true);

drop policy if exists passkit_settings_insert_all on passkit_settings;
create policy passkit_settings_insert_all
on passkit_settings for insert
with check (true);

drop policy if exists passkit_settings_update_all on passkit_settings;
create policy passkit_settings_update_all
on passkit_settings for update
using (true)
with check (true);
