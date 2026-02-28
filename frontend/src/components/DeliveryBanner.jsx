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
        .delivery-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(90deg, #F59E0B 0%, #FF8C42 100%);
          color: #1a1a1a;
          padding: 12px 20px;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          position: relative;
          animation: bannerSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 100;
          box-shadow: 0 4px 15px rgba(255, 140, 66, 0.3);
          border-radius: 0 0 12px 12px;
          margin: 0 10px;
        }
        .delivery-banner .banner-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .delivery-banner .banner-text {
          text-align: center;
          line-height: 1.4;
        }
        .delivery-banner .banner-date {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 6px;
          padding: 2px 8px;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .delivery-banner .banner-dismiss {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.1);
          border: none;
          color: #1a1a1a;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
          line-height: 1;
          transition: background 0.2s, transform 0.2s;
          flex-shrink: 0;
        }
        .delivery-banner .banner-dismiss:hover {
          background: rgba(0, 0, 0, 0.2);
          transform: translateY(-50%) scale(1.1);
        }
        @media (max-width: 600px) {
          .delivery-banner { font-size: 0.78rem; padding: 10px 40px 10px 12px; }
        }
      `}</style>

      <div className="delivery-banner" role="status" aria-live="polite">
        <span className="banner-icon">🚚</span>
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
