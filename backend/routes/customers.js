import express from "express";
import { supabase } from "../db/supabaseClient.js";
import {
    getCustomers,
    getCustomerDetails,
    exportCustomers,
    getCustomerRole,
    updateCustomerRole,
    getRoleByEmail
} from "../controllers/customerController.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// ── Public / Admin-access routes ──────────────────────────────────────────────

// List customers with pagination, sort, search
router.get("/", getCustomers);

// Export customers to CSV
router.get("/export", exportCustomers);

// Get role by email (used by AuthContext on login)
router.get("/role-by-email", getRoleByEmail);

// ── IMPORTANT: specific sub-path routes MUST come before /:id ─────────────────

// Get / Update a single customer's role  (must be before GET /:id)
router.get("/:id/role", getCustomerRole);

// ── Protected routes (SuperUser & Admin only) ─────────────────────────────────
router.patch(
    "/:id/role",
    requireRole(["SuperUser", "Admin"]),
    updateCustomerRole
);

// ── Catch-all customer detail route ──────────────────────────────────────────
// Keep this LAST among /:id routes so sub-paths above are matched first
router.get("/:id", getCustomerDetails);

export default router;
