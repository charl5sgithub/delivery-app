import React from "react";

const items = [
  { id: 1, name: "Rice", price: 50, image: "/images/rice.jpg" },
  { id: 2, name: "Flour", price: 40, image: "/images/flour.jpg" },
  { id: 3, name: "Masala", price: 30, image: "/images/masala.jpg" },
  { id: 4, name: "Noodles", price: 25, image: "/images/noodles.jpg" },
];

export default function LandingPage({ onAddToCart }) {
  return (
    <div className="landing-container">
      <h2 className="landing-title">🛍️ Shop Grocery Essentials</h2>
      <div className="item-grid">
        {items.map((item) => (
          <div key={item.id} className="item-card">
            <img src={item.image} alt={item.name} className="item-image" />
            <h3>{item.name}</h3>
            <p>£{item.price}</p>
            <button className="add-btn" onClick={() => onAddToCart(item)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
