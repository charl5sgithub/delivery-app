import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CreditCardVisual from "./CreditCardVisual";
import { findAddresses } from "../utils/addressService";

export default function CheckoutForm({ total, cart, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Address Autocomplete State
  const [postcode, setPostcode] = useState("");
  const [addressOptions, setAddressOptions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleFindAddress = async () => {
    if (!postcode) {
      setMessage("Please enter a postcode first.");
      return;
    }
    setAddressLoading(true);
    setMessage("");
    try {
      const addresses = await findAddresses(postcode);
      setAddressOptions(addresses);
      if (addresses.length > 0) {
        // Automatically select the first one or just show dropdown
        // We'll let user select from dropdown
      }
    } catch (error) {
      console.error(error);
      setMessage("Address search failed: " + error.message);
      setAddressOptions([]);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddressSelect = (e) => {
    const idx = e.target.value;
    if (idx !== "") {
      const selected = addressOptions[idx];
      setFormData({
        ...formData,
        address: selected.label,
        latitude: selected.latitude,
        longitude: selected.longitude
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    try {
      let paymentMethodId = null;

      if (paymentMethod === 'card') {
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
          throw new Error(stripeError.message);
        }
        paymentMethodId = stripePaymentMethod.id;
      }

      // 2. Send Order to Backend
      const API_URL = import.meta.env.VITE_API_URL;
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

      const data = await response.json();

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
      console.error(error);
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
            <label>Name</label>
            <input
              name="name"
              type="text"
              required
              placeholder="John Doe"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              name="phone"
              type="tel"
              required
              placeholder="+1 234 567 890"
              className="form-input"
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
              border: '1px solid #e5e7eb'
            }} onClick={() => setPaymentMethod(paymentMethod === 'card' ? 'cod' : 'card')}>
              {/* Sliding Highlight */}
              <div style={{
                position: 'absolute',
                top: '4px',
                left: paymentMethod === 'card' ? '4px' : '50%',
                width: 'calc(50% - 4px)',
                height: 'calc(100% - 8px)',
                backgroundColor: 'white',
                borderRadius: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1
              }}></div>

              <div style={{
                padding: '12px 28px',
                borderRadius: '2rem',
                zIndex: 2,
                color: paymentMethod === 'card' ? '#2563eb' : '#6b7280',
                fontWeight: paymentMethod === 'card' ? 700 : 500,
                transition: 'all 0.3s',
                minWidth: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>💳</span> Pay by Card
              </div>
              <div style={{
                padding: '12px 28px',
                borderRadius: '2rem',
                zIndex: 2,
                color: paymentMethod === 'cod' ? '#059669' : '#6b7280',
                fontWeight: paymentMethod === 'cod' ? 700 : 500,
                transition: 'all 0.3s',
                minWidth: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span style={{ marginLeft: '10px', fontSize: '1.2rem' }}>💵</span> Cash on Delivery
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Address Lookup (UK)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Enter Postcode (e.g. SW1A 1AA)"
                className="form-input"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleFindAddress}
                disabled={addressLoading}
                className="cta-button"
                style={{ width: 'auto', marginTop: 0, padding: '0 1rem', fontSize: '0.9rem' }}
              >
                {addressLoading ? 'Searching...' : 'Find Address'}
              </button>
            </div>
            {addressOptions.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <select
                  className="form-input"
                  onChange={handleAddressSelect}
                  defaultValue=""
                >
                  <option value="" disabled>Select an address...</option>
                  {addressOptions.map((addr, index) => (
                    <option key={index} value={index}>{addr.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Full Address</label>
            <textarea
              name="address"
              required
              placeholder="123 Main St, City, Country"
              className="form-input"
              rows="3"
              value={formData.address}
              onChange={handleChange}
            ></textarea>
          </div>

          {paymentMethod === 'card' && (
            <div className="form-group">
              <label>Card Details</label>
              <div className="card-element-container">
                <CardElement className="card-element" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading || (paymentMethod === 'card' && !stripe)} className="pay-button" style={{
            backgroundColor: paymentMethod === 'cod' ? '#10b981' : undefined
          }}>
            {loading ? "Processing..." : (paymentMethod === 'cod' ? "Submit Order" : `Pay ₹${total}`)}
          </button>
          {message && <p className="payment-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}
