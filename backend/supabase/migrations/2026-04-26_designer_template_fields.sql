-- Erweiterung für vollumfänglichen Passkit-Designer

alter table wallet_templates
  add column if not exists barcode_message text,
  add column if not exists logo_text text,
  add column if not exists suppress_strip_shine boolean not null default false,
  add column if not exists sharing_prohibited boolean not null default false,
  add column if not exists primary_fields jsonb not null default '[]'::jsonb,
  add column if not exists secondary_fields jsonb not null default '[]'::jsonb,
  add column if not exists auxiliary_fields jsonb not null default '[]'::jsonb,
  add column if not exists back_fields jsonb not null default '[]'::jsonb,
  add column if not exists locations jsonb not null default '[]'::jsonb,
  add column if not exists beacons jsonb not null default '[]'::jsonb;
