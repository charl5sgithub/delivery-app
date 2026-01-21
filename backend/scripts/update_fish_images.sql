-- ============================================
-- Update Fish Items with Real Image URLs
-- Uses free stock images from Pixabay/Unsplash
-- Run this in Supabase SQL Editor
-- ============================================

-- Update all fish items with working image URLs
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/06/30/18/49/blue-swimming-crab-1489685_640.jpg' WHERE name = 'Blue Swimmer Crab';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2015/04/08/13/13/food-712665_640.jpg' WHERE name = 'Farm Prawns';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2017/06/25/17/59/shrimp-2441046_640.jpg' WHERE name = 'Sea Prawns';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/06/30/18/49/cuttlefish-1489683_640.jpg' WHERE name = 'Cuttlefish';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/06/30/18/50/squid-1489690_640.jpg' WHERE name = 'Squid';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/11/18/14/39/fish-1834504_640.jpg' WHERE name = 'King Fish (Cubes)';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2014/11/05/15/57/salmon-518032_640.jpg' WHERE name = 'King Fish (Slice)';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2017/03/16/22/39/fish-2150223_640.jpg' WHERE name = 'Barramundi';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/03/05/19/02/fish-1238230_640.jpg' WHERE name = 'Travelly';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2014/04/22/02/56/red-fish-329919_640.jpg' WHERE name = 'Emperor Fish';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2018/08/30/14/42/fish-3642604_640.jpg' WHERE name = 'Grouper';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/07/22/09/59/fish-1534213_640.jpg' WHERE name = 'Bonto';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/04/01/08/38/tuna-1298299_640.png' WHERE name = 'Yellowfin Tuna';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2017/01/16/15/14/shark-1984846_640.jpg' WHERE name = 'Milkshark';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2018/10/12/18/16/fish-3742887_640.jpg' WHERE name = 'Maamiya Paraw';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/03/05/19/02/salmon-1238231_640.jpg' WHERE name = 'Indian Salmon';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2020/06/22/16/55/animal-5329168_640.jpg' WHERE name = 'Snake Head Fish';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2018/08/12/18/16/fish-3601983_640.jpg' WHERE name = 'Black Pomfret';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/03/05/19/02/silver-pomfret-1238232_640.jpg' WHERE name = 'Silver Pomfret';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2017/09/25/13/14/anchovies-2785285_640.jpg' WHERE name = 'Anchovy';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2017/02/27/23/09/fish-2104606_640.jpg' WHERE name = 'Threadfin Bream';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/05/20/16/15/tilapia-1405084_640.jpg' WHERE name = 'Tilapia';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2019/07/16/12/51/mackerel-4341347_640.jpg' WHERE name = 'Indian Mackerel';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2017/08/25/19/23/stingray-2681073_640.jpg' WHERE name = 'Stingray';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/01/20/15/18/barracuda-1151028_640.jpg' WHERE name = 'Barracuda';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2018/04/14/11/00/fish-3318546_640.jpg' WHERE name = 'Goat Fish';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/03/05/19/02/yellowtail-1238233_640.jpg' WHERE name = 'Yellowtail Scad';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2017/03/27/14/56/fish-2179208_640.jpg' WHERE name = 'Mojaaras';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/03/05/19/02/silver-fish-1238234_640.jpg' WHERE name = 'Ponny Fish';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2018/08/12/18/16/fish-3601984_640.jpg' WHERE name = 'Yellow Tail Stripe';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/07/11/16/23/sardines-1510519_640.jpg' WHERE name = 'Sardine (Cleaned)';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/03/05/19/02/sea-bream-1238235_640.jpg' WHERE name = 'Sea Bream';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2014/04/22/02/56/fish-329918_640.jpg' WHERE name = 'Sea Bass';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2018/10/12/18/16/pomfret-3742888_640.jpg' WHERE name = 'Golden Pomfret';
UPDATE items SET image = 'https://cdn.pixabay.com/photo/2016/03/05/19/02/salmon-1238248_640.jpg' WHERE name = 'Salmon';

-- Verify the updates
SELECT name, image FROM items WHERE name IN ('Blue Swimmer Crab', 'Farm Prawns', 'Salmon');
