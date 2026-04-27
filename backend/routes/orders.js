import express from "express";
import pkg from "globalpayments-api";
const { PaymentMethod } = pkg;
import "../config/gpConfig.js";
import { supabase } from "../db/supabaseClient.js";
import { getOrders, getOrderDetails, exportOrders, updateOrderStatus, calculateOrders, getUsersOrders } from "../controllers/orderController.js";
import { getAccessToken, processPayment } from "../services/gpService.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// Endpoint to generate single-use access token for frontend GP SDK
router.get("/access-token", async (req, res) => {
  try {
    const token = await getAccessToken(["PMT_POST_Create_Single"]);
    res.json({ token });
  } catch (err) {
    console.error("Access Token error:", err);
    res.status(500).json({ error: "Failed to generate payment token" });
  }
});

// Checkout endpoint - Create Customer -> Address -> Order -> Order Items -> Payment
router.post("/checkout", async (req, res) => {
  const { name, email, phone, address, items, total, paymentMethod, paymentMethodId, latitude, longitude, label, city, postcode } = req.body;

  console.log("--- New Checkout Request (HandePay) ---");
  console.log("Method:", paymentMethod);
  console.log("Name:", name);
  console.log("Token:", paymentMethodId);

  const isCOD = paymentMethod === 'cod';
  // ── Checkout Flow ──
  // 1. Create all DB records first (Order as PENDING)
  // 2. If COD, return success
  // 3. If CARD, generate HPP Link and return redirectUrl

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

    // 2. Create or Find Address
    console.log(`2. Finding or Creating Address for ${name} (Label: ${label || 'Other'})...`);
    const { data: existingAddr, error: findAddrError } = await supabase
      .from("addresses")
      .select("address_id")
      .eq("customer_id", customer.customer_id)
      .eq("label", label || "Other")
      .limit(1)
      .maybeSingle();

    if (findAddrError) {
      console.error("Address Search Error!", findAddrError);
      throw new Error(`Address Search Error: ${findAddrError.message}`);
    }

    let addressId;
    if (existingAddr) {
      console.log("Existing address found ID:", existingAddr.address_id);
      addressId = existingAddr.address_id;
    } else {
      console.log("No existing address found, creating new one...");
      const { data: newAddr, error: addrError } = await supabase
        .from("addresses")
        .insert([{
          customer_id: customer.customer_id,
          address_line1: address,
          city: city || "Unknown",
          postcode: postcode || "",
          label: label || "Other",
          country: "United Kingdom",
          latitude: latitude || 0.0,
          longitude: longitude || 0.0
        }])
        .select("address_id")
        .single();

      if (addrError) {
        console.error("Address Creation Error!", addrError);
        throw new Error(`Address Creation Error: ${addrError.message}`);
      }
      addressId = newAddr.address_id;
    }
    console.log("Address ID to use:", addressId);

    // 3. Create Order
    console.log("3. Creating Order...");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        customer_id: customer.customer_id,
        address_id: addressId,
        total_amount: total,
        order_status: "PENDING" // Always pending initially
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
      price: item.price,
      preparation_type: item.preparationType || 'CLEAN_ONLY'
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
        status: "pending",
        payment_method: isCOD ? "cod" : "card",
        transaction_id: isCOD ? `cod_${Date.now()}` : `hpp_${Date.now()}`
      }]);

    if (payError) {
      console.error("Payment Error!", payError);
      throw new Error(`Payment Error: ${payError.message}`);
    }

    console.log("Order SUCCESS! DB Records created.");

    if (isCOD) {
      return res.json({ success: true, orderId: order.order_id, message: "Order placed successfully!" });
    } else {
      // Card payment — process directly with the token
      console.log("Processing GP payment for order:", order.order_id);
      try {
        const token = await getAccessToken();
        const paymentResult = await processPayment(token, paymentMethodId, {
          orderId: order.order_id,
          total: total
        });

        console.log("Payment successful:", paymentResult.id);
        
        // Update DB records
        await supabase.from("orders").update({ order_status: "PAID" }).eq("order_id", order.order_id);
        await supabase.from("payments").update({ status: "success", transaction_id: paymentResult.id }).eq("order_id", order.order_id);

        return res.json({
          success: true,
          orderId: order.order_id,
          message: "Payment processed successfully!"
        });
      } catch (err) {
        console.error("Payment Processing Error:", err);
        // Mark payment as failed in DB
        await supabase.from("payments").update({ status: "failed" }).eq("order_id", order.order_id);
        return res.status(500).json({ error: err.message || "Failed to process payment." });
      }
    }

  } catch (error) {
    console.error("Checkout Catch Block:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// List orders with pagination, sort, search
router.get("/", getOrders);

// HPP Return Webhook
router.all("/hpp/return", async (req, res) => {
  console.log("--- GlobalPayments HPP Return ---");
  // GP posts the TRN payload either as JSON body or form URL encoded.
  const payload = req.body || {};
  console.log("Payload:", payload);

  let redirectTarget = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`;

  if (payload && (payload.status === "CAPTURED" || payload.status === "PREAUTHORIZED")) {
    const orderId = payload.reference;
    console.log(`Payment success for Order ID: ${orderId}`);

    if (orderId) {
      await supabase.from("orders").update({ order_status: "PAID" }).eq("order_id", orderId);
      await supabase.from("payments").update({ status: "success", transaction_id: payload.id }).eq("order_id", orderId);
      redirectTarget += `?order_id=${orderId}`;
    }
  } else if (payload && payload.status === "DECLINED") {
    redirectTarget = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failed`;
  }

  // Instruct GP HPP iframe to redirect the parent window
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Processing...</title></head>
      <body>
        <script>
          window.top.location.href = "${redirectTarget}";
        </script>
      </body>
    </html>
  `);
});

// Export orders to CSV
router.get("/export", exportOrders);

// Calculate financial breakdown for selected orders
router.post("/calculate", calculateOrders);

// Get my orders
router.get("/mine", requireRole(['User', 'Admin', 'SuperUser']), getUsersOrders);

// Get order details
router.get("/:id", getOrderDetails);

// Update order status
router.patch("/:id/status", updateOrderStatus);

export default router;
