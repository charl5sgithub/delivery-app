import express from "express";
import { supabase } from "../db/supabaseClient.js";
import { getCustomers, getCustomerDetails, exportCustomers } from "../controllers/customerController.js";

const router = express.Router();

// List customers with pagination, sort, search
router.get("/", getCustomers);

// Export customers to CSV
router.get("/export", exportCustomers);

// Get customer details
router.get("/:id", getCustomerDetails);

export default router;
