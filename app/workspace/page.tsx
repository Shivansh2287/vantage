export default function WorkspacePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(100,86,230,0.12)",
            border: "1px solid rgba(100,86,230,0.25)",
            color: "rgba(180,170,255,0.9)",
            fontSize: 12,
            fontWeight: 500,
            padding: "5px 14px",
            borderRadius: 20,
            marginBottom: 24,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8B7FF5" }} />
          Coming soon
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.6px",
            color: "#ffffff",
            marginBottom: 10,
          }}
        >
          Workspace
        </h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 15 }}>
          Your AI-powered planning workspace is being set up.
        </p>
      </div>
    </div>
  );
}
