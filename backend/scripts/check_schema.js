
import { supabase } from '../db/supabaseClient.js';

async function checkTable(tableName) {
    console.log(`\n--- Checking ${tableName} table ---`);
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
        
        if (error) {
            console.error(`Error fetching ${tableName}:`, error.message);
            return;
        }

        if (data && data.length > 0) {
            console.log('Available columns:', Object.keys(data[0]));
            if (tableName === 'addresses') {
                if ('is_deleted' in data[0]) {
                    console.log('✅ is_deleted column exists.');
                } else {
                    console.log('❌ is_deleted column is MISSING.');
                }
                if ('label' in data[0]) {
                    console.log('✅ label column exists.');
                } else {
                    console.log('❌ label column is MISSING.');
                }
            }
            if (tableName === 'order_items') {
                if ('preparation_type' in data[0]) {
                    console.log('✅ preparation_type column exists.');
                } else {
                    console.log('❌ preparation_type column is MISSING.');
                }
            }
        } else {
            // If no rows, we can't see columns this way easily without RPC
            // Let's try a common trick to get columns if table is empty
            const { data: cols, error: colError } = await supabase
                .rpc('get_columns', { table_name: tableName });
            
            if (colError) {
                console.log(`Table ${tableName} is empty and RPC get_columns failed.`);
            } else {
                const columnNames = cols.map(c => c.column_name);
                console.log('Available columns (from RPC):', columnNames);
                if (tableName === 'addresses') {
                    console.log(columnNames.includes('is_deleted') ? '✅ is_deleted exists' : '❌ is_deleted MISSING');
                    console.log(columnNames.includes('label') ? '✅ label exists' : '❌ label MISSING');
                }
                if (tableName === 'order_items') {
                    console.log(columnNames.includes('preparation_type') ? '✅ preparation_type exists' : '❌ preparation_type MISSING');
                }
            }
        }
    } catch (err) {
        console.error(`Unexpected error for ${tableName}:`, err.message);
    }
}

async function run() {
    await checkTable('addresses');
    await checkTable('order_items');
}

run();
