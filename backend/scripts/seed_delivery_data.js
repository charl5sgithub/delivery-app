
import { supabase } from '../db/supabaseClient.js';

const HUB_LOCATION = { lat: 55.9533, lng: -3.1883 }; // Edinburgh

const sampleLocations = [
    { city: "Edinburgh", lat: 55.9533, lng: -3.1883 },
    { city: "Edinburgh", lat: 55.9412, lng: -3.2053 },
    { city: "Edinburgh", lat: 55.9612, lng: -3.1753 },
    { city: "Edinburgh", lat: 55.9312, lng: -3.2253 },
    { city: "Edinburgh", lat: 55.9712, lng: -3.1553 },
    { city: "Glasgow", lat: 55.8642, lng: -4.2518 },
    { city: "Glasgow", lat: 55.8742, lng: -4.2618 },
    { city: "Glasgow", lat: 55.8542, lng: -4.2418 },
    { city: "Paisley", lat: 55.8467, lng: -4.4236 },
    { city: "Livingston", lat: 55.8833, lng: -3.5167 },
    { city: "Falkirk", lat: 55.9996, lng: -3.7836 },
    { city: "Dunfermline", lat: 56.0711, lng: -3.4532 },
    { city: "Bathgate", lat: 55.9022, lng: -3.6420 },
    { city: "Musselburgh", lat: 55.9430, lng: -3.0500 },
    { city: "Dalkeith", lat: 55.8950, lng: -3.0670 },
];

async function seed() {
    console.log("Seeding delivery sample data...");

    // 1. Create a sample customer if none exists
    const { data: customer } = await supabase.from('customers').upsert([
        { name: "Map Test User", email: "maptest@example.com", phone: "0000000000" }
    ], { onConflict: 'email' }).select().single();

    if (!customer) throw new Error("Could not create customer");

    // 2. Create addresses with coordinates
    const addressInserts = sampleLocations.map((loc, i) => ({
        customer_id: customer.customer_id,
        address_line1: `Sample Point ${i + 1}`,
        city: loc.city,
        latitude: loc.lat + (Math.random() - 0.5) * 0.02, // Add some randomness
        longitude: loc.lng + (Math.random() - 0.5) * 0.02
    }));

    const { data: addresses, error: addrError } = await supabase.from('addresses').insert(addressInserts).select();
    if (addrError) {
        console.error("Addr Error:", addrError);
        return;
    }

    // 3. Create Orders for these addresses
    const orderInserts = addresses.map(addr => ({
        customer_id: customer.customer_id,
        address_id: addr.address_id,
        total_amount: Math.floor(Math.random() * 100) + 20,
        order_status: Math.random() > 0.3 ? 'DELIVERING' : 'PENDING'
    }));

    const { error: orderError } = await supabase.from('orders').insert(orderInserts);
    if (orderError) console.error("Order Error:", orderError);

    console.log("Seeding complete!");
}

seed();
