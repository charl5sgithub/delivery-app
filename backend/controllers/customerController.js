
import { supabase } from "../db/supabaseClient.js";
import { Parser } from 'json2csv';

// Get Customers with Pagination, Sorting, Search
export const getCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc", search = "" } = req.query;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from("customers")
            .select("*", { count: "exact" });

        // Search functionality
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        // Sort
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Pagination
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            data,
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            totalPages: Math.ceil(count / limit)
        });

    } catch (error) {
        console.error("Get Customers Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get Single Customer Details (with Orders and Addresses)
export const getCustomerDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch customer basic info
        const { data: customer, error: custError } = await supabase
            .from("customers")
            .select(`
                *,
                addresses (*)
            `)
            .eq("customer_id", id)
            .single();

        if (custError) throw custError;

        // Fetch recent orders for this customer
        const { data: orders, error: orderError } = await supabase
            .from("orders")
            .select("order_id, created_at, total_amount, order_status")
            .eq("customer_id", id)
            .order("created_at", { ascending: false })
            .limit(5);

        if (orderError) throw orderError;

        res.json({ ...customer, orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Export Customers to CSV
export const exportCustomers = async (req, res) => {
    try {
        const { search = "" } = req.query;

        let query = supabase
            .from("customers")
            .select("*");

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        // Flatten data for CSV
        const csvData = data.map(cust => ({
            ID: cust.customer_id,
            Name: cust.name,
            Email: cust.email,
            Phone: cust.phone,
            JoinedAt: new Date(cust.created_at).toISOString()
        }));

        const parser = new Parser();
        const csv = parser.parse(csvData);

        res.header('Content-Type', 'text/csv');
        res.attachment('customers.csv');
        res.send(csv);

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get a single customer's role
export const getCustomerRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('customers')
            .select('customer_id, email, role')
            .eq('customer_id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Customer not found.' });

        res.json({ customer_id: data.customer_id, email: data.email, role: data.role });
    } catch (error) {
        console.error('Get Customer Role Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update a customer's role (SuperUser / Admin only – enforced by route middleware)
export const updateCustomerRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const VALID_ROLES = ['SuperUser', 'Admin', 'User'];
        if (!role || !VALID_ROLES.includes(role)) {
            return res.status(400).json({
                error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
            });
        }

        const { data, error } = await supabase
            .from('customers')
            .update({ role })
            .eq('customer_id', id)
            .select('customer_id, name, email, role')
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Customer not found.' });

        res.json({ success: true, customer: data });
    } catch (error) {
        console.error('Update Customer Role Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get role by email – called by the frontend AuthContext right after login
export const getRoleByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'email query param is required.' });
        }

        const { data, error } = await supabase
            .from('customers')
            .select('role')
            .eq('email', email)
            .single();

        if (error || !data) {
            // User is not yet in the DB (first login before checkout) → default to User
            return res.json({ role: 'User' });
        }

        res.json({ role: data.role });
    } catch (error) {
        console.error('Get Role By Email Error:', error);
        res.status(500).json({ error: error.message });
    }
};
