const TESTIMONIALS = [
  {
    quote: "The conflict detection alone saved me from a 2-week engineering mistake. I had two requirements that directly contradicted each other — Vantage caught it in seconds.",
    name: "Arjun K.",
    role: "PM · Series A fintech",
    initials: "AK",
    color: "rgba(100,86,230,0.2)",
    textColor: "#8B7FF5",
    featured: true,
  },
  {
    quote: "I went from blank page to full PRD with tickets in 90 minutes. That used to take me a week.",
    name: "Sara R.",
    role: "Head of Product · SaaS startup",
    initials: "SR",
    color: "rgba(62,201,142,0.15)",
    textColor: "#3EC98E",
    featured: false,
  },
  {
    quote: "The query engine actually knows our product. It's not generic ChatGPT — it references our actual docs.",
    name: "Tom M.",
    role: "Product Lead · Dev tools",
    initials: "TM",
    color: "rgba(245,180,69,0.15)",
    textColor: "#F5B445",
    featured: false,
  },
];

export default function Testimonials() {
  const [featured, ...rest] = TESTIMONIALS;

  return (
    <section
      style={{
        padding: "120px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Centered heading — but layout below is asymmetric */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 14 }}>
            Early feedback
          </p>
          <h2 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.9px", color: "#ffffff" }}>
            What PMs are saying
          </h2>
        </div>

        {/* Featured large + 2 small side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 12 }} className="testimonials-grid">
          {/* Featured */}
          <div
            style={{
              background: "rgba(100,86,230,0.06)",
              border: "1px solid rgba(100,86,230,0.2)",
              borderRadius: 16,
              padding: 36,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 32,
            }}
          >
            {/* Big quote mark */}
            <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
              <path d="M0 24V14.4C0 6.24 4.48 1.44 13.44 0l1.92 3.36C10.56 4.56 8.16 7.44 7.68 12H14.4V24H0zm17.6 0V14.4C17.6 6.24 22.08 1.44 31.04 0l1.92 3.36C28.16 4.56 25.76 7.44 25.28 12H32V24H17.6z" fill="rgba(100,86,230,0.3)"/>
            </svg>

            <p style={{ fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, letterSpacing: "-0.2px" }}>
              &ldquo;{featured.quote}&rdquo;
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: featured.color,
                  color: featured.textColor,
                  fontSize: 12,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${featured.textColor}30`,
                }}
              >
                {featured.initials}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>{featured.name}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{featured.role}</p>
              </div>
            </div>
          </div>

          {/* Two stacked smaller cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rest.map((t) => (
              <div
                key={t.name}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 20,
                  flex: 1,
                }}
              >
                <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill={t.textColor} opacity={0.6}>
                      <path d="M6 1l1.2 3.7H11L8.1 6.8 9.3 10.5 6 8.4 2.7 10.5 3.9 6.8 1 4.7h3.8z"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 14, fontStyle: "italic", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, flex: 1 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: t.color, color: t.textColor, fontSize: 10, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${t.textColor}30`, flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .testimonials-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
