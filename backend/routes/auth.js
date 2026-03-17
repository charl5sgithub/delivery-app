/**
 * routes/auth.js
 *
 * Email OTP Authentication Routes
 *
 * POST /api/auth/send-otp    — Generate & email a 6-digit OTP
 * POST /api/auth/verify-otp  — Validate OTP, return a signed JWT
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabaseClient.js';
import { sendOtpEmail } from '../services/emailService.js';
import { setOtp, getOtp, deleteOtp } from '../services/otpStore.js';

const router = express.Router();

/** Generate a cryptographically random 6-digit OTP */
function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/send-otp
// Body: { email: string }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'A valid email address is required.' });
        }

        const otp = generateOtp();

        // Persist OTP in Supabase (serverless-safe)
        await setOtp(email.toLowerCase(), otp);

        // Send email via Gmail SMTP
        await sendOtpEmail(email, otp);

        return res.json({ message: `OTP sent to ${email}` });
    } catch (err) {
        console.error('Send OTP Error:', err);
        return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// Body: { email: string, otp: string }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'email and otp are required.' });
        }

        const normalizedEmail = email.toLowerCase();
        const stored = await getOtp(normalizedEmail);

        if (!stored) {
            return res.status(400).json({ error: 'OTP not found or has expired. Please request a new one.' });
        }

        if (stored.otp !== String(otp).trim()) {
            return res.status(400).json({ error: 'Invalid OTP. Please check the code and try again.' });
        }

        // OTP is valid — consume it
        await deleteOtp(normalizedEmail);

        // ── Look up or create the customer record ────────────────────────────
        let { data: customer, error: fetchErr } = await supabase
            .from('customers')
            .select('customer_id, email, role, name')
            .eq('email', normalizedEmail)
            .single();

        if (fetchErr || !customer) {
            // First-time login — create a minimal customer record
            const { data: newCustomer, error: insertErr } = await supabase
                .from('customers')
                .insert({ email: normalizedEmail, role: 'User', name: normalizedEmail.split('@')[0] })
                .select('customer_id, email, role, name')
                .single();

            if (insertErr) {
                console.error('Customer insert error:', insertErr);
                // Non-fatal: continue with basic info
                customer = { email: normalizedEmail, role: 'User', name: normalizedEmail.split('@')[0] };
            } else {
                customer = newCustomer;
            }
        }

        // ── Sign JWT ─────────────────────────────────────────────────────────
        const payload = {
            email: customer.email,
            role: customer.role || 'User',
            name: customer.name || customer.email.split('@')[0],
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });

        return res.json({
            token,
            user: payload,
        });
    } catch (err) {
        console.error('Verify OTP Error:', err);
        return res.status(500).json({ error: 'Verification failed. Please try again.' });
    }
});

export default router;
