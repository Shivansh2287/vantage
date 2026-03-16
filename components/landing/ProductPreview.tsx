function DotRow() {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <span key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.8 }} />
      ))}
    </div>
  );
}

function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        background: bg,
        color,
        padding: "2px 6px",
        borderRadius: 4,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function ReqCard({
  id, title, effort, warning,
}: {
  id: string; title: string; effort: string; warning?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 8,
        padding: "10px 12px",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "#5746E8" }}>{id}</span>
        <Badge bg="rgba(220,38,38,0.08)" color="#dc2626">P0</Badge>
        {warning && (
          <Badge bg="rgba(180,83,9,0.08)" color="#b45309">{warning}</Badge>
        )}
      </div>
      <p style={{ fontSize: 12, color: "rgba(0,0,0,0.75)", lineHeight: 1.4 }}>{title}</p>
      <p style={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }}>{effort}</p>
    </div>
  );
}

export default function ProductPreview() {
  return (
    <section style={{ padding: "0 24px 80px" }}>
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          background: "#fafafa",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
        }}
      >
        {/* Browser bar */}
        <div
          style={{
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            position: "relative",
            background: "rgba(0,0,0,0.02)",
          }}
        >
          <DotRow />
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 11,
              color: "rgba(0,0,0,0.35)",
              background: "rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 6,
              padding: "3px 12px",
              whiteSpace: "nowrap",
            }}
          >
            app.vantage.so · Checkout redesign
          </div>
        </div>

        {/* Two panes */}
        <div style={{ display: "flex", minHeight: 380 }} className="preview-panes">
          {/* Left — PRD */}
          <div
            style={{
              flex: 1,
              borderRight: "1px solid rgba(0,0,0,0.07)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#ffffff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.7)" }}>Requirements</span>
              <span style={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }}>3 of 8</span>
            </div>

            <ReqCard id="R1" title="Guest checkout must not require account creation" effort="M · 3 pts" />
            <ReqCard id="R2" title="Support Apple Pay and Google Pay at checkout" effort="L · 5 pts" />
            <ReqCard id="R4" title="Autofill shipping from saved addresses" effort="M · 3 pts" warning="Conflict detected" />

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#fff",
                  background: "#5746E8",
                  border: "none",
                  borderRadius: 7,
                  padding: "7px 14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Generate tickets
              </button>
              <button
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.55)",
                  background: "transparent",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 7,
                  padding: "7px 14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Export to Linear
              </button>
            </div>
          </div>

          {/* Right — Research chat */}
          <div
            style={{
              width: 260,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#fafafa",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.6)", marginBottom: 4, display: "block" }}>
              Research
            </span>

            {/* User bubble */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  background: "rgba(87,70,232,0.08)",
                  border: "1px solid rgba(87,70,232,0.15)",
                  color: "#5746E8",
                  fontSize: 12,
                  lineHeight: 1.5,
                  padding: "8px 10px",
                  borderRadius: "8px 8px 2px 8px",
                  maxWidth: "85%",
                }}
              >
                What do top checkout flows do to reduce abandonment?
              </div>
            </div>

            {/* AI bubble */}
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  fontSize: 12,
                  lineHeight: 1.6,
                  padding: "10px 12px",
                  borderRadius: "8px 8px 8px 2px",
                  color: "rgba(0,0,0,0.6)",
                }}
              >
                <p style={{ marginBottom: 8 }}>
                  Leading checkouts cut steps to 3 or fewer. Guest checkout reduces drop-off by 23%.<sup style={{ color: "#5746E8" }}>1</sup>{" "}
                  Stripe data shows autofill improves conversion 18%.<sup style={{ color: "#5746E8" }}>2</sup>
                </p>
                <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                  {["¹ Baymard", "² Stripe blog"].map((c) => (
                    <span
                      key={c}
                      style={{
                        fontSize: 10,
                        background: "rgba(87,70,232,0.08)",
                        color: "#5746E8",
                        borderRadius: 4,
                        padding: "2px 6px",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <a href="#" style={{ fontSize: 11, color: "#5746E8", textDecoration: "none" }}>
                  Insert into PRD →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .preview-panes { flex-direction: column !important; }
          .preview-panes > div:last-child { width: 100% !important; border-right: none !important; border-top: 1px solid rgba(0,0,0,0.07); }
        }
      `}</style>
    </section>
  );
}
