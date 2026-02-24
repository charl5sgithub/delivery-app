
import { supabase } from "../db/supabaseClient.js";
import { Parser } from 'json2csv';

export const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc", search = "", startDate, endDate, orderId, status } = req.query;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from("orders")
            .select(`
        *,
        customers!inner (name, email),
        addresses (*)
      `, { count: "exact" });

        // Search functionality (Customer Name/Email)
        if (search) {
            // Use the referenced table filter syntax for inner-joined customers
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`, { referencedTable: 'customers' });
        }

        // Filter by Order ID
        if (orderId) {
            const trimmed = orderId.trim().replace(/^#/, '');
            const numericId = parseInt(trimmed, 10);
            if (!isNaN(numericId)) {
                // For bigints, we usually want exact match, but let's be robust
                query = query.eq('order_id', numericId);
            }
        }

        // Filter by Status
        if (status) {
            query = query.eq('order_status', status);
        }

        // Filter by Date Range
        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            // Ensure we cover the full day of endDate
            // Append end of day time if it's just YYYY-MM-DD
            const endDateTime = endDate.includes('T') ? endDate : `${endDate} 23:59:59.999`;
            query = query.lte('created_at', endDateTime);
        }

        // Sort
        if (['order_id', 'created_at', 'total_amount', 'status', 'order_status'].includes(sortBy)) {
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        }
        else {
            query = query.order('created_at', { ascending: false });
        }

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
        console.error("Get Orders Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch Order with Customer, Address, and Payment info
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select(`
                *,
                customers (*),
                addresses (*),
                payments (*)
            `)
            .eq("order_id", id)
            .single();

        if (orderError) throw orderError;

        // 2. Fetch Order Items separately to safer handle the join
        // We also try to fetch linked items. If the relation fails, we might get an error here.
        // But separate query makes it easier to isolate.
        const { data: orderItems, error: itemsError } = await supabase
            .from("order_items")
            .select(`
                *,
                items (name, price, image)
            `)
            .eq("order_id", id);

        if (itemsError) {
            console.error("Error fetching items for order:", itemsError);
            // We return order without items if this fails, or empty list
            order.order_items = [];
        } else {
            order.order_items = orderItems;
        }

        res.json(order);
    } catch (error) {
        console.error("Get Order Details Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const exportOrders = async (req, res) => {
    try {
        const { search = "", startDate, endDate, orderId, status, ids } = req.query;

        let query = supabase
            .from("orders")
            .select(`
                order_id,
                created_at,
                order_status,
                total_amount,
                customers!inner (name, email, phone),
                addresses (address_line1, city, country)
            `);

        if (ids) {
            const idList = ids.split(',').map(id => parseInt(id.trim().replace(/^#/, ''), 10)).filter(n => !isNaN(n));
            if (idList.length > 0) {
                query = query.in('order_id', idList);
            }
        } else {
            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`, { referencedTable: 'customers' });
            }
            if (orderId) {
                const trimmed = orderId.trim().replace(/^#/, '');
                const numericId = parseInt(trimmed, 10);
                if (!isNaN(numericId)) {
                    query = query.eq('order_id', numericId);
                }
            }
            if (status) {
                query = query.eq('order_status', status);
            }
            if (startDate) {
                query = query.gte('created_at', startDate);
            }
            if (endDate) {
                const endDateTime = endDate.includes('T') ? endDate : `${endDate} 23:59:59.999`;
                query = query.lte('created_at', endDateTime);
            }
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        // Flatten data for CSV
        const csvData = data.map(order => ({
            OrderID: order.order_id,
            Date: new Date(order.created_at).toISOString(),
            CustomerName: order.customers?.name,
            CustomerEmail: order.customers?.email,
            CustomerPhone: order.customers?.phone,
            Address: `${order.addresses?.address_line1}, ${order.addresses?.city}`,
            Status: order.order_status,
            Total: order.total_amount
        }));

        const parser = new Parser();
        const csv = parser.parse(csvData);

        res.header('Content-Type', 'text/csv');
        res.attachment('orders.csv');
        res.send(csv);

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from("orders")
            .update({ order_status: status })
            .eq("order_id", id)
            .select()
            .single();

        if (error) throw error;

        // If status is changed to PAID, ensure payment record is updated to success
        if (status === 'PAID') {
            const { error: payError } = await supabase
                .from("payments")
                .update({ status: 'success' })
                .eq("order_id", id);

            if (payError) console.error("Error updating payment status:", payError);
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /api/orders/calculate
 * Body: { orderIds: string[] }
 *
 * Returns a financial breakdown for the supplied order IDs:
 *  - totalOrderAmount   — sum of orders.total_amount
 *  - totalPaid          — sum of successful payments
 *  - paidByCard         — sum of card payments (payment_method = 'card')
 *  - paidByCash         — sum of COD payments  (payment_method = 'cod')
 *  - remaining          — totalOrderAmount − totalPaid
 *  - orderCount         — how many orders were included
 *  - orders             — per-order breakdown array
 */
export const calculateOrders = async (req, res) => {
    try {
        const { orderIds } = req.body;

        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ error: 'orderIds must be a non-empty array.' });
        }

        // Fetch the orders with their payments in one query
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
                order_id,
                total_amount,
                order_status,
                customers (name, email),
                payments (payment_method, amount, status)
            `)
            .in('order_id', orderIds);

        if (ordersError) throw ordersError;

        // Build the breakdown
        let totalOrderAmount = 0;
        let totalPaid = 0;
        let paidByCard = 0;
        let paidByCash = 0;

        const orderBreakdown = orders.map(order => {
            const orderTotal = parseFloat(order.total_amount) || 0;
            totalOrderAmount += orderTotal;

            let orderPaid = 0;
            let orderCard = 0;
            let orderCash = 0;

            (order.payments || []).forEach(payment => {
                const amt = parseFloat(payment.amount) || 0;
                const method = (payment.payment_method || '').toLowerCase();

                // Only count successful/pending-COD payments
                if (payment.status === 'success' || payment.status === 'pending') {
                    orderPaid += amt;
                    if (method === 'card' || method === 'stripe') {
                        orderCard += amt;
                    } else if (method === 'cod' || method === 'cash') {
                        orderCash += amt;
                    }
                }
            });

            totalPaid += orderPaid;
            paidByCard += orderCard;
            paidByCash += orderCash;

            return {
                order_id: order.order_id,
                customerName: order.customers?.name || 'Unknown',
                order_status: order.order_status,
                total_amount: orderTotal,
                paid: orderPaid,
                remaining: Math.max(0, orderTotal - orderPaid),
            };
        });

        const remaining = Math.max(0, totalOrderAmount - totalPaid);

        res.json({
            orderCount: orders.length,
            totalOrderAmount: parseFloat(totalOrderAmount.toFixed(2)),
            totalPaid: parseFloat(totalPaid.toFixed(2)),
            paidByCard: parseFloat(paidByCard.toFixed(2)),
            paidByCash: parseFloat(paidByCash.toFixed(2)),
            remaining: parseFloat(remaining.toFixed(2)),
            orders: orderBreakdown,
        });

    } catch (error) {
        console.error('Calculate Orders Error:', error);
        res.status(500).json({ error: error.message });
    }
};


