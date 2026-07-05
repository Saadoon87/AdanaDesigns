create extension if not exists pgcrypto;

create schema if not exists private;

grant usage on schema private to authenticated;

create type public.product_category as enum (
  'necklace',
  'bracelet',
  'ring',
  'earrings',
  'anklet',
  'set',
  'other'
);

create type public.product_status as enum (
  'draft',
  'available',
  'low_stock',
  'sold_out',
  'archived'
);

create type public.payment_status as enum (
  'unpaid',
  'partially_paid',
  'paid'
);

create type public.order_status as enum (
  'draft',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
);

create type public.shipping_status as enum (
  'not_shipped',
  'preparing',
  'shipped',
  'delivered',
  'failed',
  'returned'
);

create type public.expense_category as enum (
  'materials',
  'packaging',
  'shipping',
  'ads',
  'tools',
  'other'
);

create table public.allowed_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category public.product_category not null default 'other',
  sku text unique,
  cost_price numeric(12, 2) not null default 0 check (cost_price >= 0),
  selling_price numeric(12, 2) not null default 0 check (selling_price >= 0),
  quantity_available integer not null default 0 check (quantity_available >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  quantity_sold integer not null default 0 check (quantity_sold >= 0),
  status public.product_status not null default 'draft',
  main_image_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_path text not null,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  instagram_username text,
  facebook_name text,
  address text,
  city text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  order_date date not null default current_date,
  subtotal numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  shipping_fee numeric(12, 2) not null default 0 check (shipping_fee >= 0),
  total_amount numeric(12, 2) not null default 0,
  total_cost numeric(12, 2) not null default 0,
  profit numeric(12, 2) not null default 0,
  payment_status public.payment_status not null default 'unpaid',
  order_status public.order_status not null default 'draft',
  stock_deducted_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sales_order_items (
  id uuid primary key default gen_random_uuid(),
  sales_order_id uuid not null references public.sales_orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null default 0,
  unit_cost numeric(12, 2) not null default 0,
  total_price numeric(12, 2) not null default 0,
  total_cost numeric(12, 2) not null default 0,
  profit numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  sales_order_id uuid not null unique references public.sales_orders(id) on delete cascade,
  shipping_company text,
  tracking_number text,
  shipping_status public.shipping_status not null default 'not_shipped',
  shipped_date date,
  delivered_date date,
  address_snapshot text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  category public.expense_category not null default 'other',
  amount numeric(12, 2) not null check (amount >= 0),
  description text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_products_updated_at
before update on public.products
for each row execute function private.set_updated_at();

create trigger set_customers_updated_at
before update on public.customers
for each row execute function private.set_updated_at();

create trigger set_sales_orders_updated_at
before update on public.sales_orders
for each row execute function private.set_updated_at();

create trigger set_shipments_updated_at
before update on public.shipments
for each row execute function private.set_updated_at();

create trigger set_expenses_updated_at
before update on public.expenses
for each row execute function private.set_updated_at();

create or replace function private.is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.allowed_users
    where lower(email) = lower((auth.jwt() ->> 'email'))
  );
$$;

revoke all on function private.is_allowed_user() from public;
grant execute on function private.is_allowed_user() to authenticated;

alter table public.allowed_users enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.customers enable row level security;
alter table public.sales_orders enable row level security;
alter table public.sales_order_items enable row level security;
alter table public.shipments enable row level security;
alter table public.expenses enable row level security;

create policy "Allowed users can read allowlist"
on public.allowed_users for select
to authenticated
using (private.is_allowed_user());

create policy "Allowed users read products"
on public.products for select
to authenticated
using (private.is_allowed_user());

create policy "Allowed users write products"
on public.products for all
to authenticated
using (private.is_allowed_user())
with check (private.is_allowed_user());

create policy "Allowed users read product images"
on public.product_images for select
to authenticated
using (private.is_allowed_user());

create policy "Allowed users write product images"
on public.product_images for all
to authenticated
using (private.is_allowed_user())
with check (private.is_allowed_user());

create policy "Allowed users read customers"
on public.customers for select
to authenticated
using (private.is_allowed_user());

create policy "Allowed users write customers"
on public.customers for all
to authenticated
using (private.is_allowed_user())
with check (private.is_allowed_user());

create policy "Allowed users read orders"
on public.sales_orders for select
to authenticated
using (private.is_allowed_user());

create policy "Allowed users write orders"
on public.sales_orders for all
to authenticated
using (private.is_allowed_user())
with check (private.is_allowed_user());

create policy "Allowed users read order items"
on public.sales_order_items for select
to authenticated
using (private.is_allowed_user());

create policy "Allowed users write order items"
on public.sales_order_items for all
to authenticated
using (private.is_allowed_user())
with check (private.is_allowed_user());

create policy "Allowed users read shipments"
on public.shipments for select
to authenticated
using (private.is_allowed_user());

create policy "Allowed users write shipments"
on public.shipments for all
to authenticated
using (private.is_allowed_user())
with check (private.is_allowed_user());

create policy "Allowed users read expenses"
on public.expenses for select
to authenticated
using (private.is_allowed_user());

create policy "Allowed users write expenses"
on public.expenses for all
to authenticated
using (private.is_allowed_user())
with check (private.is_allowed_user());

create or replace function public.recalculate_order(order_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  totals record;
begin
  if not private.is_allowed_user() then
    raise exception 'not allowed';
  end if;

  select
    coalesce(sum(total_price), 0) as subtotal,
    coalesce(sum(total_cost), 0) as total_cost,
    coalesce(sum(profit), 0) as item_profit
  into totals
  from public.sales_order_items
  where sales_order_id = order_id;

  update public.sales_orders
  set
    subtotal = totals.subtotal,
    total_cost = totals.total_cost,
    total_amount = greatest(0, totals.subtotal - discount + shipping_fee),
    profit = greatest(0, totals.subtotal - discount + shipping_fee) - totals.total_cost
  where id = order_id;
end;
$$;

create or replace function public.confirm_sale(order_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  item record;
begin
  if not private.is_allowed_user() then
    raise exception 'not allowed';
  end if;

  perform public.recalculate_order(order_id);

  if exists (
    select 1 from public.sales_orders
    where id = order_id and stock_deducted_at is not null
  ) then
    update public.sales_orders
    set order_status = 'confirmed'
    where id = order_id;
    return;
  end if;

  for item in
    select product_id, quantity
    from public.sales_order_items
    where sales_order_id = order_id and product_id is not null
    for update
  loop
    update public.products
    set
      quantity_available = quantity_available - item.quantity,
      quantity_sold = quantity_sold + item.quantity,
      status = case
        when quantity_available - item.quantity <= 0 then 'sold_out'::public.product_status
        when quantity_available - item.quantity <= 2 then 'low_stock'::public.product_status
        else 'available'::public.product_status
      end
    where id = item.product_id
      and quantity_available >= item.quantity;

    if not found then
      raise exception 'Insufficient stock for product %', item.product_id;
    end if;
  end loop;

  update public.sales_orders
  set order_status = 'confirmed', stock_deducted_at = now()
  where id = order_id;

  insert into public.shipments (sales_order_id)
  values (order_id)
  on conflict (sales_order_id) do nothing;
end;
$$;

create or replace function public.reverse_sale(order_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  item record;
begin
  if not private.is_allowed_user() then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1 from public.sales_orders
    where id = order_id and stock_deducted_at is not null
  ) then
    update public.sales_orders
    set order_status = 'cancelled'
    where id = order_id;
    return;
  end if;

  for item in
    select product_id, quantity
    from public.sales_order_items
    where sales_order_id = order_id and product_id is not null
  loop
    update public.products
    set
      quantity_available = quantity_available + item.quantity,
      quantity_sold = greatest(0, quantity_sold - item.quantity),
      status = case
        when quantity_available + item.quantity <= 0 then 'sold_out'::public.product_status
        when quantity_available + item.quantity <= 2 then 'low_stock'::public.product_status
        else 'available'::public.product_status
      end
    where id = item.product_id;
  end loop;

  update public.sales_orders
  set order_status = 'cancelled', stock_deducted_at = null
  where id = order_id;
end;
$$;

grant execute on function public.recalculate_order(uuid) to authenticated;
grant execute on function public.confirm_sale(uuid) to authenticated;
grant execute on function public.reverse_sale(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', false)
on conflict (id) do nothing;

create policy "Allowed users read product image objects"
on storage.objects for select
to authenticated
using (bucket_id = 'product-images' and private.is_allowed_user());

create policy "Allowed users upload product image objects"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and private.is_allowed_user());

create policy "Allowed users update product image objects"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and private.is_allowed_user())
with check (bucket_id = 'product-images' and private.is_allowed_user());

create policy "Allowed users delete product image objects"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and private.is_allowed_user());

create index products_status_idx on public.products(status);
create index products_category_idx on public.products(category);
create index products_name_idx on public.products using gin (to_tsvector('simple', name));
create index customers_name_idx on public.customers using gin (to_tsvector('simple', name));
create index orders_date_idx on public.sales_orders(order_date desc);
create index shipments_status_idx on public.shipments(shipping_status);
create index expenses_date_idx on public.expenses(expense_date desc);
