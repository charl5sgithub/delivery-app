-- ============================================================
-- RBAC: Add role column to customers table
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add the role column with a default of 'User'
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'User'
  CHECK (role IN ('SuperUser', 'Admin', 'User'));

-- 2. (Optional) Grant SuperUser to a specific email for bootstrapping
-- UPDATE customers SET role = 'SuperUser' WHERE email = 'your-admin-email@example.com';
