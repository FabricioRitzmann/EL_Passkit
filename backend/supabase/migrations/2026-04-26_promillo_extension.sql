-- Erweiterung für Promillo-ähnliche Geschäftslogik auf Passkit-Basis

alter table customers
  add column if not exists points integer not null default 0,
  add column if not exists status text not null default 'Basic';

create table if not exists point_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists pass_events (
  id uuid primary key default gen_random_uuid(),
  pass_id uuid not null references wallet_passes(id) on delete cascade,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function apply_transaction_to_customer_points()
returns trigger
language plpgsql
as $$
begin
  update customers
  set points = points + new.amount
  where id = new.customer_id;

  return new;
end;
$$;

drop trigger if exists trg_point_transactions_after_insert on point_transactions;
create trigger trg_point_transactions_after_insert
after insert on point_transactions
for each row
execute function apply_transaction_to_customer_points();
