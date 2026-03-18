const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: 'postgres://postgres.vwnihclscvuznswmkyun:G8m9AHTS7H8O59Y6@aws-0-eu-west-2.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        await client.connect();
        console.log('Connected to DB');
        await client.query('ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;');
        console.log('✅ Column is_deleted added or already exists.');
    } catch (err) {
        console.error('❌ SQL ERROR:', err);
    } finally {
        await client.end();
    }
}

run();
