import { useState } from "react";
import Login from "./components/Login";
import LandingPage from "./components/LandingPage";
import Cart from "./components/Cart";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const handleAddToCart = (item) => {
    setCart([...cart, item]);
  };

  const handleCheckout = () => {
    alert("Proceeding to Payment Page (Coming Soon)");
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Welcome, {user.displayName}</h1>
        <button className="cart-toggle" onClick={() => setShowCart(!showCart)}>
          {showCart ? "Back to Shop" : `View Cart (${cart.length})`}
        </button>
      </header>

      {showCart ? (
        <Cart cart={cart} onCheckout={handleCheckout} />
      ) : (
        <LandingPage onAddToCart={handleAddToCart} />
      )}
    </div>
  );
}

export default App;
