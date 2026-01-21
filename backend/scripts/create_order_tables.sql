-- ============================================
-- 1. UTILITY FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  customer_id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text,
  created_at timestamp without time zone default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone default CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 3. ADDRESSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS addresses (
  address_id bigint generated always as identity primary key,
  customer_id bigint not null references customers(customer_id) on delete cascade,
  address_line1 text not null,
  city text,
  state text, -- optional
  zip_code text, -- optional
  created_at timestamp without time zone default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone default CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON addresses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 4. ORDERS TABLE (User Specified)
-- ============================================
create table public.orders (
  order_id bigint generated always as identity not null,
  customer_id bigint not null,
  address_id bigint not null,
  order_date timestamp without time zone null default CURRENT_TIMESTAMP,
  order_status character varying(50) null default 'PENDING'::character varying,
  total_amount numeric(10, 2) not null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint orders_pkey primary key (order_id),
  constraint fk_order_address foreign KEY (address_id) references addresses (address_id),
  constraint fk_order_customer foreign KEY (customer_id) references customers (customer_id)
) TABLESPACE pg_default;

create index IF not exists idx_orders_customer_id on public.orders using btree (customer_id) TABLESPACE pg_default;

create trigger trg_orders_updated_at BEFORE
update on orders for EACH row
execute FUNCTION set_updated_at ();

-- ============================================
-- 5. ORDER ITEMS TABLE (Normalized)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id bigint generated always as identity primary key,
  order_id bigint not null references orders(order_id) on delete cascade,
  item_id bigint not null references items(id), -- Assuming items table uses 'id'
  quantity int not null,
  price numeric(10, 2) not null, -- Price at time of purchase
  created_at timestamp without time zone default CURRENT_TIMESTAMP
);

-- ============================================
-- 6. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  payment_id bigint generated always as identity primary key,
  order_id bigint not null references orders(order_id) on delete cascade,
  amount numeric(10, 2) not null,
  payment_method character varying(50) default 'card',
  status character varying(50) default 'success',
  transaction_id text,
  payment_date timestamp without time zone default CURRENT_TIMESTAMP,
  created_at timestamp without time zone default CURRENT_TIMESTAMP
);
