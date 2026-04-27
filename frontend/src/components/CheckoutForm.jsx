import React, { useState, useEffect, useRef } from "react";
import CreditCardVisual from "./CreditCardVisual";
import { useNavigate } from "react-router-dom";

export default function CheckoutForm({ total, cart, onPaymentSuccess, initialProfile, initialAddress, addresses }) {
  const navigate = useNavigate();
  const gpFormRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedAddressId, setSelectedAddressId] = useState(initialAddress?.address_id || null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  React.useEffect(() => {
    if (initialProfile) {
      setFormData(prev => ({
        ...prev,
        name: `${initialProfile.first_name || ''} ${initialProfile.last_name || ''}`.trim(),
        email: initialProfile.email || '',
        phone: initialProfile.phone || ''
      }));
    }
  }, [initialProfile]);

  React.useEffect(() => {
    if (initialAddress) {
      const addrString = `${initialAddress.address_line1}, ${initialAddress.city}, ${initialAddress.postcode}`;
      setFormData(prev => ({ ...prev, address: addrString }));
      setSelectedAddressId(initialAddress.address_id);
    }
  }, [initialAddress]);

  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr.address_id);
    const addrString = `${addr.address_line1}, ${addr.city}, ${addr.postcode}`;
    setFormData(prev => ({ ...prev, address: addrString }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
    if (e.target.name === 'address') {
      setSelectedAddressId(null); // Clear selection if manually edited
    }
  };

  // Initialize Global Payments Hosted Fields when 'card' is selected
  useEffect(() => {
    if (paymentMethod !== 'card') return;

    let cancelled = false;

    const initGP = async () => {
      // Move this OUTSIDE and BEFORE the try block
      if (!window.GlobalPayments) {
        setMessage("Payment gateway failed to load. Please refresh.");
        return;
      }

      const GP = window.GlobalPayments; // ← declare here, at the top

      try {
        const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
        const tokenRes = await fetch(`${API_URL}/api/orders/access-token`);
        const tokenData = await tokenRes.json();
        if (!tokenData.token) throw new Error("Could not retrieve access token.");

        if (cancelled) return;

        GP.configure({
          env: "sandbox",
          accessToken: tokenData.token,
          apiVersion: "2021-03-22",
          apms: {
            clickToPay: { enabled: false }
          }
        });

        const styleConfig = {
          "input": {
            "font-size": "16px",
            "font-family": "system-ui, -apple-system, sans-serif",
            "color": "#374151"
          },
          "input::placeholder": {
            "color": "#9ca3af"
          },
          "button": {
            "background-color": "#6F8E52",
            "color": "white",
            "border": "none",
            "border-radius": "12px",
            "font-weight": "800",
            "font-size": "1.1rem",
            "padding": "16px",
            "cursor": "pointer",
            "width": "100%",
            "margin-top": "1rem"
          }
        };

        const formInstance = GP.ui.form({
          fields: {
            "card-number": { target: "#card-number", placeholder: "•••• •••• •••• ••••" },
            "card-expiration": { target: "#card-expiration", placeholder: "MM / YYYY" },
            "card-cvv": { target: "#card-cvv", placeholder: "•••" },
            "submit": { value: `Pay £${total}`, target: "#gp-submit-button" }
          },
          styles: styleConfig
        });

        gpFormRef.current = formInstance;

        formInstance.on("token-success", (resp) => {
          if (!cancelled) submitOrderWithToken(resp.paymentReference);
        });

        formInstance.on("token-error", (resp) => {
          console.error("Global Payments Tokenization Error:", resp);
          if (!cancelled) {
            let errorText = "Unknown error";
            if (resp.reasons && resp.reasons.length > 0) {
                errorText = resp.reasons[0].message;
            } else if (resp.error && resp.error.message) {
                errorText = resp.error.message;
            }
            setMessage("Failed to process card: " + errorText);
            setLoading(false);
          }
        });

      } catch (err) {
        if (!cancelled) setMessage("Failed to initialize payment gateway. " + err.message);
      }
    };

    initGP();

    return () => {
      cancelled = true;
      gpFormRef.current = null;
      // Wipe the iframe containers on unmount
      ['#card-number', '#card-expiration', '#card-cvv', '#gp-submit-button'].forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.innerHTML = '';
      });
    };
  }, [paymentMethod, total]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (paymentMethod === 'cod') {
      submitOrderWithToken(null);
    }
    // Note: If paymentMethod === 'card', the GP iframe intercepts the click on its injected button
    // and fires the 'token-success' event, routing through submitOrderWithToken asynchronously.
  };

  const submitOrderWithToken = async (paymentMethodId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

      // Prepare items with preparation_type
      const itemsToSubmit = cart.map(item => ({
        ...item,
        preparation_type: item.preparationType || 'CLEAN_ONLY'
      }));

      // Parse address parts from the combined address string
      const addressParts = formData.address.split(',').map(p => p.trim());
      const addressLine = addressParts[0] || formData.address;
      const cityPart = addressParts[1] || '';
      const postcodePart = addressParts[2] || '';

      const response = await fetch(`${API_URL}/api/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: addressLine,
          city: cityPart,
          postcode: postcodePart,
          items: itemsToSubmit,
          total: total,
          paymentMethod: paymentMethod,
          paymentMethodId: paymentMethodId,
          label: "Other"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Show success via callback for both card and COD
      setMessage("✅ Order placed successfully!");
      setTimeout(() => {
        onPaymentSuccess(paymentMethod);
        setLoading(false);
      }, 1000);

    } catch (error) {
      setMessage("❌ Checkout failed: " + error.message);
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
            <label style={{ color: '#6F8E52', fontWeight: 700 }}>Email Address*</label>
            <input
              name="email"
              type="email"
              required
              readOnly={!!initialProfile?.email}
              className={`form-input ${initialProfile?.email ? 'readonly' : ''}`}
              style={{ backgroundColor: '#fdfcf0', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-grid-checkout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label style={{ color: '#6F8E52', fontWeight: 700 }}>Full Name*</label>
              <input
                name="name"
                type="text"
                required
                className="form-input"
                style={{ backgroundColor: '#fdfcf0', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label style={{ color: '#6F8E52', fontWeight: 700 }}>Phone Number*</label>
              <input
                name="phone"
                type="tel"
                required
                className="form-input"
                style={{ backgroundColor: '#fdfcf0', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: '1.5rem 0' }}>
            <label style={{ color: '#6F8E52', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
              Select Delivery Address
            </label>
            <div className="address-selector" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '10px',
              marginBottom: '16px'
            }}>
              {addresses?.map(addr => (
                <div
                  key={addr.address_id}
                  onClick={() => handleAddressSelect(addr)}
                  className={`address-tile ${selectedAddressId === addr.address_id ? 'active' : ''}`}
                  style={{
                    padding: '12px',
                    border: `2px solid ${selectedAddressId === addr.address_id ? '#6F8E52' : '#eee'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: selectedAddressId === addr.address_id ? '#f1f8eb' : '#fff',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>📍</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4b4a45', textTransform: 'uppercase' }}>
                    {addr.label || 'Home'}
                  </span>
                </div>
              ))}
              <div
                onClick={() => navigate('/profile')}
                className="address-tile add-new"
                style={{
                  padding: '12px',
                  border: '2px dashed #ddd',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>+</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8a867a' }}>Manage Addresses</span>
              </div>
            </div>

            <textarea
              name="address"
              required
              placeholder="Delivery details..."
              className="form-input"
              rows="3"
              style={{
                backgroundColor: '#fdfcf0',
                border: '1.5px solid rgba(111, 142, 82, 0.2)',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '0.9rem',
                width: '100%',
                boxSizing: 'border-box'
              }}
              value={formData.address}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="payment-method-section" style={{ margin: '2rem 0', textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 800, color: '#2E4236', fontSize: '1.1rem' }}>
              Payment Method
            </label>
            <div className="payment-toggle-container" style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              padding: '4px'
            }}>
              <div
                onClick={() => setPaymentMethod('card')}
                className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  maxWidth: '180px',
                  padding: '16px',
                  borderRadius: '16px',
                  border: `2px solid ${paymentMethod === 'card' ? '#6F8E52' : '#eee'}`,
                  backgroundColor: paymentMethod === 'card' ? '#f1f8eb' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: paymentMethod === 'card' ? '0 4px 12px rgba(111, 142, 82, 0.15)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>💳</span>
                <span style={{ fontWeight: 700, color: paymentMethod === 'card' ? '#2E4236' : '#8a867a' }}>Pay by Card</span>
              </div>

              <div
                onClick={() => setPaymentMethod('cod')}
                className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  maxWidth: '180px',
                  padding: '16px',
                  borderRadius: '16px',
                  border: `2px solid ${paymentMethod === 'cod' ? '#10b981' : '#eee'}`,
                  backgroundColor: paymentMethod === 'cod' ? '#ecfdf5' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: paymentMethod === 'cod' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>💵</span>
                <span style={{ fontWeight: 700, color: paymentMethod === 'cod' ? '#065f46' : '#8a867a' }}>Pay with Cash</span>
              </div>
            </div>
          </div>

          {paymentMethod === 'card' && (
            <div className="handepay-container" style={{
              marginTop: '1.5rem',
              padding: '24px',
              backgroundColor: '#fdfcf0',
              borderRadius: '16px',
              border: '1.5px solid rgba(111, 142, 82, 0.2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              boxSizing: 'border-box',
              width: '100%',
              textAlign: 'left'
            }}>
              <label style={{ color: '#2E4236', fontWeight: 800, display: 'block', marginBottom: '16px', textAlign: 'center' }}>Secure Payment Processing</label>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#6F8E52', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Card Number</label>
                <div id="card-number" style={{ height: '48px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '12px' }}></div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#6F8E52', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Expiry Date</label>
                  <div id="card-expiration" style={{ height: '48px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '12px' }}></div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#6F8E52', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>CVV</label>
                  <div id="card-cvv" style={{ height: '48px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '12px' }}></div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'card' ? (
            <div id="gp-submit-button" style={{
              width: '100%',
              height: '70px', /* Allow space for padding + margin inside iframe */
              marginTop: '1rem'
            }}></div>
          ) : (
            <button type="submit" disabled={loading} className="pay-button" style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '1.1rem',
              cursor: 'pointer',
              width: '100%',
              marginTop: '1rem'
            }}>
              {loading ? "Processing..." : "Confirm Order"}
            </button>
          )}

          {message && <p className="payment-message" style={{ textAlign: 'center', marginTop: '1rem', color: message.startsWith('✅') ? '#059669' : '#dc2626' }}>{message}</p>}
        </form>
      </div>
      <style>{`
        .address-tile:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border-color: #6F8E52 !important;
        }
        .payment-option:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }
        .form-input.readonly {
            background-color: #f3f4f6 !important;
            color: #6b7280;
            cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

