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

// Get customer details
router.get("/:id", getCustomerDetails);

// Get a single customer's role
router.get("/:id/role", getCustomerRole);

// ── Protected routes (SuperUser & Admin only) ──────────────────────────────────

// Update a customer's role
router.patch(
    "/:id/role",
    requireRole(["SuperUser", "Admin"]),
    updateCustomerRole
);

export default router;
