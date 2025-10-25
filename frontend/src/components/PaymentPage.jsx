import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
// import "./PaymentPage.css";

console.log("Stripe key:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage({ total, onPaymentSuccess }) {
  return (
    <div className="payment-container">
      <h2>💳 Secure Payment</h2>
      <p>Total Amount: <strong>₹{total}</strong></p>
      <Elements stripe={stripePromise}>
        <CheckoutForm total={total} onPaymentSuccess={onPaymentSuccess} />
      </Elements>
    </div>
  );
}
