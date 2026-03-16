function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="6.5" cy="6.5" r="6" stroke={color} strokeOpacity="0.5"/>
      <path d="M4 6.5l2 2 3-3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const PLANS = [
  {
    name: "Free",
    price: "$0",
    priceNote: "forever",
    features: ["3 PRDs/month", "20 queries/month", "Basic web search"],
    cta: "Get started",
    featured: false,
    checkColor: "#3EC98E",
  },
  {
    name: "Pro",
    price: "$49",
    priceNote: "seat/month",
    features: ["Unlimited PRDs + queries", "Full context import", "Ticket generation", "Agent prompt export", "Linear export"],
    cta: "Start free trial",
    featured: true,
    checkColor: "#8B7FF5",
  },
  {
    name: "Team",
    price: "$99",
    priceNote: "seat/month",
    features: ["Everything in Pro", "Multiplayer editing", "GitHub + Notion + Figma", "Bidirectional Linear sync"],
    cta: "Talk to us",
    featured: false,
    checkColor: "#3EC98E",
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      style={{
        padding: "100px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: "-0.8px",
              color: "#ffffff",
              marginBottom: 12,
            }}
          >
            Simple pricing
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>
            Start free. Upgrade when it saves you a week of work.
          </p>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
          className="pricing-grid"
        >
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.featured ? "rgba(100,86,230,0.08)" : "rgba(255,255,255,0.03)",
                border: plan.featured ? "1px solid rgba(100,86,230,0.4)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                position: "relative",
              }}
            >
              {plan.featured && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      background: "rgba(100,86,230,0.25)",
                      color: "#B4A8FF",
                      border: "1px solid rgba(100,86,230,0.3)",
                      padding: "3px 10px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Most popular
                  </span>
                </div>
              )}

              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 12, letterSpacing: "0.02em" }}>
                  {plan.name}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontSize: 32, fontWeight: 600, color: "#ffffff", letterSpacing: "-0.8px" }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    /{plan.priceNote}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <CheckIcon color={plan.checkColor} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "10px 0",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 8,
                  border: plan.featured ? "none" : "1px solid rgba(255,255,255,0.1)",
                  background: plan.featured ? "#5746E8" : "rgba(255,255,255,0.05)",
                  color: plan.featured ? "#ffffff" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .pricing-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
