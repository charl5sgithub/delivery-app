import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CreditCardVisual from "./CreditCardVisual";

export default function CheckoutForm({ total, cart, onPaymentSuccess, initialProfile, initialAddress }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState('card');

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  React.useEffect(() => {
    if (initialProfile || initialAddress) {
      setFormData(prev => ({
        ...prev,
        name: initialProfile ? `${initialProfile.first_name || ''} ${initialProfile.last_name || ''}`.trim() : prev.name,
        email: initialProfile?.email || prev.email,
        phone: initialProfile?.phone || prev.phone,
        address: initialAddress ? `${initialAddress.address_line1}, ${initialAddress.city}, ${initialAddress.postcode}` : prev.address
      }));
    }
  }, [initialProfile, initialAddress]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit triggered. Payment Method:", paymentMethod);

    if (paymentMethod === 'card' && (!stripe || !elements)) {
      console.warn("Stripe or Elements not loaded for card payment.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let paymentMethodId = null;

      if (paymentMethod === 'card') {
        console.log("Creating Stripe Payment Method...");
        // 1. Create Stripe Payment Method
        const { error: stripeError, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address
            }
          }
        });

        if (stripeError) {
          console.error("Stripe Error:", stripeError);
          throw new Error(stripeError.message);
        }
        paymentMethodId = stripePaymentMethod.id;
        console.log("Stripe Payment Method created:", paymentMethodId);
      }

      // 2. Send Order to Backend
      const rawApiUrl = import.meta.env.VITE_API_URL;
      const API_URL = rawApiUrl?.replace(/\/$/, "");
      console.log("Targeting API URL:", API_URL);

      const response = await fetch(`${API_URL}/api/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData, // name, email, phone, address
          items: cart,
          total: total,
          paymentMethod: paymentMethod, // 'card' or 'cod'
          paymentMethodId: paymentMethodId
        }),
      });

      console.log("API Response Status:", response.status);
      const data = await response.json();
      console.log("API Response Data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Order placement failed");
      }

      setMessage("✅ Order placed successfully!");
      // clear form or similar?
      setTimeout(() => {
        onPaymentSuccess(paymentMethod);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error("Submission Catch Error:", error);
      setMessage("❌ Payment failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="checkout-layout">
      <div className="checkout-visual-side">
        {paymentMethod === 'card' ? (
          <CreditCardVisual name={formData.name || "Card Holder"} />
        ) : (
          <div className="cod-visual" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: '1rem',
            color: '#4b5563'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💵</div>
            <h3>Cash on Delivery</h3>
            <p>Pay conveniently at your doorstep.</p>
          </div>
        )}
      </div>

      <div className="checkout-form-side">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label style={{ color: '#6F8E52', fontWeight: 700 }}>Name</label>
            <input
              name="name"
              type="text"
              required
              placeholder="John Doe"
              className="form-input"
              style={{ backgroundColor: '#fdfcf0', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label style={{ color: '#6F8E52', fontWeight: 700 }}>Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              className="form-input"
              style={{ backgroundColor: '#fdfcf0', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label style={{ color: '#6F8E52', fontWeight: 700 }}>Phone Number</label>
            <input
              name="phone"
              type="tel"
              required
              placeholder="+44 7123 456789"
              className="form-input"
              style={{ backgroundColor: '#fdfcf0', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: '#4b5563' }}>Payment Method</label>
            <div style={{
              display: 'inline-flex',
              backgroundColor: '#f3f4f6',
              padding: '4px',
              borderRadius: '2rem',
              position: 'relative',
              cursor: 'pointer',
              userSelect: 'none',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {/* Sliding Highlight */}
              <div style={{
                position: 'absolute',
                top: '4px',
                left: paymentMethod === 'card' ? '4px' : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)',
                height: 'calc(100% - 8px)',
                backgroundColor: 'white',
                borderRadius: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1
              }}></div>

              <div
                onClick={() => setPaymentMethod('card')}
                style={{
                  padding: '12px 20px',
                  borderRadius: '2rem',
                  zIndex: 2,
                  color: paymentMethod === 'card' ? '#2563eb' : '#6b7280',
                  fontWeight: paymentMethod === 'card' ? 700 : 500,
                  transition: 'all 0.3s',
                  minWidth: window.innerWidth < 480 ? '120px' : '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>💳</span>
                <span style={{ fontSize: window.innerWidth < 480 ? '0.85rem' : '1rem' }}>Pay by Card</span>
              </div>
              <div
                onClick={() => setPaymentMethod('cod')}
                style={{
                  padding: '12px 20px',
                  borderRadius: '2rem',
                  zIndex: 2,
                  color: paymentMethod === 'cod' ? '#059669' : '#6b7280',
                  fontWeight: paymentMethod === 'cod' ? 700 : 500,
                  transition: 'all 0.3s',
                  minWidth: window.innerWidth < 480 ? '120px' : '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>💵</span>
                <span style={{ fontSize: window.innerWidth < 480 ? '0.85rem' : '1rem' }}>COD</span>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label style={{ color: '#6F8E52', fontWeight: 700 }}>Delivery Address</label>
            <textarea
              name="address"
              required
              placeholder="123 Main St, City, Postcode"
              className="form-input"
              rows="3"
              style={{ 
                backgroundColor: '#fdfcf0', 
                border: '1.5px solid rgba(111, 142, 82, 0.2)',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '0.95rem'
              }}
              value={formData.address}
              onChange={handleChange}
            ></textarea>
            <p style={{ fontSize: '0.75rem', color: '#8a867a', marginTop: '4px' }}>
              ✨ Pre-filled from your profile. Feel free to edit for this delivery.
            </p>
          </div>

          {paymentMethod === 'card' && (
            <div className="form-group">
              <label>Card Details</label>
              <div className="card-element-container" style={{
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#fff',
                marginTop: '0.5rem'
              }}>
                <CardElement
                  className="card-element"
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': { color: '#aab7c4' },
                      },
                      invalid: { color: '#9e2146' },
                    },
                  }}
                />
              </div>
              {!stripe && <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>⌛ Loading payment security...</p>}
            </div>
          )}

          <button type="submit" disabled={loading || (paymentMethod === 'card' && !stripe)} className="pay-button" style={{
            backgroundColor: paymentMethod === 'cod' ? '#10b981' : undefined,
            opacity: (paymentMethod === 'card' && !stripe) ? 0.7 : 1,
            cursor: (paymentMethod === 'card' && !stripe) ? 'not-allowed' : 'pointer'
          }}>
            {loading ? "Processing..." :
              (paymentMethod === 'card' && !stripe) ? "Initialising..." :
                (paymentMethod === 'cod' ? "Submit Order" : `Pay £${total}`)}
          </button>
          {message && <p className="payment-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}
