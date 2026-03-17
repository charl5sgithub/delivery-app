-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Creates the otp_codes table used by the Email OTP auth system.

CREATE TABLE IF NOT EXISTS otp_codes (
    email       TEXT        PRIMARY KEY,
    otp         TEXT        NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: auto-clean expired OTPs (requires pg_cron extension, enable in Dashboard)
-- SELECT cron.schedule('clean-expired-otps', '*/15 * * * *',
--   $$DELETE FROM otp_codes WHERE expires_at < NOW();$$);
