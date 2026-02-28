import React, { useState, useEffect } from "react";

/**
 * Returns the current day-of-week (0=Sun … 6=Sat) in UK local time,
 * using Intl.DateTimeFormat to handle GMT/BST automatically.
 */
function getUKDayOfWeek() {
  const now = new Date();
  // 'en-GB' with timeZone gives us the day name in the UK timezone
  const dayName = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
  }).format(now);
  const map = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };
  return map[dayName] ?? now.getDay();
}

/**
 * Calculates the next Wednesday's date in UK timezone,
 * formatted as DD/MM/YYYY.
 */
function getNextWednesdayUK() {
  // Work in UTC-adjusted ms, then format in London time
  const now = new Date();

  // Find how many days until next Wednesday (day 3)
  const ukDow = getUKDayOfWeek(); // 0-6
  const daysUntilWed = ukDow === 3 ? 7 : (3 - ukDow + 7) % 7 || 7;

  const nextWed = new Date(now);
  nextWed.setDate(now.getDate() + daysUntilWed);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(nextWed);
}

export default function DeliveryBanner() {
  const [visible, setVisible] = useState(false);
  const [nextWed, setNextWed] = useState("");

  useEffect(() => {
    const dow = getUKDayOfWeek();
    // Show on Thursday (4), Friday (5), Saturday (6)
    if (dow === 4 || dow === 5 || dow === 6) {
      setNextWed(getNextWednesdayUK());
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes bannerSlideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes bannerBorderSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes bannerGlow {
          0%, 100% { box-shadow: 0 4px 15px rgba(255, 255, 255, 0.05); }
          50% { box-shadow: 0 8px 25px rgba(255, 255, 255, 0.15); }
        }
        @keyframes bannerTextPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); color: #fff; text-shadow: 0 0 12px rgba(255, 255, 255, 0.4); }
        }

        .delivery-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          background: transparent;
          color: #fff;
          padding: 13px 20px;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          position: relative;
          z-index: 100;
          margin: 0 10px;
          border-radius: 0 0 20px 20px;
          overflow: hidden;
          animation: bannerSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                     bannerGlow 5s infinite ease-in-out;
        }

        /* The Running White Border Layer */
        .delivery-banner::before {
          content: "";
          position: absolute;
          width: 200%; height: 500%;
          top: -200%; left: -50%;
          z-index: -1;
          background: conic-gradient(from 0deg, transparent 0, transparent 320deg, #ffffff 360deg);
          animation: bannerBorderSpin 4s linear infinite;
        }

        /* The Solid Dark Green Backdrop */
        .delivery-banner::after {
          content: "";
          position: absolute;
          inset: 2px;
          background: #2E4236;
          border-radius: 0 0 18px 18px;
          z-index: -1;
        }

        .delivery-banner .banner-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          color: #A3E635; /* Vibrant accent for the bell */
        }
        .delivery-banner .banner-text {
          text-align: center;
          line-height: 1.4;
          z-index: 2;
          padding: 6px 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 99px;
          animation: bannerTextPulse 3s infinite ease-in-out;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
        }
        .delivery-banner .banner-date {
          background: rgba(163, 230, 53, 0.2);
          border-radius: 8px;
          padding: 2px 10px;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          border: 1px solid rgba(163, 230, 53, 0.3);
          color: #A3E635;
        }
        .delivery-banner .banner-dismiss {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
          transition: all 0.2s ease;
          flex-shrink: 0;
          z-index: 2;
        }
        .delivery-banner .banner-dismiss:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-50%) scale(1.1) rotate(90deg);
        }
        @media (max-width: 600px) {
          .delivery-banner { font-size: 0.78rem; padding: 10px 40px 10px 12px; }
        }
      `}</style>

      <div className="delivery-banner" role="status" aria-live="polite">
        <span className="banner-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </span>
        <span className="banner-text">
          Order Today for Next Wednesday Delivery —&nbsp;
          <span className="banner-date">{nextWed}</span>
        </span>
        <button
          className="banner-dismiss"
          onClick={() => setVisible(false)}
          aria-label="Dismiss delivery reminder"
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </>
  );
}
