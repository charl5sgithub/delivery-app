/**
 * Fish Items Seeder Script
 * 
 * This script inserts all fish items from the Tarel menu into the Supabase database.
 * Run with: node --experimental-modules scripts/seedFishItems.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wsjsxwjblmfeugmvfknj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzanN4d2pibG1mZXVnbXZma25qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk1NTg5OCwiZXhwIjoyMDc4NTMxODk4fQ.uXKdZpThQ6KfqVDAL9qDLVtSxdW4IiV--voFMrfRATo';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fish items extracted from the Tarel menu image
// Format: { name, price (per kg), image URL }
const fishItems = [
    // Row 1
    { name: "Blue Swimmer Crab", price: 18.00, image: "/fish/blue-swimmer-crab.png", category: "seafood", unit: "kg" },
    { name: "Farm Prawns", price: 13.00, image: "/fish/farm-prawns.png", category: "seafood", unit: "kg" },
    { name: "Sea Prawns", price: 20.00, image: "/fish/sea-prawns.png", category: "seafood", unit: "kg" },
    { name: "Cuttlefish", price: 16.00, image: "/fish/cuttlefish.png", category: "seafood", unit: "kg" },
    { name: "Squid", price: 17.00, image: "/fish/squid.png", category: "seafood", unit: "kg" },

    // Row 2
    { name: "King Fish (Cubes)", price: 18.00, image: "/fish/king-fish-cubes.png", category: "fish", unit: "kg" },
    { name: "King Fish (Slice)", price: 20.00, image: "/fish/king-fish-slice.png", category: "fish", unit: "kg" },
    { name: "Barramundi", price: 17.00, image: "/fish/barramundi.png", category: "fish", unit: "kg" },
    { name: "Travelly", price: 17.00, image: "/fish/travelly.png", category: "fish", unit: "kg" },
    { name: "Emperor Fish", price: 17.00, image: "/fish/emperor-fish.png", category: "fish", unit: "kg" },

    // Row 3
    { name: "Grouper", price: 18.00, image: "/fish/grouper.png", category: "fish", unit: "kg" },
    { name: "Bonto", price: 15.00, image: "/fish/bonto.png", category: "fish", unit: "kg" },
    { name: "Yellowfin Tuna", price: 17.00, image: "/fish/yellowfin-tuna.png", category: "fish", unit: "kg" },
    { name: "Milkshark", price: 18.00, image: "/fish/milkshark.png", category: "fish", unit: "kg" },
    { name: "Maamiya Paraw", price: 17.00, image: "/fish/maamiya-paraw.png", category: "fish", unit: "kg" },

    // Row 4
    { name: "Indian Salmon", price: 17.00, image: "/fish/indian-salmon.png", category: "fish", unit: "kg" },
    { name: "Snake Head Fish", price: 15.00, image: "/fish/snake-head-fish.png", category: "fish", unit: "kg" },
    { name: "Black Pomfret", price: 19.00, image: "/fish/black-pomfret.png", category: "fish", unit: "kg" },
    { name: "Silver Pomfret", price: 26.00, image: "/fish/silver-pomfret.png", category: "fish", unit: "kg" },
    { name: "Anchovy", price: 16.00, image: "/fish/anchovy.png", category: "fish", unit: "kg" },

    // Row 5
    { name: "Threadfin Bream", price: 15.00, image: "/fish/threadfin-bream.png", category: "fish", unit: "kg" },
    { name: "Tilapia", price: 14.00, image: "/fish/tilapia.png", category: "fish", unit: "kg" },
    { name: "Indian Mackerel", price: 15.00, image: "/fish/indian-mackerel.png", category: "fish", unit: "kg" },
    { name: "Stingray", price: 16.00, image: "/fish/stingray.png", category: "fish", unit: "kg" },
    { name: "Barracuda", price: 17.00, image: "/fish/barracuda.png", category: "fish", unit: "kg" },

    // Row 6
    { name: "Goat Fish", price: 15.00, image: "/fish/goat-fish.png", category: "fish", unit: "kg" },
    { name: "Yellowtail Scad", price: 15.00, image: "/fish/yellowtail-scad.png", category: "fish", unit: "kg" },
    { name: "Mojaaras", price: 14.00, image: "/fish/mojaaras.png", category: "fish", unit: "kg" },
    { name: "Ponny Fish", price: 15.00, image: "/fish/ponny-fish.png", category: "fish", unit: "kg" },
    { name: "Yellow Tail Stripe", price: 15.00, image: "/fish/yellow-tail-stripe.png", category: "fish", unit: "kg" },

    // Row 7
    { name: "Sardine (Cleaned)", price: 13.00, image: "/fish/sardine-cleaned.png", category: "fish", unit: "kg" },
    { name: "Sea Bream", price: 15.00, image: "/fish/sea-bream.png", category: "fish", unit: "kg" },
    { name: "Sea Bass", price: 15.00, image: "/fish/sea-bass.png", category: "fish", unit: "kg" },
    { name: "Golden Pomfret", price: 15.00, image: "/fish/golden-pomfret.png", category: "fish", unit: "kg" },
    { name: "Salmon", price: 15.00, image: "/fish/salmon.png", category: "fish", unit: "kg" },
];

async function seedDatabase() {
    console.log("🐟 Starting fish items seeding...\n");

    // First, let's check what's currently in the database
    const { data: existingItems, error: fetchError } = await supabase
        .from("items")
        .select("name");

    if (fetchError) {
        console.error("Error fetching existing items:", fetchError.message);
        return;
    }

    console.log(`📊 Found ${existingItems.length} existing items in database.`);

    // Filter out items that already exist
    const existingNames = existingItems.map(item => item.name.toLowerCase());
    const newItems = fishItems.filter(item => !existingNames.includes(item.name.toLowerCase()));

    if (newItems.length === 0) {
        console.log("✅ All fish items already exist in the database!");
        return;
    }

    console.log(`📝 Inserting ${newItems.length} new fish items...\n`);

    // Insert new items
    const { data, error } = await supabase
        .from("items")
        .insert(newItems)
        .select();

    if (error) {
        console.error("❌ Error inserting items:", error.message);
        return;
    }

    console.log(`✅ Successfully inserted ${data.length} fish items!\n`);

    // Display summary
    console.log("📋 Items added:");
    console.log("─".repeat(50));
    data.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} - £${item.price.toFixed(2)}/kg`);
    });
    console.log("─".repeat(50));
    console.log(`\n🎉 Database seeding complete!`);
}

// Run the seeder
seedDatabase().catch(console.error);
