"use client";

const LINKS = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy", "Terms", "Security"],
};

export default function Footer() {
  return (
    <footer style={{ background: "#f5f5f5", position: "relative" }}>
      {/* Top gradient line */}
      <div
        style={{
          height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(87,70,232,0.3) 30%, rgba(87,70,232,0.3) 70%, transparent 100%)",
        }}
      />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px 32px" }}>
        {/* Top row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }} className="footer-grid">
          {/* Brand col */}
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.3px", color: "rgba(0,0,0,0.8)", marginBottom: 10 }}>
              Vantage
            </p>
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.4)", lineHeight: 1.65, maxWidth: 220 }}>
              AI-powered product planning workspace for modern PM teams.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(0,0,0,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                {heading}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map((item) => (
                  <a
                    key={item}
                    href="#"
                    style={{ fontSize: 13, color: "rgba(0,0,0,0.45)", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.8)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.45)")}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.07)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontSize: 12, color: "rgba(0,0,0,0.3)" }}>
            © 2024 Vantage. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Twitter", "LinkedIn", "GitHub"].map((s) => (
              <a
                key={s}
                href="#"
                style={{ fontSize: 12, color: "rgba(0,0,0,0.35)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.35)")}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; } }
      `}</style>
    </footer>
  );
}
