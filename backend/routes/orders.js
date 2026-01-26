import express from "express";
import { supabase } from "../db/supabaseClient.js";
import { getOrders, getOrderDetails, exportOrders, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

// Checkout endpoint - Create Customer -> Address -> Order -> Payment
// Checkout endpoint - Create Customer -> Address -> Order -> Order Items -> Payment
router.post("/checkout", async (req, res) => {
  const { name, email, phone, address, items, total } = req.body;

  try {
    // 1. Create or Find Customer
    // Upsert to avoid duplicates
    const { data: customer, error: custError } = await supabase
      .from("customers")
      .upsert([{ name, email, phone }], { onConflict: 'email' })
      .select("customer_id")
      .single();

    if (custError) throw new Error(`Customer Error: ${custError.message}`);

    // 2. Create Address
    const { data: addr, error: addrError } = await supabase
      .from("addresses")
      .insert([{
        customer_id: customer.customer_id,
        address_line1: address,
        city: "Unknown",
        country: "India"
      }])
      .select("address_id")
      .single();

    if (addrError) throw new Error(`Address Error: ${addrError.message}`);

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        customer_id: customer.customer_id,
        address_id: addr.address_id,
        total_amount: total,
        order_status: "PAID"
      }])
      .select("order_id")
      .single();

    if (orderError) throw new Error(`Order Error: ${orderError.message}`);

    // 4. Insert Order Items
    const orderItemsData = items.map(item => ({
      order_id: order.order_id,
      item_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) throw new Error(`Order Items Error: ${itemsError.message}`);

    // 5. Create Payment Record
    const { error: payError } = await supabase
      .from("payments")
      .insert([{
        order_id: order.order_id,
        amount: total,
        status: "success",
        payment_method: "card",
        transaction_id: `sim_${Date.now()}`
      }]);

    if (payError) throw new Error(`Payment Error: ${payError.message}`);

    res.json({ success: true, orderId: order.order_id, message: "Order placed successfully!" });

  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// List orders with pagination, sort, search
router.get("/", getOrders);

// Export orders to CSV
router.get("/export", exportOrders);

// Get order details
router.get("/:id", getOrderDetails);

// Update order status
router.patch("/:id/status", updateOrderStatus);

export default router;
