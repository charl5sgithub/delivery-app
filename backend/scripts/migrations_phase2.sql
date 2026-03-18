
-- Phase 2 Migrations

-- 1. Add columns to addresses table
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- 2. Add columns to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS preparation_type TEXT DEFAULT 'CLEAN_ONLY';

-- 3. Update existing data if needed
UPDATE addresses SET label = 'Home' WHERE label IS NULL;
