-- Migration to support enhanced Profile and Address features

-- 1. Update customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- 2. Best-effort migration of existing 'name' data
UPDATE customers 
SET first_name = split_part(name, ' ', 1),
    last_name = SUBSTRING(name FROM POSITION(' ' IN name) + 1)
WHERE first_name IS NULL AND name IS NOT NULL;

-- 3. Update addresses table
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS postcode TEXT;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS delivery_slot TEXT;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- 4. Ensure only one default address per customer (Advanced: use a unique partial index if supported, or handle in app logic)
-- CREATE UNIQUE INDEX idx_one_default_address ON addresses (customer_id) WHERE (is_default = true);
