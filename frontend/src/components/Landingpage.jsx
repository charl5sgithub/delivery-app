import React, { useState, useEffect, useRef } from "react";
import { getItems } from "../services/api";

/* ─── Category metadata ───────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: "Fish",
    label: "Fish & Seafood",
    emoji: "🐟",
    img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    accent: "#0ea5e9",
    desc: "Freshly caught from UK waters",
  },
  {
    id: "Meat",
    label: "Prime Meat",
    emoji: "🥩",
    img: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80",
    accent: "#ef4444",
    desc: "Premium cuts, farm to fork",
  },
  {
    id: "Chicken",
    label: "Chicken",
    emoji: "🍗",
    img: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80",
    accent: "#f59e0b",
    desc: "Free-range, hormone-free",
  },
  {
    id: "Grocery",
    label: "Grocery",
    emoji: "🥬",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    accent: "#22c55e",
    desc: "Farm-fresh everyday essentials",
  },
];

const FEATURES = [
  {
    icon: "🌿",
    title: "100% Fresh",
    desc: "Every product is hand-picked for freshness and quality — no exceptions.",
    color: "#22c55e",
  },
  {
    icon: "⚡",
    title: "Swift Delivery",
    desc: "Next-day delivery across the UK with real-time order tracking.",
    color: "#f59e0b",
  },
  {
    icon: "🔒",
    title: "Secure Payment",
    desc: "Bank-grade encryption on every transaction. Pay by card or cash.",
    color: "#3b82f6",
  },
  {
    icon: "💷",
    title: "Best Prices",
    desc: "Direct from the market — no middleman, no markup. Always great value.",
    color: "#ec4899",
  },
];

/* ─── Reusable counter for hero stats ────────────────────────────────────── */
function AnimatedStat({ end, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const step = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, end);
            setCount(Math.round(current));
            if (current >= end) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="lp2-stat">
      <span className="lp2-stat-num">
        {count}
        {suffix}
      </span>
      <span className="lp2-stat-label">{label}</span>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function LandingPage({ onAddToCart }) {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Fish");
  const [addedItems, setAddedItems] = useState({});
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    getItems().then((data) => setItems(data));
    // Trigger hero animation on mount
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleAddToCartClick = (item) => {
    onAddToCart(item);
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1400);
  };

  const filteredItems = items.filter((item) => {
    const cat = item.category ? item.category.toLowerCase() : "";
    if (activeCategory === "Fish") return cat === "fish" || cat === "seafood";
    return cat === activeCategory.toLowerCase();
  });

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <>
      {/* ── Scoped styles ─────────────────────────────────────────────────── */}
      <style>{`
        /* Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        /* ── CSS Custom Properties ── */
        :root {
          --lp-green:   #2ecc71;
          --lp-green-d: #27ae60;
          --lp-lime:    #a3e635;
          --lp-cream:   #f8f4e6;
          --lp-charcoal:#333333;
          --lp-tomato:  #ff6347;
          --lp-orange:  #ff8c42;
          --lp-white:   #ffffff;
          --lp-r12:     12px;
          --lp-r16:     16px;
          --lp-r24:     24px;
        }

        /* ── Animations ── */
        @keyframes lp-fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes lp-float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-14px) rotate(2deg); }
        }
        @keyframes lp-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes lp-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0;   }
        }
        @keyframes lp-blob {
          0%, 100% { border-radius: 62% 38% 46% 54% / 60% 44% 56% 40%; }
          33%       { border-radius: 40% 60% 70% 30% / 50% 60% 40% 50%; }
          66%       { border-radius: 70% 30% 40% 60% / 40% 70% 30% 60%; }
        }
        @keyframes lp-spin-slow {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes lp-badge-pop {
          0%  { transform: scale(0) rotate(-20deg); opacity: 0; }
          70% { transform: scale(1.15) rotate(4deg); }
          100%{ transform: scale(1) rotate(0deg);   opacity: 1; }
        }

        /* ── Container ── */
        .lp2 {
          font-family: 'Inter', sans-serif;
          background: var(--lp-cream);
          color: var(--lp-charcoal);
          overflow-x: hidden;
        }

        /* ═══════════════════════════════════════════════════════════════
           HERO
        ═══════════════════════════════════════════════════════════════ */
        .lp2-hero {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, #0a2e1a 0%, #0d3d22 40%, #0f4c2b 70%, #1a6b3c 100%);
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: 100px 0 60px;
        }

        /* Orb / blob decorations */
        .lp2-hero-blob {
          position: absolute;
          border-radius: 62% 38% 46% 54% / 60% 44% 56% 40%;
          animation: lp-blob 8s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        .lp2-hero-blob-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(46,204,113,0.18) 0%, transparent 70%);
          top: -120px; right: -80px;
          animation-delay: 0s;
        }
        .lp2-hero-blob-2 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(163,230,53,0.12) 0%, transparent 70%);
          bottom: -80px; left: -60px;
          animation-delay: -3s;
        }
        .lp2-hero-dots {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px);
          background-size: 28px 28px;
        }

        .lp2-hero-inner {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        /* Left column */
        .lp2-hero-left {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1);
        }
        .lp2-hero-left.visible { opacity: 1; transform: translateY(0); }

        .lp2-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(46,204,113,0.15);
          border: 1px solid rgba(46,204,113,0.3);
          border-radius: 99px;
          padding: 6px 16px;
          font-size: 0.82rem; font-weight: 600;
          color: var(--lp-lime);
          letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 1.5rem;
          animation: lp-badge-pop 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both;
        }
        .lp2-hero-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--lp-lime);
          box-shadow: 0 0 0 0 var(--lp-lime);
          animation: lp-pulse-ring 1.4s ease-out infinite;
        }

        .lp2-hero-title {
          font-size: clamp(2.4rem, 5vw, 4rem);
          font-weight: 900;
          line-height: 1.08;
          color: #ffffff;
          margin: 0 0 1.25rem;
          letter-spacing: -0.02em;
        }
        .lp2-hero-title .lp2-hl {
          background: linear-gradient(90deg, var(--lp-green) 0%, var(--lp-lime) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp2-hero-sub {
          font-size: 1.1rem; font-weight: 400;
          color: rgba(255,255,255,0.70);
          line-height: 1.7; margin: 0 0 2.2rem;
          max-width: 480px;
        }

        .lp2-hero-ctas {
          display: flex; gap: 14px; flex-wrap: wrap;
        }
        .lp2-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, var(--lp-green) 0%, var(--lp-green-d) 100%);
          color: #fff; border: none;
          padding: 1rem 2rem; border-radius: 14px;
          font-size: 1rem; font-weight: 700;
          cursor: pointer; transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(46,204,113,0.4);
          letter-spacing: 0.01em;
        }
        .lp2-btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 32px rgba(46,204,113,0.5);
          background: linear-gradient(135deg, #34d978 0%, var(--lp-green) 100%);
        }
        .lp2-btn-primary:active { transform: translateY(0); }

        .lp2-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08);
          color: #fff; border: 1.5px solid rgba(255,255,255,0.25);
          padding: 1rem 2rem; border-radius: 14px;
          font-size: 1rem; font-weight: 600;
          cursor: pointer; transition: all 0.25s ease;
          backdrop-filter: blur(8px);
        }
        .lp2-btn-ghost:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.45);
          transform: translateY(-2px);
        }

        /* Trust chips */
        .lp2-hero-trust {
          display: flex; gap: 20px; margin-top: 2.5rem; flex-wrap: wrap;
        }
        .lp2-trust-chip {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.8rem; color: rgba(255,255,255,0.6); font-weight: 500;
        }
        .lp2-trust-chip svg { flex-shrink: 0; }

        /* Stats row */
        .lp2-hero-stats {
          display: flex; gap: 28px; margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .lp2-stat { display: flex; flex-direction: column; }
        .lp2-stat-num {
          font-size: 1.8rem; font-weight: 800; color: #fff;
          line-height: 1;
        }
        .lp2-stat-label {
          font-size: 0.75rem; color: rgba(255,255,255,0.5);
          margin-top: 4px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        /* Right column – floating image */
        .lp2-hero-right {
          position: relative; display: flex; justify-content: center;
          opacity: 0; transform: translateY(36px) scale(0.95);
          transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s,
                      transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s;
        }
        .lp2-hero-right.visible { opacity: 1; transform: translateY(0) scale(1); }

        .lp2-hero-img-wrap {
          position: relative; width: 100%; max-width: 500px;
        }
        .lp2-hero-img-glow {
          position: absolute; inset: -20px;
          background: radial-gradient(ellipse, rgba(46,204,113,0.35) 0%, transparent 70%);
          border-radius: 50%; filter: blur(24px);
          animation: lp-float 6s ease-in-out infinite;
        }
        .lp2-hero-img {
          width: 100%; aspect-ratio: 1;
          object-fit: cover;
          border-radius: 40% 60% 60% 40% / 50% 50% 60% 40%;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 0 2px rgba(46,204,113,0.3);
          animation: lp-float 6s ease-in-out infinite;
          position: relative; z-index: 1;
        }
        /* Floating label */
        .lp2-hero-float-badge {
          position: absolute;
          background: #fff; border-radius: 14px;
          padding: 10px 16px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.2);
          display: flex; align-items: center; gap: 10px;
          z-index: 2; font-weight: 600; font-size: 0.85rem;
          white-space: nowrap;
        }
        .lp2-hero-float-badge.badge-tl {
          top: 12%; left: -8%;
          animation: lp-float 5s ease-in-out infinite reverse;
        }
        .lp2-hero-float-badge.badge-br {
          bottom: 14%; right: -8%;
          animation: lp-float 7s ease-in-out 1s infinite;
        }
        .lp2-float-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
        }

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY CARDS
        ═══════════════════════════════════════════════════════════════ */
        .lp2-cats {
          padding: 80px 2rem;
          background: #fff;
        }
        .lp2-section-header {
          text-align: center; margin-bottom: 3rem;
        }
        .lp2-section-tag {
          display: inline-block;
          background: linear-gradient(90deg, var(--lp-green), var(--lp-lime));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 0.6rem;
        }
        .lp2-section-title {
          font-size: clamp(1.6rem, 3.5vw, 2.5rem);
          font-weight: 800; color: var(--lp-charcoal); margin: 0;
          letter-spacing: -0.02em;
        }
        .lp2-section-sub {
          color: #6b7280; font-size: 1rem; margin: 0.6rem 0 0;
        }

        .lp2-cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem; max-width: 1200px; margin: 0 auto;
        }
        .lp2-cat-card {
          position: relative; border-radius: var(--lp-r16);
          overflow: hidden; cursor: pointer;
          aspect-ratio: 4/3;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.35s ease;
        }
        .lp2-cat-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 48px rgba(0,0,0,0.18); }
        .lp2-cat-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .lp2-cat-card:hover .lp2-cat-img { transform: scale(1.08); }
        .lp2-cat-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 55%, transparent 100%);
        }
        .lp2-cat-info {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 1.25rem 1.5rem;
        }
        .lp2-cat-emoji {
          font-size: 1.8rem; display: block; margin-bottom: 4px;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
        }
        .lp2-cat-name {
          color: #fff; font-size: 1.15rem; font-weight: 800;
          display: block; margin-bottom: 2px;
        }
        .lp2-cat-desc {
          color: rgba(255,255,255,0.7); font-size: 0.78rem; font-weight: 500;
        }
        .lp2-cat-arrow {
          position: absolute; top: 1rem; right: 1rem;
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.18); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 1rem;
          transition: background 0.2s, transform 0.2s;
        }
        .lp2-cat-card:hover .lp2-cat-arrow {
          background: var(--lp-green); transform: rotate(45deg);
        }

        /* ═══════════════════════════════════════════════════════════════
           PRODUCTS
        ═══════════════════════════════════════════════════════════════ */
        .lp2-products {
          padding: 80px 2rem;
          background: var(--lp-cream);
        }
        .lp2-tab-bar {
          display: flex; gap: 10px; flex-wrap: wrap;
          justify-content: center; margin-bottom: 3rem;
        }
        .lp2-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 22px; border-radius: 99px;
          font-size: 0.9rem; font-weight: 600;
          border: 2px solid #e5e7eb;
          background: #fff; color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .lp2-tab:hover { border-color: var(--lp-green); color: var(--lp-green-d); }
        .lp2-tab.active {
          background: linear-gradient(135deg, var(--lp-green), var(--lp-green-d));
          border-color: transparent; color: #fff;
          box-shadow: 0 6px 20px rgba(46,204,113,0.35);
        }

        .lp2-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 1.5rem; max-width: 1200px; margin: 0 auto;
        }
        .lp2-product-card {
          background: #fff; border-radius: var(--lp-r16);
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.3s ease;
          display: flex; flex-direction: column;
          position: relative;
        }
        .lp2-product-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.13); }

        .lp2-product-img-wrap {
          position: relative; overflow: hidden;
          height: 210px;
        }
        .lp2-product-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .lp2-product-card:hover .lp2-product-img { transform: scale(1.07); }

        .lp2-product-cat-badge {
          position: absolute; top: 10px; left: 10px;
          padding: 3px 10px; border-radius: 99px;
          font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
          background: rgba(255,255,255,0.92);
          color: var(--lp-green-d);
        }

        .lp2-product-body {
          padding: 1.1rem 1.2rem 1.3rem;
          flex: 1; display: flex; flex-direction: column;
        }
        .lp2-product-name {
          font-size: 1rem; font-weight: 700;
          color: var(--lp-charcoal);
          margin: 0 0 0.3rem; line-height: 1.3;
        }
        .lp2-product-price {
          font-size: 1.3rem; font-weight: 800;
          color: var(--lp-green-d); margin-bottom: 1rem;
        }
        .lp2-product-price span { font-size: 0.85rem; color: #9ca3af; font-weight: 500; }

        .lp2-add-btn {
          margin-top: auto;
          padding: 11px;
          border: none; border-radius: 12px;
          font-size: 0.92rem; font-weight: 700;
          cursor: pointer;
          background: linear-gradient(135deg, var(--lp-green), var(--lp-green-d));
          color: #fff;
          transition: all 0.25s ease;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          box-shadow: 0 4px 14px rgba(46,204,113,0.3);
        }
        .lp2-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(46,204,113,0.4);
        }
        .lp2-add-btn:active { transform: scale(0.97); }
        .lp2-add-btn.added {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          animation: none;
        }

        .lp2-empty {
          grid-column: 1 / -1; text-align: center;
          padding: 3rem; color: #9ca3af; font-size: 1rem;
        }

        /* ═══════════════════════════════════════════════════════════════
           WHY CHOOSE US
        ═══════════════════════════════════════════════════════════════ */
        .lp2-why {
          padding: 80px 2rem;
          background: linear-gradient(135deg, #0a2e1a 0%, #0d3d22 100%);
          position: relative; overflow: hidden;
        }
        .lp2-why::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.04) 1.5px, transparent 1.5px);
          background-size: 28px 28px;
        }
        .lp2-why .lp2-section-title { color: #fff; }
        .lp2-why .lp2-section-sub { color: rgba(255,255,255,0.55); }

        .lp2-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem; max-width: 1100px; margin: 0 auto;
          position: relative; z-index: 1;
        }
        .lp2-feature-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--lp-r16);
          padding: 2rem 1.75rem;
          backdrop-filter: blur(8px);
          transition: transform 0.3s ease, background 0.3s ease;
        }
        .lp2-feature-card:hover {
          transform: translateY(-6px);
          background: rgba(255,255,255,0.1);
        }
        .lp2-feature-icon-wrap {
          width: 56px; height: 56px;
          border-radius: 16px; display: flex;
          align-items: center; justify-content: center;
          font-size: 1.6rem; margin-bottom: 1.2rem;
        }
        .lp2-feature-card h3 {
          color: #fff; font-size: 1.1rem; font-weight: 700;
          margin: 0 0 0.6rem;
        }
        .lp2-feature-card p {
          color: rgba(255,255,255,0.6); font-size: 0.9rem; line-height: 1.6; margin: 0;
        }

        /* ═══════════════════════════════════════════════════════════════
           CTA BANNER
        ═══════════════════════════════════════════════════════════════ */
        .lp2-cta-banner {
          padding: 90px 2rem;
          background: linear-gradient(135deg, #ff6347 0%, #ff8c42 50%, #f59e0b 100%);
          text-align: center;
          position: relative; overflow: hidden;
        }
        /* Spinning ring decoration */
        .lp2-cta-ring {
          position: absolute;
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 50%;
          animation: lp-spin-slow 20s linear infinite;
          pointer-events: none;
        }
        .lp2-cta-ring-1 { width: 500px; height: 500px; top: -200px; left: -100px; }
        .lp2-cta-ring-2 { width: 380px; height: 380px; bottom: -180px; right: -60px; animation-direction: reverse; animation-duration: 14s; }

        .lp2-cta-inner {
          position: relative; z-index: 1;
          max-width: 700px; margin: 0 auto;
        }
        .lp2-cta-banner h2 {
          font-size: clamp(1.8rem, 4vw, 3rem);
          font-weight: 900; color: #fff;
          margin: 0 0 1rem; letter-spacing: -0.02em;
          text-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .lp2-cta-banner p {
          color: rgba(255,255,255,0.85);
          font-size: 1.05rem; margin: 0 0 2.5rem; line-height: 1.6;
        }
        .lp2-btn-cta {
          display: inline-flex; align-items: center; gap: 10px;
          background: #fff; color: var(--lp-tomato);
          border: none; padding: 1.1rem 2.6rem; border-radius: 16px;
          font-size: 1.05rem; font-weight: 800;
          cursor: pointer; transition: all 0.25s ease;
          box-shadow: 0 10px 32px rgba(0,0,0,0.2);
          letter-spacing: 0.01em;
        }
        .lp2-btn-cta:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 18px 48px rgba(0,0,0,0.25);
        }

        /* ═══════════════════════════════════════════════════════════════
           FOOTER
        ═══════════════════════════════════════════════════════════════ */
        .lp2-footer {
          background: #0a2e1a; color: #fff;
          padding: 60px 2rem 30px;
        }
        .lp2-footer-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 2.5rem; padding-bottom: 2.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .lp2-footer-brand-name {
          font-size: 1.4rem; font-weight: 900;
          color: var(--lp-green); margin-bottom: 0.75rem;
        }
        .lp2-footer-brand-desc {
          color: rgba(255,255,255,0.5); font-size: 0.875rem;
          line-height: 1.7; margin: 0;
        }
        .lp2-footer-col h5 {
          color: #fff; font-size: 0.85rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin: 0 0 1rem;
        }
        .lp2-footer-col ul {
          list-style: none; padding: 0; margin: 0;
        }
        .lp2-footer-col li {
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem; margin-bottom: 0.6rem;
          cursor: pointer; transition: color 0.2s;
        }
        .lp2-footer-col li:hover { color: var(--lp-green); }
        .lp2-footer-bottom {
          max-width: 1200px; margin: 1.5rem auto 0;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.8rem; color: rgba(255,255,255,0.35);
          flex-wrap: wrap; gap: 8px;
        }

        /* ═══════════════════════════════════════════════════════════════
           RESPONSIVE
        ═══════════════════════════════════════════════════════════════ */
        @media (max-width: 900px) {
          .lp2-hero-inner { grid-template-columns: 1fr; padding-top: 20px; }
          .lp2-hero-right { max-width: 360px; margin: 0 auto; }
          .lp2-hero-float-badge.badge-tl { left: 0; top: 5%; }
          .lp2-hero-float-badge.badge-br { right: 0; }
          .lp2-footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .lp2-hero { padding: 80px 0 40px; }
          .lp2-hero-stats { gap: 16px; }
          .lp2-hero-ctas { flex-direction: column; }
          .lp2-btn-primary, .lp2-btn-ghost { justify-content: center; }
          .lp2-footer-grid { grid-template-columns: 1fr; }
          .lp2-footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="lp2">

        {/* ════════════════════ HERO ════════════════════ */}
        <section className="lp2-hero">
          <div className="lp2-hero-blob lp2-hero-blob-1" />
          <div className="lp2-hero-blob lp2-hero-blob-2" />
          <div className="lp2-hero-dots" />

          <div className="lp2-hero-inner">
            {/* Left */}
            <div className={`lp2-hero-left ${heroVisible ? "visible" : ""}`}>
              <div className="lp2-hero-badge">
                <span className="lp2-hero-badge-dot" />
                Fresh Delivery Every Week
              </div>

              <h1 className="lp2-hero-title">
                Fresh Grocery<br />
                <span className="lp2-hl">Delivered to</span><br />
                Your Door
              </h1>

              <p className="lp2-hero-sub">
                Premium fish, meat, chicken & fresh produce — hand-selected
                from local markets and delivered straight to your kitchen.
              </p>

              <div className="lp2-hero-ctas">
                <button
                  className="lp2-btn-primary"
                  onClick={() => document.getElementById("lp2-products")?.scrollIntoView({ behavior: "smooth" })}
                >
                  🛒 Shop Now
                </button>
                <button
                  className="lp2-btn-ghost"
                  onClick={() => document.getElementById("lp2-categories")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Browse Categories →
                </button>
              </div>

              <div className="lp2-hero-trust">
                {[
                  "Free delivery over £20",
                  "Next-day available",
                  "100% fresh guarantee",
                ].map((t) => (
                  <span key={t} className="lp2-trust-chip">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="7" fill="#2ecc71" fillOpacity="0.2" />
                      <path d="M4 7l2 2 4-4" stroke="#2ecc71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>

              <div className="lp2-hero-stats">
                <AnimatedStat end={5000} suffix="+" label="Happy Customers" />
                <AnimatedStat end={200} suffix="+" label="Products" />
                <AnimatedStat end={98} suffix="%" label="Satisfaction Rate" />
              </div>
            </div>

            {/* Right – floating hero image */}
            <div className={`lp2-hero-right ${heroVisible ? "visible" : ""}`}>
              <div className="lp2-hero-img-wrap">
                <div className="lp2-hero-img-glow" />
                <img
                  className="lp2-hero-img"
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85"
                  alt="Fresh groceries"
                />
                {/* Floating info badges */}
                <div className="lp2-hero-float-badge badge-tl">
                  <div className="lp2-float-icon" style={{ background: "#fef9c3" }}>🐟</div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>Today's catch</div>
                    <div>Fresh Salmon</div>
                  </div>
                </div>
                <div className="lp2-hero-float-badge badge-br">
                  <div className="lp2-float-icon" style={{ background: "#dcfce7" }}>✅</div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>Quality</div>
                    <div>Guaranteed Fresh</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════ CATEGORY CARDS ════════════════════ */}
        <section id="lp2-categories" className="lp2-cats">
          <div className="lp2-section-header">
            <div className="lp2-section-tag">Shop by Category</div>
            <h2 className="lp2-section-title">What Are You Looking For?</h2>
            <p className="lp2-section-sub">Click a category to start browsing the freshest produce</p>
          </div>

          <div className="lp2-cat-grid">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="lp2-cat-card"
                onClick={() => {
                  setActiveCategory(cat.id);
                  document.getElementById("lp2-products")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <img className="lp2-cat-img" src={cat.img} alt={cat.label} loading="lazy" />
                <div className="lp2-cat-overlay" />
                <div className="lp2-cat-info">
                  <span className="lp2-cat-emoji">{cat.emoji}</span>
                  <span className="lp2-cat-name">{cat.label}</span>
                  <span className="lp2-cat-desc">{cat.desc}</span>
                </div>
                <div className="lp2-cat-arrow">↗</div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════ PRODUCT GRID ════════════════════ */}
        <section id="lp2-products" className="lp2-products">
          <div className="lp2-section-header">
            <div className="lp2-section-tag">Browse &amp; Shop</div>
            <h2 className="lp2-section-title">Our Products</h2>
            <p className="lp2-section-sub">Hand-selected, farm-fresh and ready to order</p>
          </div>

          {/* Tab bar */}
          <div className="lp2-tab-bar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`lp2-tab ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Product cards */}
          <div className="lp2-product-grid">
            {filteredItems.length === 0 ? (
              <div className="lp2-empty">
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                  {activeCat?.emoji ?? "🛒"}
                </div>
                No products in this category yet.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="lp2-product-card">
                  <div className="lp2-product-img-wrap">
                    <img
                      className="lp2-product-img"
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                    />
                    <span className="lp2-product-cat-badge">
                      {activeCat?.emoji} {activeCategory}
                    </span>
                  </div>
                  <div className="lp2-product-body">
                    <div className="lp2-product-name">{item.name}</div>
                    <div className="lp2-product-price">
                      £{Number(item.price).toFixed(2)}
                      <span> / item</span>
                    </div>
                    <button
                      className={`lp2-add-btn ${addedItems[item.id] ? "added" : ""}`}
                      onClick={() => handleAddToCartClick(item)}
                    >
                      {addedItems[item.id] ? "✔ Added!" : "🛒 Add to Cart"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ════════════════════ WHY CHOOSE US ════════════════════ */}
        <section className="lp2-why">
          <div className="lp2-section-header">
            <div className="lp2-section-tag">Our Promise</div>
            <h2 className="lp2-section-title">Why Customers Love Us</h2>
            <p className="lp2-section-sub" style={{ color: "rgba(255,255,255,0.5)" }}>
              Built around quality, speed, and trust
            </p>
          </div>
          <div className="lp2-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="lp2-feature-card">
                <div
                  className="lp2-feature-icon-wrap"
                  style={{ background: f.color + "22" }}
                >
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════ CTA BANNER ════════════════════ */}
        <section className="lp2-cta-banner">
          <div className="lp2-cta-ring lp2-cta-ring-1" />
          <div className="lp2-cta-ring lp2-cta-ring-2" />
          <div className="lp2-cta-inner">
            <h2>Order Today for Fresh<br />Weekly Delivery 🚚</h2>
            <p>
              Join thousands of happy customers who trust us for their
              weekly grocery needs. Fast, fresh, and always on time.
            </p>
            <button
              className="lp2-btn-cta"
              onClick={() => document.getElementById("lp2-products")?.scrollIntoView({ behavior: "smooth" })}
            >
              🛒 Start Shopping Now
            </button>
          </div>
        </section>

        {/* ════════════════════ FOOTER ════════════════════ */}
        <footer className="lp2-footer">
          <div className="lp2-footer-grid">
            <div>
              <div className="lp2-footer-brand-name">🛒 FreshMart</div>
              <p className="lp2-footer-brand-desc">
                Premium fish, meat, chicken &amp; grocery delivered to your door.
                Fresh from the market, straight to your kitchen.
              </p>
            </div>
            {[
              { title: "Shop", links: ["Fish & Seafood", "Prime Meat", "Chicken", "Grocery"] },
              { title: "Company", links: ["Our Story", "Careers", "Sustainability", "Press"] },
              { title: "Help", links: ["Help Centre", "Track Order", "Returns", "Contact Us"] },
            ].map((col) => (
              <div key={col.title} className="lp2-footer-col">
                <h5>{col.title}</h5>
                <ul>
                  {col.links.map((l) => <li key={l}>{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="lp2-footer-bottom">
            <span>© 2026 FreshMart. All rights reserved.</span>
            <span>Made with 💚 for fresh food lovers</span>
          </div>
        </footer>

      </div>
    </>
  );
}
