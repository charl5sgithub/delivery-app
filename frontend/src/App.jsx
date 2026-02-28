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
import AdminProducts from "./admin/AdminProducts";
import ConfirmationDialog from "./components/ConfirmationDialog";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import DeliveryBanner from "./components/DeliveryBanner";

import "./app.css";

function App() {
  const { user, isAdmin, authLoading } = useAuth();
  const [cart, setCart] = useState([]);
  // grandTotal = subtotal + delivery fee, set by Cart on checkout
  const [grandTotal, setGrandTotal] = useState(0);
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

  // Cart passes the grand total (including delivery fee) when proceeding
  const handleCheckout = (total) => {
    setGrandTotal(total);
    navigate("/payment");
  };

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

  return (
    <div className="app-container">
      <Routes>
        {/* ── Home ──────────────────────────────────────────────────────── */}
        <Route
          path="/"
          element={
            <>
              {/* Delivery reminder banner: visible Thu–Sat in UK timezone */}
              <DeliveryBanner />
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
                    >
                      <svg className="admin-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                      </svg>
                      Admin Panel
                    </button>
                  )}
                  <button
                    className="cart-toggle"
                    onClick={() => navigate("/cart")}
                  >
                    <svg className="cart-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
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
              total={grandTotal}
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
          <Route path="products" element={<AdminProducts />} />
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
