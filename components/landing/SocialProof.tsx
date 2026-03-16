const INITIALS = ["AK", "SR", "TM", "RL"];

export default function SocialProof() {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(0,0,0,0.07)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        padding: "14px 40px",
        background: "rgba(0,0,0,0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>
            Trusted by PMs at
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {["Seed startups", "Series A teams", "Scale-ups"].map((label) => (
              <span
                key={label}
                style={{
                  fontSize: 11,
                  color: "rgba(0,0,0,0.5)",
                  background: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 20,
                  padding: "3px 10px",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — avatars + count */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {INITIALS.map((init, i) => (
              <div
                key={init}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "rgba(87,70,232,0.1)",
                  color: "#5746E8",
                  fontSize: 9,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #fafafa",
                  marginLeft: i === 0 ? 0 : -7,
                  position: "relative",
                  zIndex: INITIALS.length - i,
                }}
              >
                {init}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>
            240+ PMs on the waitlist
          </span>
        </div>
      </div>
    </div>
  );
}
