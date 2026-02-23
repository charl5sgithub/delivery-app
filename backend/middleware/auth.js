/**
 * RBAC Authorization Middleware
 *
 * Usage:
 *   import { requireRole } from '../middleware/auth.js';
 *   router.patch('/...', requireRole(['SuperUser', 'Admin']), myController);
 *
 * The frontend must send the logged-in user's email in the
 * "X-User-Email" request header for every protected request.
 */

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
            const callerEmail = req.headers['x-user-email'];

            if (!callerEmail) {
                return res.status(401).json({
                    error: 'Unauthorized: Missing X-User-Email header.'
                });
            }

            // Look up the caller's role from the customers table
            const { data: customer, error } = await supabase
                .from('customers')
                .select('role')
                .eq('email', callerEmail)
                .single();

            if (error || !customer) {
                return res.status(403).json({
                    error: 'Forbidden: User not found in the system.'
                });
            }

            const userRole = customer.role || 'User';

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role. Your role: ${userRole}`
                });
            }

            // Attach for downstream use
            req.callerRole = userRole;
            req.callerEmail = callerEmail;

            next();
        } catch (err) {
            console.error('Auth Middleware Error:', err);
            res.status(500).json({ error: 'Internal server error during authorization.' });
        }
    };
}
