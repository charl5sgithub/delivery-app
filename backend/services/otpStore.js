/**
 * otpStore.js
 *
 * Serverless-safe OTP storage using Supabase.
 * (In-memory Maps don't survive across Vercel function invocations.)
 *
 * Table required — run backend/scripts/create_otp_table.sql in Supabase first.
 */

import { supabase } from '../db/supabaseClient.js';

const OTP_TTL_MINUTES = 10;

/**
 * Store (or overwrite) an OTP for the given email.
 * @param {string} email
 * @param {string} otp
 */
export async function setOtp(email, otp) {
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    const { error } = await supabase
        .from('otp_codes')
        .upsert({ email, otp, expires_at: expiresAt }, { onConflict: 'email' });

    if (error) throw new Error(`OTP store error: ${error.message}`);
}

/**
 * Retrieve the stored OTP entry for the given email.
 * Returns null if none found or already expired.
 * @param {string} email
 * @returns {{ otp: string, expires_at: string } | null}
 */
export async function getOtp(email) {
    const { data, error } = await supabase
        .from('otp_codes')
        .select('otp, expires_at')
        .eq('email', email)
        .single();

    if (error || !data) return null;

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
        await deleteOtp(email);
        return null;
    }

    return data;
}

/**
 * Remove the OTP entry for the given email (after successful verification or expiry).
 * @param {string} email
 */
export async function deleteOtp(email) {
    await supabase
        .from('otp_codes')
        .delete()
        .eq('email', email);
}
