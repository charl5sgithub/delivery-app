/**
 * RBAC Authorization Middleware
 *
 * Usage:
 *   import { requireRole } from '../middleware/auth.js';
 *   router.patch('/...', requireRole(['SuperUser', 'Admin']), myController);
 *
 * The frontend must send the logged-in user's JWT in the Authorization header:
 *   Authorization: Bearer <token>
 */

import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabaseClient.js';

/**
 * Returns an Express middleware that allows only requests whose
 * caller has one of the specified roles.
 *
 * @param {string[]} allowedRoles - e.g. ['SuperUser', 'Admin']
 */
export function requireRole(allowedRoles = []) {
    return async (req, res, next) => {
        try {
            // ── Extract Bearer token ──────────────────────────────────────────
            const authHeader = req.headers['authorization'];
            const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

            if (!token) {
                return res.status(401).json({
                    error: 'Unauthorized: Missing Authorization header (Bearer token required).'
                });
            }

            // ── Verify JWT ────────────────────────────────────────────────────
            let payload;
            try {
                payload = jwt.verify(token, process.env.JWT_SECRET);
            } catch (jwtErr) {
                return res.status(401).json({
                    error: 'Unauthorized: Invalid or expired token. Please log in again.'
                });
            }

            const callerEmail = payload.email;

            if (!callerEmail) {
                return res.status(401).json({ error: 'Unauthorized: Token missing email claim.' });
            }

            // ── Look up the caller's live role from the customers table ───────
            // (JWT role is used for speed, but DB is the source of truth)
            const { data: customer, error } = await supabase
                .from('customers')
                .select('role')
                .eq('email', callerEmail)
                .single();

            if (error || !customer) {
                return res.status(403).json({
                    error: 'Forbidden: User not found in system.'
                });
            }

            const userRole = customer.role || 'User';

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    error: `Forbidden: Requires one of [${allowedRoles.join(', ')}]. Your role: ${userRole}`
                });
            }

            // ── Attach for downstream use ─────────────────────────────────────
            req.callerRole = userRole;
            req.callerEmail = callerEmail;

            next();
        } catch (err) {
            console.error('Auth Middleware Error:', err);
            res.status(500).json({ error: 'Internal server error during authorization.' });
        }
    };
}
