// src/components/Cart.jsx
import React from "react";
// import "./Cart.css";

export default function Cart({ cart, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart-container">
      <h2>Your Cart 🛒</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.name} - ₹{item.price}
              </li>
            ))}
          </ul>
          <h3>Total: ₹{total}</h3>
          <button className="checkout-btn" onClick={onCheckout}>
            Proceed to Payment
          </button>
        </>
      )}
    </div>
  );
}
