-- Add Country column to Addresses table
-- Run this in Supabase SQL Editor

ALTER TABLE addresses 
ADD COLUMN IF NOT EXISTS country text DEFAULT 'India';
