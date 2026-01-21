-- Add Unique Constraint to Email to enable Upsert
-- Run this in Supabase SQL Editor

ALTER TABLE customers 
ADD CONSTRAINT customers_email_key UNIQUE (email);
