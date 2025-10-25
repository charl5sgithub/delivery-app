import { useState } from "react";
import Login from "./components/Login";
import Cart from "./components/Cart";
import PaymentPage from "./components/PaymentPage";
import LandingPage from "./components/Landingpage";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState("shop");

  const handleAddToCart = (item) => setCart([...cart, item]);
  const handleCheckout = () => setPage("payment");
  const handlePaymentSuccess = () => {
    alert("🎉 Payment completed successfully!");
    setCart([]);
    setPage("shop");
  };

  if (!user) return <Login onLogin={setUser} />;

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="app-container">
      {page === "shop" && (
        <>
          <header className="app-header">
            <h1>Welcome, {user.displayName}</h1>
            <button onClick={() => setPage("cart")}>
              View Cart ({cart.length})
            </button>
          </header>
          <LandingPage onAddToCart={handleAddToCart} />
        </>
      )}

      {page === "cart" && (
        <Cart cart={cart} onCheckout={handleCheckout} />
      )}

      {page === "payment" && (
        <PaymentPage total={total} onPaymentSuccess={handlePaymentSuccess} />
      )}
    </div>
  );
}

export default App;
