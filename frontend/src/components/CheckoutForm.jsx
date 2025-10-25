import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutForm({ total, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    try {
      // ⚠️ Normally you’d create a PaymentIntent on your backend.
      // Here we simulate a payment success in test mode.
      setTimeout(() => {
        setMessage("✅ Payment successful (test mode)");
        onPaymentSuccess();
        setLoading(false);
      }, 1500);
    } catch (error) {
      setMessage("❌ Payment failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <CardElement className="card-element" />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {message && <p className="payment-message">{message}</p>}
    </form>
  );
}
