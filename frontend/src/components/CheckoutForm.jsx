import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CreditCardVisual from "./CreditCardVisual";
import { useNavigate } from "react-router-dom";

export default function CheckoutForm({ total, cart, onPaymentSuccess, initialProfile, initialAddress, addresses }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'card' && (!stripe || !elements)) return;

    setLoading(true);
    setMessage("");

    try {
      let paymentMethodId = null;

      if (paymentMethod === 'card') {
        const { error: stripeError, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: { line1: formData.address }
          }
        });

        if (stripeError) throw new Error(stripeError.message);
        paymentMethodId = stripePaymentMethod.id;
      }

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
            <div className="form-group">
              <label>Card Details</label>
              <div className="card-element-container" style={{
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#fff',
                marginTop: '0.5rem'
              }}>
                <CardElement />
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

