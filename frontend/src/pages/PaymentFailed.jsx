import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)',
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
        {/* Error Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 800,
          color: '#1f2937',
          marginBottom: '0.75rem'
        }}>
          Payment Failed
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          marginBottom: '0.5rem',
          lineHeight: 1.6
        }}>
          Unfortunately, your payment could not be processed.
        </p>

        <p style={{
          fontSize: '0.95rem',
          color: '#9ca3af',
          marginBottom: '2rem',
          lineHeight: 1.5
        }}>
          This could be due to insufficient funds, an expired card, or a temporary issue. 
          Please try again or use a different payment method.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => navigate("/payment")}
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
            🔄 Try Again
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              padding: '12px 32px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              maxWidth: '280px'
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#9ca3af';
              e.target.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.color = '#6b7280';
            }}
          >
            ← Back to Home
          </button>
        </div>
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
