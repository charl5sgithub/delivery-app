import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    console.log('--- Checking addresses table ---');
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Fetch Error:', error);
        return;
    }
    
    if (data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]));
        if ('is_deleted' in data[0]) {
            console.log('✅ is_deleted column exists.');
        } else {
            console.log('❌ is_deleted column is MISSING.');
        }
    } else {
        console.log('No data found to check columns.');
    }
}

check();
