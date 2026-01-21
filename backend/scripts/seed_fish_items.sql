-- ============================================
-- Fish Items SQL Insert Script
-- Extracted from Tarel Fish Menu
-- Run this in Supabase SQL Editor
-- ============================================

-- Optional: Clear existing items first (uncomment if needed)
-- DELETE FROM items;

-- Insert all 35 fish items from the Tarel menu
INSERT INTO items (name, price, image) VALUES
  -- Row 1: Seafood
  ('Blue Swimmer Crab', 18.00, '/fish/blue-swimmer-crab.png'),
  ('Farm Prawns', 13.00, '/fish/farm-prawns.png'),
  ('Sea Prawns', 20.00, '/fish/sea-prawns.png'),
  ('Cuttlefish', 16.00, '/fish/cuttlefish.png'),
  ('Squid', 17.00, '/fish/squid.png'),

  -- Row 2: Fish
  ('King Fish (Cubes)', 18.00, '/fish/king-fish-cubes.png'),
  ('King Fish (Slice)', 20.00, '/fish/king-fish-slice.png'),
  ('Barramundi', 17.00, '/fish/barramundi.png'),
  ('Travelly', 17.00, '/fish/travelly.png'),
  ('Emperor Fish', 17.00, '/fish/emperor-fish.png'),

  -- Row 3: Fish
  ('Grouper', 18.00, '/fish/grouper.png'),
  ('Bonto', 15.00, '/fish/bonto.png'),
  ('Yellowfin Tuna', 17.00, '/fish/yellowfin-tuna.png'),
  ('Milkshark', 18.00, '/fish/milkshark.png'),
  ('Maamiya Paraw', 17.00, '/fish/maamiya-paraw.png'),

  -- Row 4: Fish
  ('Indian Salmon', 17.00, '/fish/indian-salmon.png'),
  ('Snake Head Fish', 15.00, '/fish/snake-head-fish.png'),
  ('Black Pomfret', 19.00, '/fish/black-pomfret.png'),
  ('Silver Pomfret', 26.00, '/fish/silver-pomfret.png'),
  ('Anchovy', 16.00, '/fish/anchovy.png'),

  -- Row 5: Fish
  ('Threadfin Bream', 15.00, '/fish/threadfin-bream.png'),
  ('Tilapia', 14.00, '/fish/tilapia.png'),
  ('Indian Mackerel', 15.00, '/fish/indian-mackerel.png'),
  ('Stingray', 16.00, '/fish/stingray.png'),
  ('Barracuda', 17.00, '/fish/barracuda.png'),

  -- Row 6: Fish
  ('Goat Fish', 15.00, '/fish/goat-fish.png'),
  ('Yellowtail Scad', 15.00, '/fish/yellowtail-scad.png'),
  ('Mojaaras', 14.00, '/fish/mojaaras.png'),
  ('Ponny Fish', 15.00, '/fish/ponny-fish.png'),
  ('Yellow Tail Stripe', 15.00, '/fish/yellow-tail-stripe.png'),

  -- Row 7: Fish
  ('Sardine (Cleaned)', 13.00, '/fish/sardine-cleaned.png'),
  ('Sea Bream', 15.00, '/fish/sea-bream.png'),
  ('Sea Bass', 15.00, '/fish/sea-bass.png'),
  ('Golden Pomfret', 15.00, '/fish/golden-pomfret.png'),
  ('Salmon', 15.00, '/fish/salmon.png');

-- Verify the insert
SELECT COUNT(*) as total_items FROM items;
