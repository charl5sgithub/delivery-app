import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

export default function Login() {
  const { login } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState('email');        // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successFlash, setSuccessFlash] = useState(false);

  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

  // Cleanup cooldown timer on unmount
  useEffect(() => () => clearInterval(cooldownRef.current), []);

  function startCooldown(seconds = 60) {
    setResendCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  // ── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to send OTP. Try again.'); return; }
      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 2000);
      setStep('otp');
      startCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 180);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid OTP. Please try again.'); return; }
      login(data.token);   // ← AuthContext stores it and updates state
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // OTP input: auto-advance, handle paste, handle backspace
  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setError('');
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) setTimeout(() => handleVerifyOtp(), 80);
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6).fill('').map((_, i) => pasted[i] || '');
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) setTimeout(() => handleVerifyOtp(), 80);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    await handleSendOtp({ preventDefault: () => {} });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .otp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a2b22 0%, #2E4236 40%, #3d5947 70%, #6F8E52 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* ── Background decorations ── */
        .otp-bg-blob {
          position: absolute; pointer-events: none; z-index: 0;
          border-radius: 62% 38% 46% 54% / 60% 44% 56% 40%;
        }
        .otp-bg-blob-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(111,142,82,0.15) 0%, transparent 70%);
          top: -180px; right: -80px;
          animation: otp-blob 9s ease-in-out infinite;
        }
        .otp-bg-blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
          bottom: -120px; left: -80px;
          animation: otp-blob 11s ease-in-out 2s infinite reverse;
        }
        .otp-bg-dots {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.055) 1.5px, transparent 1.5px);
          background-size: 30px 30px;
        }
        @keyframes otp-blob {
          0%, 100% { border-radius: 62% 38% 46% 54% / 60% 44% 56% 40%; }
          33% { border-radius: 40% 60% 70% 30% / 50% 60% 40% 50%; }
          66% { border-radius: 70% 30% 40% 60% / 40% 70% 30% 60%; }
        }

        /* ── Card ── */
        .otp-card {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 28px;
          padding: 48px 44px;
          width: 100%; max-width: 440px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10);
          animation: otp-card-in 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes otp-card-in {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Logo / icon area ── */
        .otp-logo-wrap {
          text-align: center; margin-bottom: 28px;
        }
        .otp-logo-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 72px; height: 72px; border-radius: 22px;
          background: linear-gradient(135deg, #6F8E52, #2E4236);
          font-size: 2.1rem;
          box-shadow: 0 12px 32px rgba(46,66,54,0.5);
          margin-bottom: 18px;
          animation: otp-icon-pop 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both;
        }
        @keyframes otp-icon-pop {
          from { opacity: 0; transform: scale(0.6) rotate(-12deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .otp-brand-name {
          font-size: 1.55rem; font-weight: 900; color: #fff;
          letter-spacing: -0.02em;
        }
        .otp-brand-tag {
          font-size: 0.82rem; color: rgba(255,255,255,0.50); font-weight: 500;
          margin-top: 4px;
        }

        /* ── Step heading ── */
        .otp-step-title {
          font-size: 1.25rem; font-weight: 800; color: #fff;
          margin-bottom: 6px; letter-spacing: -0.01em;
          text-align: center;
        }
        .otp-step-sub {
          font-size: 0.88rem; color: rgba(255,255,255,0.56);
          text-align: center; line-height: 1.55; margin-bottom: 26px;
        }
        .otp-email-hint {
          color: #a3e635; font-weight: 600;
        }

        /* ── Form controls ── */
        .otp-label {
          display: block; font-size: 0.8rem; font-weight: 700;
          color: rgba(255,255,255,0.65); letter-spacing: 0.07em;
          text-transform: uppercase; margin-bottom: 8px;
        }
        .otp-input-wrap { position: relative; margin-bottom: 18px; }
        .otp-input {
          width: 100%; height: 52px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.16);
          border-radius: 14px;
          color: #fff; font-size: 1rem; font-weight: 500;
          padding: 0 46px 0 16px;
          outline: none; transition: border-color 0.2s, background 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .otp-input::placeholder { color: rgba(255,255,255,0.30); }
        .otp-input:focus {
          border-color: rgba(111,142,82,0.8);
          background: rgba(255,255,255,0.11);
          box-shadow: 0 0 0 3px rgba(111,142,82,0.18);
        }
        .otp-input-icon {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 1.15rem; pointer-events: none;
        }

        /* ── OTP boxes ── */
        .otp-boxes {
          display: flex; gap: 10px; justify-content: center;
          margin-bottom: 20px;
        }
        .otp-box {
          width: 52px; height: 60px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.16);
          border-radius: 13px;
          color: #fff; font-size: 1.6rem; font-weight: 800;
          text-align: center; outline: none;
          transition: border-color 0.2s, background 0.2s, transform 0.1s;
          font-family: 'Inter', sans-serif;
          caret-color: #6F8E52;
        }
        .otp-box:focus {
          border-color: #6F8E52;
          background: rgba(111,142,82,0.12);
          box-shadow: 0 0 0 3px rgba(111,142,82,0.2);
          transform: scale(1.06);
        }
        .otp-box.filled {
          border-color: rgba(111,142,82,0.6);
          background: rgba(111,142,82,0.12);
        }

        /* ── Primary button ── */
        .otp-btn {
          width: 100%; height: 52px;
          background: linear-gradient(135deg, #6F8E52 0%, #2E4236 100%);
          color: #fff; border: none; border-radius: 14px;
          font-size: 1rem; font-weight: 700;
          cursor: pointer; transition: all 0.22s ease;
          box-shadow: 0 8px 24px rgba(46,66,54,0.45);
          letter-spacing: 0.01em;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'Inter', sans-serif;
        }
        .otp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(46,66,54,0.55);
          background: linear-gradient(135deg, #7da05e 0%, #3d5947 100%);
        }
        .otp-btn:active:not(:disabled) { transform: translateY(0); }
        .otp-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Spinner ── */
        .otp-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: otp-spin 0.75s linear infinite;
          flex-shrink: 0;
        }
        @keyframes otp-spin { to { transform: rotate(360deg); } }

        /* ── Error / Success messages ── */
        .otp-error {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          color: #fca5a5; font-size: 0.85rem; font-weight: 500;
          padding: 10px 14px; margin-bottom: 14px;
          display: flex; align-items: flex-start; gap: 8px;
          animation: otp-fade-in 0.2s ease;
        }
        .otp-success-flash {
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 10px;
          color: #86efac; font-size: 0.85rem; font-weight: 500;
          padding: 10px 14px; margin-bottom: 14px;
          animation: otp-fade-in 0.2s ease;
        }
        @keyframes otp-fade-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Back / Resend links ── */
        .otp-links {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 18px;
        }
        .otp-link-btn {
          background: none; border: none; padding: 0;
          color: rgba(255,255,255,0.45); font-size: 0.82rem;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: color 0.2s;
          display: flex; align-items: center; gap: 4px;
        }
        .otp-link-btn:hover:not(:disabled) { color: #fff; }
        .otp-link-btn:disabled { cursor: not-allowed; opacity: 0.4; }
        .otp-resend-text { color: rgba(255,255,255,0.45); font-size: 0.82rem; }
        .otp-resend-active { color: #a3e635; cursor: pointer; font-weight: 600; }

        /* ── Divider ── */
        .otp-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0;
        }
        .otp-divider-line {
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.1);
        }
        .otp-divider-text {
          color: rgba(255,255,255,0.3); font-size: 0.75rem; white-space: nowrap;
        }

        /* ── Trust badges ── */
        .otp-trust {
          display: flex; justify-content: center; gap: 18px;
          margin-top: 28px; flex-wrap: wrap;
        }
        .otp-trust-item {
          display: flex; align-items: center; gap: 5px;
          color: rgba(255,255,255,0.38); font-size: 0.75rem;
        }

        @media (max-width: 480px) {
          .otp-card { padding: 36px 24px; }
          .otp-box { width: 44px; height: 54px; font-size: 1.4rem; }
          .otp-boxes { gap: 7px; }
        }
      `}</style>

      <div className="otp-page">
        {/* Background */}
        <div className="otp-bg-dots" />
        <div className="otp-bg-blob otp-bg-blob-1" />
        <div className="otp-bg-blob otp-bg-blob-2" />

        <div className="otp-card">
          {/* Logo */}
          <div className="otp-logo-wrap">
            <div className="otp-logo-icon">🥬</div>
            <div className="otp-brand-name">FreshDelivery</div>
            <div className="otp-brand-tag">Premium produce, delivered fresh</div>
          </div>

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp}>
              <div className="otp-step-title">Sign in to your account</div>
              <div className="otp-step-sub">
                We'll send a secure one-time code to your email.
              </div>

              {error && (
                <div className="otp-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              <label className="otp-label" htmlFor="otp-email-input">Email address</label>
              <div className="otp-input-wrap">
                <input
                  id="otp-email-input"
                  type="email"
                  className="otp-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                  disabled={loading}
                  required
                />
                <span className="otp-input-icon">✉️</span>
              </div>

              <button
                type="submit"
                className="otp-btn"
                disabled={loading}
                id="otp-send-btn"
              >
                {loading ? <><div className="otp-spinner" /> Sending code…</> : <>Send OTP Code →</>}
              </button>

              <div className="otp-trust">
                <span className="otp-trust-item">🔒 Encrypted</span>
                <span className="otp-trust-item">⏱️ Expires in 10 min</span>
                <span className="otp-trust-item">🚫 No password needed</span>
              </div>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div className="otp-step-title">Check your inbox</div>
              <div className="otp-step-sub">
                We sent a 6-digit code to{' '}
                <span className="otp-email-hint">{email}</span>
              </div>

              {successFlash && (
                <div className="otp-success-flash">✅ Code sent! Check your inbox.</div>
              )}

              {error && (
                <div className="otp-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              <label className="otp-label" style={{ textAlign: 'center', display: 'block', marginBottom: '14px' }}>
                Enter 6-digit code
              </label>

              <div className="otp-boxes" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-digit-${idx}`}
                    ref={el => (otpRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`otp-box ${digit ? 'filled' : ''}`}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    disabled={loading}
                    autoComplete="off"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="otp-btn"
                disabled={loading || otp.join('').length < 6}
                id="otp-verify-btn"
              >
                {loading ? <><div className="otp-spinner" /> Verifying…</> : <>Verify & Sign In</>}
              </button>

              <div className="otp-links">
                <button
                  type="button"
                  className="otp-link-btn"
                  onClick={() => { setStep('email'); setOtp(['','','','','','']); setError(''); }}
                >
                  ← Back
                </button>
                <span>
                  {resendCooldown > 0 ? (
                    <span className="otp-resend-text">
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <span
                      className="otp-resend-active"
                      onClick={handleResend}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && handleResend()}
                    >
                      Resend code
                    </span>
                  )}
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
