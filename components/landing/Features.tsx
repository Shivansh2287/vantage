const FEATURES = [
  {
    num: "01",
    title: "Evidence-backed PRDs",
    description: "Every claim is cited. Ask what competitors do and get a sourced answer in 10 seconds. No more guessing what the market looks like.",
    tag: "Research",
    tagColor: "rgba(100,86,230,0.15)",
    tagText: "#8B7FF5",
  },
  {
    num: "02",
    title: "Conflict detection",
    description: "Automatically cross-references every requirement pair and surfaces contradictions before they reach engineering handoff — saving days of back-and-forth.",
    tag: "Analysis",
    tagColor: "rgba(62,201,142,0.12)",
    tagText: "#3EC98E",
  },
  {
    num: "03",
    title: "Dependency-aware tickets",
    description: "One click turns your PRD into a backlog of tickets grouped into execution waves, with dependencies mapped and effort estimated.",
    tag: "Execution",
    tagColor: "rgba(248,123,114,0.12)",
    tagText: "#F87B72",
  },
  {
    num: "04",
    title: "Product-aware research",
    description: "Import your website, docs, and screenshots. Every query searches your context and the web together, so answers are specific to your product.",
    tag: "Context",
    tagColor: "rgba(245,180,69,0.12)",
    tagText: "#F5B445",
  },
  {
    num: "05",
    title: "Agent prompt export",
    description: "Each generated ticket becomes a structured prompt for Cursor, Claude Code, or any AI coding assistant — ready to implement immediately.",
    tag: "Export",
    tagColor: "rgba(100,86,230,0.15)",
    tagText: "#8B7FF5",
  },
  {
    num: "06",
    title: "Version history",
    description: "Vantage detects whether a change is major or minor and automatically propagates updates downstream to affected tickets.",
    tag: "Sync",
    tagColor: "rgba(62,201,142,0.12)",
    tagText: "#3EC98E",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      style={{
        padding: "120px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Heading — left-aligned, different from other sections */}
        <div style={{ marginBottom: 64, maxWidth: 480 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 14 }}>
            How it works
          </p>
          <h2 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.9px", lineHeight: 1.12, color: "#ffffff", marginBottom: 14 }}>
            Everything a PM needs,
            <br />in one place
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>
            Stop switching between 6 tools to write one PRD.
          </p>
        </div>

        {/* Two-column numbered list */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}
          className="features-grid"
        >
          {FEATURES.map((f) => (
            <div
              key={f.num}
              style={{
                background: "#080808",
                padding: "32px 28px",
                display: "flex",
                gap: 20,
              }}
            >
              {/* Number */}
              <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.15)", fontVariantNumeric: "tabular-nums", paddingTop: 3, flexShrink: 0 }}>
                {f.num}
              </span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{f.title}</h3>
                  <span style={{ fontSize: 10, fontWeight: 500, background: f.tagColor, color: f.tagText, padding: "2px 8px", borderRadius: 20 }}>
                    {f.tag}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
