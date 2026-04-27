import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: 'clamp(2rem, 5vw, 3rem)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 800,
          color: '#1f2937',
          marginBottom: '0.75rem'
        }}>
          Payment Successful!
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          marginBottom: '0.5rem',
          lineHeight: 1.6
        }}>
          Your order has been placed and payment received.
        </p>

        {orderId && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '12px 20px',
            margin: '1.5rem 0',
            display: 'inline-block'
          }}>
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Order ID: </span>
            <span style={{ color: '#059669', fontWeight: 700, fontSize: '1.1rem' }}>#{orderId}</span>
          </div>
        )}

        <p style={{
          fontSize: '0.95rem',
          color: '#9ca3af',
          marginBottom: '2rem',
          lineHeight: 1.5
        }}>
          We'll prepare your order and have it delivered soon. Thank you for shopping with us!
        </p>

        <button
          onClick={() => navigate("/")}
          style={{
            background: 'linear-gradient(135deg, #6F8E52, #5a7a42)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            padding: '14px 32px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 16px rgba(111, 142, 82, 0.3)',
            width: '100%',
            maxWidth: '280px'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          ← Back to Home
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
