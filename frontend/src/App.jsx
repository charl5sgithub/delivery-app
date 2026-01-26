import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import Login from "./components/Login";
import Cart from "./components/Cart";
import PaymentPage from "./components/PaymentPage";
import LandingPage from "./components/Landingpage";
import "./App.css";

import AdminLayout from "./components/AdminLayout";
import AdminOrders from "./admin/AdminOrders";
import AdminCustomers from "./admin/AdminCustomers";
import AdminDeliveryMap from "./admin/AdminDeliveryMap";

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId, delta) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const handleCheckout = () => navigate("/payment");
  const handlePaymentSuccess = () => {
    alert("🎉 Payment completed successfully!");
    setCart([]);
    navigate("/");
  };

  if (authLoading) return <div className="loading">Loading...</div>;

  if (!user) return <Login onLogin={setUser} />;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <header className="app-header">
                <div className="header-left">
                  <h1>Welcome, {user.displayName}</h1>
                </div>
                <div className="header-right">
                  <button className="admin-btn" onClick={() => navigate("/admin/orders")} style={{ marginRight: '10px', backgroundColor: '#374151' }}>
                    Admin Panel
                  </button>
                  <button className="cart-toggle" onClick={() => navigate("/cart")}>
                    View Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})
                  </button>
                </div>
              </header>
              <LandingPage onAddToCart={handleAddToCart} />
            </>
          }
        />
        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              onCheckout={handleCheckout}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onBack={() => navigate("/")}
            />
          }
        />
        <Route
          path="/payment"
          element={
            <PaymentPage total={total} cart={cart} onPaymentSuccess={handlePaymentSuccess} />
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout user={user} />}>
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="delivery" element={<AdminDeliveryMap />} />
          <Route index element={<Navigate to="orders" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
