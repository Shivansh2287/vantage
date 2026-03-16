const STATS = [
  { before: "1–2 weeks", after: "Under 2 hours", label: "Time to first PRD" },
  { before: "6+ tools", after: "One workspace", label: "Tools in your stack" },
  { before: "0 citations", after: "Every claim cited", label: "Evidence quality" },
  { before: "Broken handoffs", after: "Full traceability", label: "Ticket accuracy" },
];

export default function PainGain() {
  return (
    <section
      style={{
        padding: "120px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow right side */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "-10%",
          top: "30%",
          width: 400,
          height: 400,
          background: "radial-gradient(ellipse at center, rgba(62,201,142,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header — right-aligned, different from features */}
        <div style={{ textAlign: "right", marginBottom: 72, maxWidth: 440, marginLeft: "auto" }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 14 }}>
            The difference
          </p>
          <h2 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.9px", lineHeight: 1.12, color: "#ffffff", marginBottom: 14 }}>
            Stop switching tools.
            <br />Start shipping.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>
            PMs spend 40% of their time on context-switching.
          </p>
        </div>

        {/* Big stat rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: 32,
                padding: "28px 0",
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(255,255,255,0.07)",
                borderBottom: i === STATS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
              }}
              className="stat-row"
            >
              {/* Before */}
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.6px", color: "rgba(255,255,255,0.2)", marginBottom: 4, textDecoration: "line-through", textDecorationColor: "rgba(255,255,255,0.08)" }}>
                  {s.before}
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>{s.label}</p>
              </div>

              {/* Arrow */}
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M0 8h18M12 2l6 6-6 6" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

              {/* After */}
              <div>
                <p style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.6px", color: "#3EC98E", marginBottom: 4 }}>
                  {s.after}
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .stat-row { grid-template-columns: 1fr !important; gap: 4px !important; }
          .stat-row > svg { display: none !important; }
        }
      `}</style>
    </section>
  );
}
