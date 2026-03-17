import { supabase } from '../backend/db/supabaseClient.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env' });

async function check() {
  const { error } = await supabase.from('otp_codes').select('email').limit(1);
  if (error) {
    console.log("DB ERROR (otp_codes table probably missing):", error.message);
  } else {
    console.log("DB OK (otp_codes table exists).");
  }
}
check();
