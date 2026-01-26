
-- Add latitude and longitude to addresses table
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Optional: Add a driver location table for real-time tracking
CREATE TABLE IF NOT EXISTS driver_locations (
    driver_id bigint primary key generated always as identity,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    updated_at timestamp without time zone default CURRENT_TIMESTAMP
);

-- Seed a default driver location (Edinburgh Hub)
INSERT INTO driver_locations (latitude, longitude)
VALUES (55.9533, -3.1883)
ON CONFLICT DO NOTHING;
