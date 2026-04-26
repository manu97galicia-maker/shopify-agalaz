-- Tracks one-time credit pack purchases via Shopify's appPurchaseOneTimeCreate
-- so we can credit the partner exactly once per Shopify charge_id.
create table if not exists partner_credit_purchases (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners(id) on delete cascade,
  charge_id text not null unique,
  credits int not null,
  amount_usd numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists partner_credit_purchases_partner_idx
  on partner_credit_purchases(partner_id);

-- Deny-by-default for anon/authenticated keys. Server-side writes use the
-- service_role key (via createAdminClient) which bypasses RLS.
alter table partner_credit_purchases enable row level security;
