create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  customer_number text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists wallet_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pass_type text not null,
  background_color text not null,
  foreground_color text not null,
  label_color text not null,
  logo_url text,
  strip_url text,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create table if not exists wallet_passes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  template_id uuid not null references wallet_templates(id),
  serial_number text not null unique,
  pass_type_identifier text not null,
  status text not null default 'active',
  points integer not null default 0,
  barcode_value text not null,
  expires_at timestamptz,
  last_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists device_registrations (
  id uuid primary key default gen_random_uuid(),
  device_library_identifier text not null,
  push_token text not null,
  pass_type_identifier text not null,
  serial_number text not null,
  created_at timestamptz not null default now()
);
