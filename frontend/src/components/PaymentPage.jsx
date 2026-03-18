import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
// import "./PaymentPage.css";

console.log("Stripe key:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export default function PaymentPage({ total, cart, onPaymentSuccess }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = React.useState(null);
  const [defaultAddress, setDefaultAddress] = React.useState(null);

  React.useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      // Fetch profile
      const profRes = await axios.get(`${API_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfile(profRes.data);

      // Fetch addresses and find default
      const addrRes = await axios.get(`${API_URL}/api/address`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const def = addrRes.data.find(a => a.is_default);
      setDefaultAddress(def);
    } catch (err) {
      console.error('Error fetching user data for checkout:', err);
    }
  };

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
      padding: window.innerWidth < 640 ? '1rem' : '2rem',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <button
        onClick={() => navigate('/cart')}
        style={{
          position: 'absolute',
          top: window.innerWidth < 640 ? '10px' : '20px',
          left: window.innerWidth < 640 ? '10px' : '20px',
          padding: '8px 16px',
          backgroundColor: '#4b5563',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          zIndex: 10,
          fontSize: '0.8rem'
        }}
      >
        ← Back
      </button>
      <div className="payment-page-card" style={{
        backgroundColor: 'white',
        padding: window.innerWidth < 640 ? '1.5rem 1rem' : '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        marginTop: window.innerWidth < 640 ? '50px' : '0'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontSize: window.innerWidth < 640 ? '1.5rem' : '2rem',
          color: '#1f2937'
        }}>💳 Secure Payment</h2>
        <p style={{ marginBottom: '20px', textAlign: 'center', fontSize: window.innerWidth < 640 ? '1rem' : '1.2rem' }}>
          Total Amount: <strong style={{ color: '#10b981' }}>£{total}</strong>
        </p>
        <Elements stripe={stripePromise}>
          <CheckoutForm 
            total={total} 
            cart={cart} 
            onPaymentSuccess={onPaymentSuccess} 
            initialProfile={profile}
            initialAddress={defaultAddress}
          />
        </Elements>
      </div>
    </div>
  );
}
