"use client";

import { useState, FormEvent } from "react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email.trim()) setSuccess(true);
  }

  return (
    <section
      id="waitlist"
      style={{
        padding: "120px 24px",
        textAlign: "center",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 300,
          background: "radial-gradient(ellipse at center, rgba(87,70,232,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
        <h2
          style={{
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: "-1px",
            lineHeight: 1.15,
            color: "#0f0f0f",
            marginBottom: 14,
          }}
        >
          Ready to write your
          <br />first PRD?
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "rgba(0,0,0,0.45)",
            lineHeight: 1.7,
            marginBottom: 36,
          }}
        >
          Join 240+ PMs on the waitlist. First 50 get Pro free for 3 months.
        </p>

        {success ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(5,150,105,0.08)",
              border: "1px solid rgba(5,150,105,0.2)",
              color: "#059669",
              fontSize: 14,
              fontWeight: 500,
              padding: "12px 20px",
              borderRadius: 10,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6.5" stroke="#059669" strokeOpacity="0.5"/>
              <path d="M4.5 7l2 2 3-3" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            You&apos;re on the list. We&apos;ll be in touch soon.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 8, width: "100%" }}
            className="waitlist-form"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                flex: 1,
                padding: "11px 16px",
                fontSize: 14,
                color: "#0f0f0f",
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 10,
                fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(87,70,232,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)")}
            />
            <button
              type="submit"
              style={{
                padding: "11px 20px",
                fontSize: 14,
                fontWeight: 500,
                color: "#ffffff",
                background: "#5746E8",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#4336D4")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#5746E8")}
            >
              Join waitlist
            </button>
          </form>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) { .waitlist-form { flex-direction: column !important; } }
      `}</style>
    </section>
  );
}
