import React from "react";
import CheckoutForm from "./CheckoutForm";
// import "./PaymentPage.css";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export default function PaymentPage({ total, cart, onPaymentSuccess }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = React.useState(null);
  const [addresses, setAddresses] = React.useState([]);
  const [defaultAddress, setDefaultAddress] = React.useState(null);
  const [fetchedOnce, setFetchedOnce] = React.useState(false);

  // Use user?.email (a stable primitive) instead of the user object to avoid
  // infinite re-fetch loops caused by context re-creating the user object reference.
  React.useEffect(() => {
    if (user?.email && !fetchedOnce) {
      fetchUserData();
    }
  }, [user?.email]);

  const fetchUserData = async () => {
    setFetchedOnce(true); // Guard against re-fetching
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
      setAddresses(addrRes.data);
      const def = addrRes.data.find(a => a.is_default) || addrRes.data[0];
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
      padding: 'clamp(1rem, 3vw, 2rem)',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <button
        onClick={() => navigate('/cart')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
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
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        marginTop: '50px'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          color: '#1f2937'
        }}>💳 Secure Payment</h2>
        <p style={{ marginBottom: '20px', textAlign: 'center', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>
          Total Amount: <strong style={{ color: '#10b981' }}>£{total}</strong>
        </p>
        <CheckoutForm 
          total={total} 
          cart={cart} 
          onPaymentSuccess={onPaymentSuccess} 
          initialProfile={profile}
          initialAddress={defaultAddress}
          addresses={addresses}
        />
      </div>
    </div>
  );
}
