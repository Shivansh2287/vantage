"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

/* ─── Mini product mockup inside hero ─── */
function AppMockup() {
  return (
    <div
      style={{
        marginTop: 60,
        width: "100%",
        maxWidth: 900,
        marginLeft: "auto",
        marginRight: "auto",
        position: "relative",
      }}
    >
      {/* Fade bottom */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: "linear-gradient(to bottom, transparent, #fafafa)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Browser frame */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "14px 14px 0 0",
          overflow: "hidden",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Browser bar */}
        <div
          style={{
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              maxWidth: 260,
              margin: "0 auto",
              fontSize: 11,
              color: "rgba(0,0,0,0.35)",
              background: "rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.07)",
              borderRadius: 6,
              padding: "3px 10px",
              textAlign: "center",
            }}
          >
            app.vantage.so · Checkout redesign
          </div>
        </div>

        {/* App shell */}
        <div style={{ display: "flex", height: 440 }}>
          {/* Left sidebar */}
          <div
            style={{
              width: 200,
              borderRight: "1px solid rgba(0,0,0,0.07)",
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              flexShrink: 0,
              background: "#fafafa",
            }}
          >
            <p style={{ fontSize: 10, color: "rgba(0,0,0,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, paddingLeft: 8 }}>
              Projects
            </p>
            {[
              { name: "Checkout redesign", active: true },
              { name: "Onboarding v2", active: false },
              { name: "Mobile notifications", active: false },
            ].map((p) => (
              <div
                key={p.name}
                style={{
                  fontSize: 12,
                  padding: "6px 8px",
                  borderRadius: 6,
                  color: p.active ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.4)",
                  background: p.active ? "rgba(87,70,232,0.08)" : "transparent",
                  cursor: "pointer",
                }}
              >
                {p.name}
              </div>
            ))}

            <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", margin: "12px 0" }} />
            <p style={{ fontSize: 10, color: "rgba(0,0,0,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, paddingLeft: 8 }}>
              Views
            </p>
            {["PRD", "Tickets", "Research"].map((v) => (
              <div key={v} style={{ fontSize: 12, padding: "6px 8px", color: "rgba(0,0,0,0.4)" }}>{v}</div>
            ))}
          </div>

          {/* Main area — requirements */}
          <div style={{ flex: 1, borderRight: "1px solid rgba(0,0,0,0.07)", padding: 20, overflow: "hidden", background: "#ffffff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.8)" }}>Requirements</p>
                <p style={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }}>8 requirements · 2 conflicts</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ fontSize: 11, padding: "5px 10px", background: "#5746E8", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                  Generate tickets
                </button>
                <button style={{ fontSize: 11, padding: "5px 10px", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 6, color: "rgba(0,0,0,0.45)", cursor: "pointer", fontFamily: "inherit" }}>
                  Export
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { id: "R1", title: "Guest checkout must not require account creation", status: "P0", effort: "M · 3 pts", color: "#dc2626" },
                { id: "R2", title: "Support Apple Pay and Google Pay at checkout", status: "P0", effort: "L · 5 pts", color: "#dc2626" },
                { id: "R3", title: "Display trust badges and security copy at payment step", status: "P1", effort: "S · 1 pt", color: "#b45309" },
                { id: "R4", title: "Autofill shipping from saved addresses", status: "P0", effort: "M · 3 pts", conflict: true, color: "#dc2626" },
                { id: "R5", title: "Show estimated delivery date before confirming order", status: "P1", effort: "M · 3 pts", color: "#b45309" },
              ].map((req) => (
                <div
                  key={req.id}
                  style={{
                    border: `1px solid ${req.conflict ? "rgba(180,83,9,0.2)" : "rgba(0,0,0,0.07)"}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    background: req.conflict ? "rgba(180,83,9,0.04)" : "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 500, color: "#5746E8", width: 20, flexShrink: 0 }}>{req.id}</span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 500,
                      padding: "2px 5px",
                      borderRadius: 3,
                      background: `${req.color}15`,
                      color: req.color,
                      flexShrink: 0,
                    }}
                  >
                    {req.status}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(0,0,0,0.7)", flex: 1 }}>{req.title}</span>
                  {req.conflict && (
                    <span style={{ fontSize: 9, padding: "2px 6px", background: "rgba(180,83,9,0.1)", color: "#b45309", borderRadius: 3, whiteSpace: "nowrap", flexShrink: 0 }}>
                      Conflict ⚠
                    </span>
                  )}
                  <span style={{ fontSize: 10, color: "rgba(0,0,0,0.3)", flexShrink: 0 }}>{req.effort}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — AI research chat */}
          <div style={{ width: 260, padding: 16, display: "flex", flexDirection: "column", gap: 10, flexShrink: 0, background: "#fafafa" }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.55)", marginBottom: 4 }}>Research</p>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ background: "rgba(87,70,232,0.08)", border: "1px solid rgba(87,70,232,0.15)", color: "#5746E8", fontSize: 11, lineHeight: 1.5, padding: "7px 9px", borderRadius: "7px 7px 2px 7px", maxWidth: "85%" }}>
                What do top checkout flows do to reduce abandonment?
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", fontSize: 11, lineHeight: 1.6, padding: "9px 10px", borderRadius: "7px 7px 7px 2px", color: "rgba(0,0,0,0.6)" }}>
                <p style={{ marginBottom: 7 }}>Leading checkouts cut steps to 3 or fewer and show progress indicators. Guest checkout reduces drop-off by 23%.<sup style={{ color: "#5746E8" }}>1</sup></p>
                <div style={{ display: "flex", gap: 4, marginBottom: 7 }}>
                  {["¹ Baymard", "² Stripe"].map((c) => (
                    <span key={c} style={{ fontSize: 9, background: "rgba(87,70,232,0.08)", color: "#5746E8", borderRadius: 3, padding: "2px 5px" }}>{c}</span>
                  ))}
                </div>
                <a href="#" style={{ fontSize: 10, color: "#5746E8", textDecoration: "none" }}>Insert into PRD →</a>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ background: "rgba(87,70,232,0.08)", border: "1px solid rgba(87,70,232,0.15)", color: "#5746E8", fontSize: 11, lineHeight: 1.5, padding: "7px 9px", borderRadius: "7px 7px 2px 7px", maxWidth: "85%" }}>
                Does requiring account creation hurt conversion?
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const router = useRouter();
  const [input, setInput] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const idea = input.trim() || "Redesign the checkout flow to reduce payment drop-off";
    router.push(`/workspace?idea=${encodeURIComponent(idea)}`);
  }

  return (
    <section
      style={{
        position: "relative",
        paddingTop: 140,
        paddingBottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 90% 50% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 50% at 50% 0%, black 30%, transparent 100%)",
        }}
      />

      {/* Purple glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 500,
          background: "radial-gradient(ellipse at center, rgba(87,70,232,0.1) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", maxWidth: 640, width: "100%", padding: "0 24px" }}>
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(87,70,232,0.08)",
            border: "1px solid rgba(87,70,232,0.2)",
            color: "#5746E8",
            fontSize: 12,
            fontWeight: 500,
            padding: "5px 14px",
            borderRadius: 20,
            marginBottom: 28,
            letterSpacing: "0.01em",
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#5746E8", flexShrink: 0 }} />
          Now in early access
        </div>

        {/* H1 */}
        <h1
          style={{
            fontSize: 56,
            fontWeight: 600,
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            color: "#0f0f0f",
            marginBottom: 22,
          }}
          className="hero-h1"
        >
          From idea to{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #0f0f0f 0%, #5746E8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            execution plan
          </span>
          <br />in one workspace
        </h1>

        {/* Sub */}
        <p
          style={{
            fontSize: 17,
            color: "rgba(0,0,0,0.5)",
            lineHeight: 1.7,
            maxWidth: 480,
            margin: "0 auto 36px",
          }}
        >
          Describe what you&apos;re building. Vantage researches the market,
          writes an evidence-backed PRD, and breaks it into dependency-aware tickets.
        </p>

        {/* Input row */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: 8, width: "100%", maxWidth: 520, margin: "0 auto 16px" }}
          className="hero-form"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to build..."
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
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(87,70,232,0.5)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; }}
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
            Generate PRD →
          </button>
        </form>

        {/* Secondary CTAs */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 14 }}>
          <a href="/onboarding" style={{ fontSize: 13, color: "rgba(87,70,232,0.7)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = "#5746E8"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(87,70,232,0.7)"}>
            I have an existing product →
          </a>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(0,0,0,0.2)" }} />
          <a href="/dashboard" style={{ fontSize: 13, color: "rgba(0,0,0,0.4)", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(0,0,0,0.65)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(0,0,0,0.4)"}>
            View dashboard
          </a>
        </div>

        {/* Social proof inline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {["AK","SR","TM","RL"].map((init, i) => (
              <div
                key={init}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(87,70,232,0.12)",
                  color: "#5746E8",
                  fontSize: 8,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #fafafa",
                  marginLeft: i === 0 ? 0 : -6,
                  position: "relative",
                  zIndex: 4 - i,
                }}
              >
                {init}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>
            240+ PMs on the waitlist · No credit card required
          </p>
        </div>
      </div>

      {/* Product mockup — fills the empty space */}
      <div style={{ width: "100%", padding: "0 24px", position: "relative" }}>
        <AppMockup />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-h1 { font-size: 34px !important; letter-spacing: -0.8px !important; }
          .hero-form { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
}
