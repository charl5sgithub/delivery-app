-- ============================================================
-- Clean DB: Remove all orders and non-SuperUser customers
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Delete all payments (cascade child of orders)
DELETE FROM payments;

-- 2. Delete all order items (cascade child of orders)
DELETE FROM order_items;

-- 3. Delete all orders
DELETE FROM orders;

-- 4. Delete addresses belonging to non-SuperUser customers
DELETE FROM addresses
WHERE customer_id IN (
  SELECT customer_id FROM customers WHERE role != 'SuperUser'
);

-- 5. Delete all non-SuperUser customers
DELETE FROM customers
WHERE role != 'SuperUser';
