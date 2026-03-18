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

  // Global Payments Initialization
  useEffect(() => {
    if (paymentMethod !== 'card' || !window.GlobalPayments) return;

    // Use a small delay to ensure DOM elements are ready
    const timer = setTimeout(() => {
        try {
            // 1. Configure
            window.GlobalPayments.configure({
                publicId: import.meta.env.VITE_GP_APP_ID || "pk_test_placeholder",
            });

            // 2. Check for UI
            if (!window.GlobalPayments.ui) {
                console.error("GP UI not loaded");
                return;
            }

            // 3. Create Form
            const form = window.GlobalPayments.ui.form({
                fields: {
                    "card-number": {
                        target: "#gp-card-number",
                        placeholder: "•••• •••• •••• ••••"
                    },
                    "card-expiration": {
                        target: "#gp-card-expiry",
                        placeholder: "MM / YYYY"
                    },
                    "card-cvv": {
                        target: "#gp-card-cvv",
                        placeholder: "CVV"
                    }
                },
                styles: {
                    'input': {
                        'font-size': '16px',
                        'color': '#2E4236',
                        'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        'padding': '0px'
                    },
                    '.invalid': {
                        'color': '#dc2626'
                    },
                    'input:focus': {
                        'outline': 'none'
                    }
                }
            });

            console.log("GP Form Created:", form);
            gpFormRef.current = form;

            // 3. Setup listeners
            form.on("token-success", (resp) => {
                submitOrderWithToken(resp.paymentReference);
            });

            form.on("token-error", (resp) => {
                setMessage(`❌ Payment failed: ${resp.error.message || 'Validation error'}`);
                setLoading(false);
            });

            form.on("error", (resp) => {
                setMessage(`❌ Global Payments Error: ${resp.message}`);
                setLoading(false);
            });

        } catch (err) {
            console.error("GP Init Error:", err);
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [paymentMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (paymentMethod === 'card') {
        const form = gpFormRef.current;
        if (form) {
            console.log("Attempting GP Submit on:", form);
            if (typeof form.submit === 'function') {
                form.submit(); // Standard v1 method
            } else if (typeof form.tokenize === 'function') {
                form.tokenize(); // Possible alternative
            } else {
                console.error("GP Form instance has no submit/tokenize method:", form);
                setMessage("❌ Payment system error. Please refresh the page.");
                setLoading(false);
            }
        } else {
            setMessage("❌ Payment system not ready. Please refresh.");
            setLoading(false);
        }
    } else {
        // COD / Pay with Cash
        submitOrderWithToken(null);
    }
  };

  const submitOrderWithToken = async (paymentMethodId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
      
      // Prepare items with preparation_type
      const itemsToSubmit = cart.map(item => ({
        ...item,
        preparation_type: item.preparationType || 'CLEAN_ONLY'
      }));

      const response = await fetch(`${API_URL}/api/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: itemsToSubmit,
          total: total,
          paymentMethod: paymentMethod,
          paymentMethodId: paymentMethodId
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order placement failed");

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
                width: '100%'
            }}>
                <label style={{ color: '#2E4236', fontWeight: 800, display: 'block', marginBottom: '16px' }}>Card Information</label>
                
                <div className="gp-field-group" style={{ marginBottom: '16px', width: '100%' }}>
                    <div id="gp-card-number" style={{ 
                        height: '45px', 
                        padding: '0 12px', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '10px',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        boxSizing: 'border-box'
                    }}></div>
                </div>

                <div className="gp-row" style={{ display: 'flex', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
                    <div className="gp-field-group" style={{ flex: 1, minWidth: 0 }}>
                        <div id="gp-card-expiry" style={{ 
                            height: '45px', 
                            padding: '0 12px', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '10px',
                            backgroundColor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            boxSizing: 'border-box'
                        }}></div>
                    </div>
                    <div className="gp-field-group" style={{ flex: 1, minWidth: 0 }}>
                        <div id="gp-card-cvv" style={{ 
                            height: '45px', 
                            padding: '0 12px', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '10px',
                            backgroundColor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            boxSizing: 'border-box'
                        }}></div>
                    </div>
                </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="pay-button" style={{
            backgroundColor: paymentMethod === 'cod' ? '#10b981' : '#6F8E52',
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
            {loading ? "Processing..." : (paymentMethod === 'cod' ? "Confirm Order" : `Pay £${total}`)}
          </button>
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

