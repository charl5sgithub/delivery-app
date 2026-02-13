import React, { useState, useEffect } from "react";
import { getItems } from "../services/api";
import Calendar from "../test/Calendar";
export default function LandingPage({ onAddToCart }) {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Fish"); // Default to Fish as we know we have data there
  const [showDetails, setShowDetails] = useState(false);
  const [data, setData] = useState(null);

  const [addedItems, setAddedItems] = useState({});

  const handleAddToCartClick = (item) => {
    onAddToCart(item);
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1000);
  };

  const showDetailsHandle = (dayStr) => {
    setData(dayStr);
    setShowDetails(true);
  };

  useEffect(() => {
    getItems().then((data) => setItems(data));
  }, []);

  const features = [
    { icon: "🥬", title: "Fresh Produce", desc: "Farm-fresh vegetables and fruits delivered daily." },
    { icon: "🚀", title: "Fast Delivery", desc: "Get your groceries delivered in under 30 minutes." },
    { icon: "🛡️", title: "Quality Guarantee", desc: "100% satisfaction or your money back." },
    { icon: "💳", title: "Secure Payment", desc: "Safe and secure payment options for peace of mind." },
  ];

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section" style={{ backgroundImage: 'url(/fish-vegetables-hero.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-content">
          <h1 className="hero-title">Fish & Fresh Groceries, Delivered Fast</h1>
          <p className="hero-subtitle">Experience the convenience of farm-fresh produce and daily essentials delivered right to your doorstep.</p>
          <button className="cta-button" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>
            Shop Now
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product Showcase */}
      <section id="products" className="products-section">
        <h2 className="section-title">Our Products</h2>

        {/* Category Tabs */}
        <div className="category-tabs">
          {["Grocery", "Chicken", "Goat", "Fish"].map((category) => (
            <button
              key={category}
              className={`tab-btn ${activeCategory === category ? "active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="item-grid">
          {items
            .filter((item) => {
              const cat = item.category ? item.category.toLowerCase() : "";
              if (activeCategory === "Fish") return cat === "fish" || cat === "seafood";
              return cat === activeCategory.toLowerCase();
            })
            .map((item) => (
              <div key={item.id} className="item-card">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">£{item.price}</p>
                  <button
                    className={`add-btn ${addedItems[item.id] ? 'added' : ''}`}
                    onClick={() => handleAddToCartClick(item)}
                  >
                    {addedItems[item.id] ? 'Added! ✔️' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-column">
            <h4>About Us</h4>
            <ul>
              <li>Our Story</li>
              <li>Careers</li>
              <li>Sustainability</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Customer Service</h4>
            <ul>
              <li>Help Center</li>
              <li>Returns</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Connect</h4>
            <ul>
              <li>Instagram</li>
              <li>Twitter</li>
              <li>Facebook</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2024 Grocery Delivery App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
