-- Neighbourhood marketplace core
-- PostgreSQL / Supabase. Prices are always stored in the currency's minor unit
-- (for example, 1800 = $18.00), never as floating-point numbers.

create extension if not exists pgcrypto;

create type public.account_role as enum ('customer', 'vendor');
create type public.selling_unit as enum ('piece', 'pack', 'box', 'bundle', 'weight', 'volume', 'custom');
create type public.fulfilment_method as enum ('pickup_now', 'pickup_scheduled', 'delivery');
create type public.order_status as enum ('requested', 'confirmed', 'ready', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  role public.account_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  short_description text,
  store_code text not null unique,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  category text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A variant is the actual thing a customer buys. A product can have a 1-piece,
-- 3-pack, and 12-piece box without inventing separate product records.
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text,
  label text not null,                         -- e.g. "Pack of 3"
  selling_unit public.selling_unit not null,   -- piece, pack, box, etc.
  units_per_purchase numeric(12, 3) not null default 1 check (units_per_purchase > 0),
  contained_unit_label text not null default 'piece', -- e.g. loaf, stem, bar
  price_cents integer not null check (price_cents >= 0),
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  sort_order smallint not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, label),
  unique (product_id, sku)
);

-- No payment or inventory ledger is modelled: this only captures an order request
-- and the agreed physical hand-off.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  status public.order_status not null default 'requested',
  fulfilment public.fulfilment_method not null,
  scheduled_for timestamptz,
  contact_name text not null,
  contact_phone text not null,
  delivery_address text,
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (fulfilment = 'delivery' and delivery_address is not null)
    or (fulfilment <> 'delivery')
  ),
  check (
    (fulfilment = 'pickup_scheduled' and scheduled_for is not null)
    or (fulfilment <> 'pickup_scheduled')
  )
);

-- Snapshot the selected variant. This means an old order stays correct even after
-- a vendor changes a pack price, label, or availability.
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  product_name text not null,
  variant_label text not null,
  selling_unit public.selling_unit not null,
  units_per_purchase numeric(12, 3) not null check (units_per_purchase > 0),
  contained_unit_label text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  quantity integer not null check (quantity > 0)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  unique nulls not distinct (vendor_id, customer_id, product_id, order_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index products_vendor_id_idx on public.products(vendor_id);
create index product_variants_product_id_idx on public.product_variants(product_id, sort_order);
create index orders_customer_id_idx on public.orders(customer_id, created_at desc);
create index orders_vendor_id_idx on public.orders(vendor_id, created_at desc);
create index messages_conversation_id_idx on public.messages(conversation_id, created_at);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger vendors_updated_at before update on public.vendors for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger variants_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

-- Google OAuth (or any Supabase Auth provider) gets a customer profile on first sign-in.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Public marketplace catalogue; private accounts, orders, and chat.
create policy "published vendors are public" on public.vendors for select using (is_published);
create policy "published products are public" on public.products for select using (
  is_published and exists (select 1 from public.vendors v where v.id = vendor_id and v.is_published)
);
create policy "available variants are public" on public.product_variants for select using (
  is_available and exists (select 1 from public.products p join public.vendors v on v.id = p.vendor_id where p.id = product_id and p.is_published and v.is_published)
);
create policy "users read their profile" on public.profiles for select using (id = auth.uid());
create policy "users update their profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "customers read their orders" on public.orders for select using (customer_id = auth.uid());
create policy "vendors read their orders" on public.orders for select using (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = auth.uid()));
create policy "customers read their order items" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy "vendors read their order items" on public.order_items for select using (exists (select 1 from public.orders o join public.vendors v on v.id = o.vendor_id where o.id = order_id and v.owner_id = auth.uid()));

-- Product and variant writes are only available to the owner of that vendor.
create policy "owners manage vendors" on public.vendors for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners manage products" on public.products for all using (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = auth.uid())) with check (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = auth.uid()));
create policy "owners manage variants" on public.product_variants for all using (exists (select 1 from public.products p join public.vendors v on v.id = p.vendor_id where p.id = product_id and v.owner_id = auth.uid())) with check (exists (select 1 from public.products p join public.vendors v on v.id = p.vendor_id where p.id = product_id and v.owner_id = auth.uid()));
create policy "customers read their conversations" on public.conversations for select using (customer_id = auth.uid());
create policy "vendors read their conversations" on public.conversations for select using (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = auth.uid()));
create policy "customers start conversations" on public.conversations for insert with check (customer_id = auth.uid());
create policy "members read messages" on public.messages for select using (exists (select 1 from public.conversations c left join public.vendors v on v.id = c.vendor_id where c.id = conversation_id and (c.customer_id = auth.uid() or v.owner_id = auth.uid())));
create policy "members send messages" on public.messages for insert with check (sender_id = auth.uid() and exists (select 1 from public.conversations c left join public.vendors v on v.id = c.vendor_id where c.id = conversation_id and (c.customer_id = auth.uid() or v.owner_id = auth.uid())));

-- Orders should be written through a server-side RPC that copies variant prices
-- into order_items. Do not give browser clients insert rights to order_items.
create or replace function public.place_marketplace_order(
  p_vendor_id uuid,
  p_fulfilment public.fulfilment_method,
  p_contact_name text,
  p_contact_phone text,
  p_items jsonb,
  p_scheduled_for timestamptz default null,
  p_delivery_address text default null,
  p_customer_note text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  new_order_id uuid;
  item jsonb;
  variant public.product_variants%rowtype;
begin
  if auth.uid() is null then raise exception 'Sign in is required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'At least one item is required'; end if;

  insert into public.orders (customer_id, vendor_id, fulfilment, scheduled_for, contact_name, contact_phone, delivery_address, customer_note)
  values (auth.uid(), p_vendor_id, p_fulfilment, p_scheduled_for, p_contact_name, p_contact_phone, p_delivery_address, p_customer_note)
  returning id into new_order_id;

  for item in select value from jsonb_array_elements(p_items) loop
    select pv.* into variant
    from public.product_variants pv join public.products p on p.id = pv.product_id
    where pv.id = (item->>'variant_id')::uuid and p.vendor_id = p_vendor_id and p.is_published and pv.is_available;
    if not found then raise exception 'An item is unavailable or does not belong to this shop'; end if;
    if coalesce((item->>'quantity')::integer, 0) < 1 then raise exception 'Quantity must be positive'; end if;

    insert into public.order_items (order_id, product_id, variant_id, product_name, variant_label, selling_unit, units_per_purchase, contained_unit_label, unit_price_cents, currency, quantity)
    select new_order_id, p.id, variant.id, p.name, variant.label, variant.selling_unit, variant.units_per_purchase, variant.contained_unit_label, variant.price_cents, variant.currency, (item->>'quantity')::integer
    from public.products p where p.id = variant.product_id;
  end loop;

  return new_order_id;
end;
$$;

grant execute on function public.place_marketplace_order(uuid, public.fulfilment_method, text, text, jsonb, timestamptz, text, text) to authenticated;
