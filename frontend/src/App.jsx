import { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useAuth } from "./context/AuthContext";

import Login from "./components/Login";
import Cart from "./components/Cart";
import PaymentPage from "./components/PaymentPage";
import LandingPage from "./components/Landingpage";
import AdminLayout from "./components/AdminLayout";
import AdminOrders from "./admin/AdminOrders";
import AdminCustomers from "./admin/AdminCustomers";
import AdminDeliveryMap from "./admin/AdminDeliveryMap";
import ConfirmationDialog from "./components/ConfirmationDialog";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import "./App.css";

function App() {
  const { user, isAdmin, authLoading } = useAuth();
  const [cart, setCart] = useState([]);
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false, title: "", message: "", onConfirm: () => { }
  });
  const navigate = useNavigate();

  if (authLoading) return <div className="loading">Loading…</div>;
  if (!user) return <Login />;

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleCheckout = () => navigate("/payment");

  const handlePaymentSuccess = (method = "card") => {
    const isCOD = method === "cod";
    setDialogConfig({
      isOpen: true,
      title: "Success",
      message: isCOD
        ? "🎉 Order placed successfully! Please pay on delivery."
        : "🎉 Payment completed successfully!",
      isAlert: true,
      onConfirm: () => {
        setDialogConfig((prev) => ({ ...prev, isOpen: false }));
        setCart([]);
        navigate("/");
      }
    });
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="app-container">
      <Routes>
        {/* ── Home ──────────────────────────────────────────────────────── */}
        <Route
          path="/"
          element={
            <>
              <header className="app-header">
                <div className="header-left">
                  <h1>Welcome, {user.displayName}</h1>
                </div>
                <div className="header-right">
                  {/* Only SuperUser / Admin see the Admin Panel button */}
                  {isAdmin && (
                    <button
                      className="admin-btn"
                      onClick={() => navigate("/admin/orders")}
                      style={{ marginRight: "10px", backgroundColor: "#374151" }}
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    className="cart-toggle"
                    onClick={() => navigate("/cart")}
                  >
                    View Cart ({cartCount})
                  </button>
                </div>
              </header>
              <LandingPage onAddToCart={handleAddToCart} />
            </>
          }
        />

        {/* ── Cart ──────────────────────────────────────────────────────── */}
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

        {/* ── Payment ───────────────────────────────────────────────────── */}
        <Route
          path="/payment"
          element={
            <PaymentPage
              total={total}
              cart={cart}
              onPaymentSuccess={handlePaymentSuccess}
            />
          }
        />

        {/* ── Admin (RBAC-guarded) ───────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout user={user} />
            </ProtectedAdminRoute>
          }
        >
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="delivery" element={<AdminDeliveryMap />} />
          <Route index element={<Navigate to="orders" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ConfirmationDialog
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onConfirm={dialogConfig.onConfirm}
        onCancel={() => setDialogConfig((prev) => ({ ...prev, isOpen: false }))}
        isAlert={dialogConfig.isAlert}
        confirmText="OK"
      />
    </div>
  );
}

export default App;
