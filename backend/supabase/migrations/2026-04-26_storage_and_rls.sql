-- Supabase setup for EL Passkit frontend (anon client access for MVP)

-- Required schema additions for the current frontend implementation
alter table wallet_templates
  add column if not exists barcode_format text not null default 'PKBarcodeFormatQR';

alter table wallet_passes
  add column if not exists downloads integer not null default 0;

-- Enable RLS for app tables
alter table customers enable row level security;
alter table wallet_templates enable row level security;
alter table wallet_passes enable row level security;
alter table point_transactions enable row level security;

-- MVP policies: allow anon and authenticated read/write access
-- NOTE: For production, scope these policies by user / tenant.
drop policy if exists customers_select_all on customers;
create policy customers_select_all
on customers for select
using (true);

drop policy if exists customers_insert_all on customers;
create policy customers_insert_all
on customers for insert
with check (true);

drop policy if exists customers_update_all on customers;
create policy customers_update_all
on customers for update
using (true)
with check (true);

drop policy if exists wallet_templates_select_all on wallet_templates;
create policy wallet_templates_select_all
on wallet_templates for select
using (true);

drop policy if exists wallet_templates_insert_all on wallet_templates;
create policy wallet_templates_insert_all
on wallet_templates for insert
with check (true);

drop policy if exists wallet_templates_update_all on wallet_templates;
create policy wallet_templates_update_all
on wallet_templates for update
using (true)
with check (true);

drop policy if exists wallet_passes_select_all on wallet_passes;
create policy wallet_passes_select_all
on wallet_passes for select
using (true);

drop policy if exists wallet_passes_insert_all on wallet_passes;
create policy wallet_passes_insert_all
on wallet_passes for insert
with check (true);

drop policy if exists wallet_passes_update_all on wallet_passes;
create policy wallet_passes_update_all
on wallet_passes for update
using (true)
with check (true);

drop policy if exists point_transactions_select_all on point_transactions;
create policy point_transactions_select_all
on point_transactions for select
using (true);

drop policy if exists point_transactions_insert_all on point_transactions;
create policy point_transactions_insert_all
on point_transactions for insert
with check (true);

-- Storage buckets for pass assets and generated pkpass files
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'pass-assets',
    'pass-assets',
    true,
    10485760,
    array['image/png', 'image/jpeg', 'image/svg+xml', 'application/json']
  ),
  (
    'pass-packages',
    'pass-packages',
    false,
    52428800,
    array['application/vnd.apple.pkpass', 'application/zip']
  )
on conflict (id) do nothing;

-- Storage RLS policies (MVP-open)
drop policy if exists pass_assets_public_read on storage.objects;
create policy pass_assets_public_read
on storage.objects for select
using (bucket_id = 'pass-assets');

drop policy if exists pass_assets_insert_all on storage.objects;
create policy pass_assets_insert_all
on storage.objects for insert
with check (bucket_id = 'pass-assets');

drop policy if exists pass_assets_update_all on storage.objects;
create policy pass_assets_update_all
on storage.objects for update
using (bucket_id = 'pass-assets')
with check (bucket_id = 'pass-assets');

drop policy if exists pass_assets_delete_all on storage.objects;
create policy pass_assets_delete_all
on storage.objects for delete
using (bucket_id = 'pass-assets');

drop policy if exists pass_packages_read_all on storage.objects;
create policy pass_packages_read_all
on storage.objects for select
using (bucket_id = 'pass-packages');

drop policy if exists pass_packages_insert_all on storage.objects;
create policy pass_packages_insert_all
on storage.objects for insert
with check (bucket_id = 'pass-packages');

drop policy if exists pass_packages_update_all on storage.objects;
create policy pass_packages_update_all
on storage.objects for update
using (bucket_id = 'pass-packages')
with check (bucket_id = 'pass-packages');

drop policy if exists pass_packages_delete_all on storage.objects;
create policy pass_packages_delete_all
on storage.objects for delete
using (bucket_id = 'pass-packages');
