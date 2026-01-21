// src/components/Cart.jsx
import React from "react";
// import "./Cart.css";

export default function Cart({ cart, onCheckout, onUpdateQuantity, onRemoveFromCart, onBack }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <button className="back-btn" onClick={onBack}>&larr; Continue Shopping</button>
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
                  <p className="cart-item-price">₹{item.price}</p>
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
              <span>₹{total}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₹0.00</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <button className="checkout-btn" onClick={onCheckout}>
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
