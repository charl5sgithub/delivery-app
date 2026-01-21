import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
// import "./PaymentPage.css";

console.log("Stripe key:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

import { useNavigate } from "react-router-dom";

export default function PaymentPage({ total, cart, onPaymentSuccess }) {
  const navigate = useNavigate();

  return (
    <div className="payment-page-wrapper" style={{
      backgroundImage: 'url(/payment-pattern.png)',
      backgroundSize: '300px',
      backgroundRepeat: 'repeat',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <button
        onClick={() => navigate('/cart')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          backgroundColor: '#4b5563',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          zIndex: 10
        }}
      >
        ← Back to Cart
      </button>
      <div className="payment-card" style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', color: '#1f2937' }}>💳 Secure Payment</h2>
        <p style={{ marginBottom: '20px', textAlign: 'center', fontSize: '1.2rem' }}>Total Amount: <strong style={{ color: '#10b981' }}>₹{total}</strong></p>
        <Elements stripe={stripePromise}>
          <CheckoutForm total={total} cart={cart} onPaymentSuccess={onPaymentSuccess} />
        </Elements>
      </div>
    </div>
  );
}
