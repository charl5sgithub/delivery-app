import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { supabase } from "../db/supabaseClient.js";
import { getOrders, getOrderDetails, exportOrders, updateOrderStatus, calculateOrders } from "../controllers/orderController.js";

dotenv.config();

// Validate Stripe key on startup
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith("sk_test_xxx")) {
  console.warn("⚠️  WARNING: STRIPE_SECRET_KEY is missing or is a placeholder. Card payments will fail.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Checkout endpoint - Create Customer -> Address -> Order -> Order Items -> Payment
router.post("/checkout", async (req, res) => {
  const { name, email, phone, address, items, total, paymentMethod, paymentMethodId, latitude, longitude } = req.body;

  console.log("--- New Checkout Request ---");
  console.log("Method:", paymentMethod);
  console.log("Name:", name);
  console.log("Total:", total);
  console.log("Items Count:", items?.length);

  const isCOD = paymentMethod === 'cod';

  // ── For card payments: charge via Stripe FIRST (fail fast before writing to DB) ─
  let stripeTransactionId = null;
  if (!isCOD) {
    if (!paymentMethodId) {
      return res.status(400).json({ error: "paymentMethodId is required for card payments." });
    }
    try {
      console.log("0. Charging card via Stripe...");
      // Amount must be in smallest currency unit (pence for GBP)
      const amountInPence = Math.round(parseFloat(total) * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPence,
        currency: "gbp",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",  // Prevent redirect-based methods in server-side confirm
        },
        description: `Order for ${name} (${email})`,
        receipt_email: email,
      });

      if (paymentIntent.status !== "succeeded") {
        console.error("Stripe PaymentIntent not succeeded:", paymentIntent.status);
        return res.status(402).json({
          error: `Payment ${paymentIntent.status}. Please try again or use a different card.`
        });
      }

      stripeTransactionId = paymentIntent.id;
      console.log("Stripe charge succeeded. PI:", stripeTransactionId);
    } catch (stripeErr) {
      console.error("Stripe Error:", stripeErr.message);
      // Surface the Stripe decline reason to the user
      return res.status(402).json({ error: stripeErr.message || "Card payment failed. Please try again." });
    }
  }

  try {
    // 1. Create or Find Customer
    console.log("1. Upserting Customer...");
    const { data: customer, error: custError } = await supabase
      .from("customers")
      .upsert([{ name, email, phone }], { onConflict: 'email' })
      .select("customer_id")
      .single();

    if (custError) {
      console.error("Customer Error!", custError);
      throw new Error(`Customer Error: ${custError.message}`);
    }
    console.log("Customer found/created ID:", customer.customer_id);

    // 2. Create Address
    console.log("2. Inserting Address...");
    const { data: addr, error: addrError } = await supabase
      .from("addresses")
      .insert([{
        customer_id: customer.customer_id,
        address_line1: address,
        city: "Unknown",
        country: "United Kingdom",
        latitude: latitude || 0.0,
        longitude: longitude || 0.0
      }])
      .select("address_id")
      .single();

    if (addrError) {
      console.error("Address Error!", addrError);
      throw new Error(`Address Error: ${addrError.message}`);
    }
    console.log("Address ID:", addr.address_id);

    // 3. Create Order
    console.log("3. Creating Order...");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        customer_id: customer.customer_id,
        address_id: addr.address_id,
        total_amount: total,
        order_status: isCOD ? "PENDING" : "PAID"
      }])
      .select("order_id")
      .single();

    if (orderError) {
      console.error("Order Error!", orderError);
      throw new Error(`Order Error: ${orderError.message}`);
    }
    console.log("Order ID:", order.order_id);

    // 4. Insert Order Items
    console.log(`4. Inserting ${items?.length} items...`);
    const orderItemsData = (items || []).map(item => ({
      order_id: order.order_id,
      item_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) {
      console.error("Order Items Error!", itemsError);
      throw new Error(`Order Items Error: ${itemsError.message}`);
    }

    // 5. Create Payment Record
    console.log("5. Creating Payment Record...");
    const { error: payError } = await supabase
      .from("payments")
      .insert([{
        order_id: order.order_id,
        amount: total,
        status: isCOD ? "pending" : "success",
        payment_method: isCOD ? "cod" : "card",
        // For card: real Stripe PI id. For COD: a reference prefix.
        transaction_id: isCOD ? `cod_${Date.now()}` : stripeTransactionId
      }]);

    if (payError) {
      console.error("Payment Error!", payError);
      throw new Error(`Payment Error: ${payError.message}`);
    }

    console.log("Order SUCCESS!");
    res.json({ success: true, orderId: order.order_id, message: "Order placed successfully!" });

  } catch (error) {
    console.error("Checkout Catch Block:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// List orders with pagination, sort, search
router.get("/", getOrders);

// Export orders to CSV
router.get("/export", exportOrders);

// Calculate financial breakdown for selected orders
router.post("/calculate", calculateOrders);

// Get order details
router.get("/:id", getOrderDetails);

// Update order status
router.patch("/:id/status", updateOrderStatus);

export default router;
