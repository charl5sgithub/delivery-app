import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CreditCardVisual from "./CreditCardVisual";

export default function CheckoutForm({ total, cart, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    try {
      // 1. Create Stripe Payment Method (Optional, for validation)
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
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
          paymentMethodId: paymentMethod.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Order placement failed");
      }

      setMessage("✅ Order placed successfully!");
      // clear form or similar?
      setTimeout(() => {
        onPaymentSuccess();
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
        <CreditCardVisual name={formData.name || "Card Holder"} />
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
          <div className="form-group">
            <label>Address</label>
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

          <div className="form-group">
            <label>Card Details</label>
            <div className="card-element-container">
              <CardElement className="card-element" />
            </div>
          </div>

          <button type="submit" disabled={!stripe || loading} className="pay-button">
            {loading ? "Processing..." : `Pay ₹${total}`}
          </button>
          {message && <p className="payment-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}
