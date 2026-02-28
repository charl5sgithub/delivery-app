// src/components/Cart.jsx
import React from "react";

/** £1 delivery fee for orders under £20, free at £20+ */
const DELIVERY_THRESHOLD = 20;
const DELIVERY_FEE = 1;

export default function Cart({ cart, onCheckout, onUpdateQuantity, onRemoveFromCart, onBack }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal < DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;

  const fmtGBP = (n) =>
    n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // How much more the customer needs for free delivery
  const remaining = DELIVERY_THRESHOLD - subtotal;

  return (
    <div className="cart-page">
      <button className="back-btn" onClick={onBack}>← Continue Shopping</button>
      <h2 className="cart-title">Your Cart 🛒</h2>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h3>Your cart is empty</h3>
          <p>Time to add some delicious groceries!</p>
        </div>
      ) : (
        <div className="cart-card-unified">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">£{fmtGBP(item.price)}</p>
                </div>
                <div className="quantity-controls">
                  <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, -1)}>-</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => onRemoveFromCart(item.id)}>
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>£{fmtGBP(subtotal)}</span>
            </div>

            <div className="summary-row" style={{ alignItems: "flex-start" }}>
              <span>Delivery Fee</span>
              <span style={{ textAlign: "right" }}>
                {deliveryFee === 0 ? (
                  <span style={{ color: "#10b981", fontWeight: 700 }}>FREE</span>
                ) : (
                  <span>£{fmtGBP(deliveryFee)}</span>
                )}
              </span>
            </div>

            {/* Nudge bar: how much more to unlock free delivery */}
            {deliveryFee > 0 && (
              <div style={{
                margin: "10px 0 14px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "0.82rem",
                color: "#065f46",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}>
                <span>
                  🛒 Add <strong>£{fmtGBP(remaining)}</strong> more for{" "}
                  <strong>FREE delivery!</strong>
                </span>
                {/* Progress bar */}
                <div style={{
                  background: "#d1fae5", borderRadius: "99px", height: "5px", overflow: "hidden"
                }}>
                  <div style={{
                    width: `${Math.min(100, (subtotal / DELIVERY_THRESHOLD) * 100)}%`,
                    background: "#10b981",
                    height: "100%",
                    borderRadius: "99px",
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            )}

            <div className="summary-row total">
              <span>Total</span>
              <span>£{fmtGBP(grandTotal)}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={() => onCheckout(grandTotal)}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
