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
      <section className="hero-section" style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1440&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%'
      }}>
        <div className="hero-content">
          <h1 className="hero-title">Premium Fish & Fresh Meat</h1>
          <p className="hero-subtitle">The finest cuts of meat and fresh-catch seafood, delivered directly from the market to your kitchen.</p>
          <button className="cta-button" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>
            Order Now
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
        <h2 className="section-title">Our Categories</h2>

        {/* Category Tabs */}
        <div className="category-tabs">
          {["Grocery", "Meat", "Chicken", "Fish"].map((category) => (
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
