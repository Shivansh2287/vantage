"use client";

import { useRouter } from "next/navigation";

const C = {
  bg: "#fafafa", surface: "rgba(0,0,0,0.02)", border: "rgba(0,0,0,0.08)",
  text: "#0f0f0f", textMuted: "rgba(0,0,0,0.55)", textDim: "rgba(0,0,0,0.35)",
  purple: "#5746E8", purpleLight: "#5746E8", purpleBg: "rgba(87,70,232,0.06)", purpleBorder: "rgba(87,70,232,0.2)",
  green: "#059669", yellow: "#b45309", red: "#dc2626", orange: "#ea580c",
};

const PROJECTS = [
  {
    id: "checkout",
    name: "Checkout Redesign",
    phase: "Tickets",
    status: "active",
    reqs: 8,
    tickets: 9,
    progress: 65,
    lastActivity: "2 hours ago",
    integrations: ["Linear", "Figma"],
    conflicts: 2,
    context: "87%",
    desc: "Reduce payment drop-off from 34.2% to under 22%",
    idea: "Redesign the checkout flow to reduce payment drop-off",
  },
  {
    id: "onboarding",
    name: "Onboarding v2",
    phase: "PRD",
    status: "draft",
    reqs: 5,
    tickets: 0,
    progress: 30,
    lastActivity: "Yesterday",
    integrations: [],
    conflicts: 0,
    context: "42%",
    desc: "Reduce time-to-value for new signups from 14 days to 3",
    idea: "Redesign the onboarding flow to reduce time to first value",
  },
  {
    id: "notifications",
    name: "Mobile Notifications",
    phase: "PRD",
    status: "draft",
    reqs: 3,
    tickets: 0,
    progress: 15,
    lastActivity: "3 days ago",
    integrations: [],
    conflicts: 0,
    context: "20%",
    desc: "Smart push notifications with preference controls",
    idea: "Build smart mobile push notifications with user preference controls",
  },
];

function VLogo({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.22), background: C.purple, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="none">
        <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 9H10.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function PhaseTag({ phase }: { phase: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    "PRD": { bg: "rgba(87,70,232,0.08)", color: "#5746E8" },
    "Tickets": { bg: "rgba(5,150,105,0.08)", color: "#059669" },
    "Shipped": { bg: "rgba(180,83,9,0.08)", color: "#b45309" },
  };
  const s = colors[phase] || colors["PRD"];
  return <span style={{ fontSize: 10, padding: "3px 8px", background: s.bg, color: s.color, borderRadius: 5, fontWeight: 500 }}>{phase}</span>;
}

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, sans-serif" }}>
      {/* Nav */}
      <div style={{ height: 52, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 32px", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <VLogo size={24} /><span style={{ fontSize: 15, fontWeight: 600, color: C.text, letterSpacing: "-0.3px" }}>Vantage</span>
        </div>
        <div style={{ flex: 1 }} />
        <a href="#" style={{ fontSize: 13, color: C.textDim, textDecoration: "none" }}>Settings</a>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(87,70,232,0.1)", border: `1px solid ${C.purpleBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.purpleLight, fontWeight: 600, cursor: "default" }}>AK</div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: C.text, letterSpacing: "-0.5px", marginBottom: 6 }}>Your Projects</h1>
            <p style={{ fontSize: 14, color: C.textDim }}>3 active workspaces · 17 requirements · 9 tickets</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => router.push("/onboarding")} style={{ fontSize: 13, padding: "8px 16px", background: "rgba(0,0,0,0.04)", border: `1px solid ${C.border}`, borderRadius: 9, color: C.textMuted, cursor: "pointer", fontFamily: "inherit" }}>
              Import existing product
            </button>
            <button onClick={() => router.push("/")} style={{ fontSize: 13, padding: "8px 18px", background: C.purple, border: "none", borderRadius: 9, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#4336D4"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = C.purple}>
              + New Project
            </button>
          </div>
        </div>

        {/* Project grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {PROJECTS.map(p => (
            <div key={p.id}
              style={{ background: C.surface, border: `1px solid ${p.status === "active" ? "rgba(87,70,232,0.2)" : C.border}`, borderRadius: 14, padding: "20px 22px", cursor: "pointer", transition: "all 0.18s", display: "flex", flexDirection: "column", gap: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(87,70,232,0.35)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(87,70,232,0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = p.status === "active" ? "rgba(87,70,232,0.2)" : C.border; (e.currentTarget as HTMLDivElement).style.background = C.surface; }}
              onClick={() => router.push(`/workspace?idea=${encodeURIComponent(p.idea)}`)}
            >
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</span>
                    {p.status === "active" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.45 }}>{p.desc}</p>
                </div>
                <PhaseTag phase={p.phase} />
              </div>

              {/* Progress bar */}
              <div style={{ height: 3, background: "rgba(0,0,0,0.07)", borderRadius: 2, marginBottom: 14 }}>
                <div style={{ height: "100%", width: `${p.progress}%`, background: `linear-gradient(90deg, ${C.purple}, ${C.purpleLight})`, borderRadius: 2, transition: "width 0.5s ease" }} />
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{p.reqs}</span>
                  <span style={{ fontSize: 10, color: C.textDim }}>Requirements</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{p.tickets}</span>
                  <span style={{ fontSize: 10, color: C.textDim }}>Tickets</span>
                </div>
                {p.conflicts > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: C.yellow }}>{p.conflicts}</span>
                    <span style={{ fontSize: 10, color: C.textDim }}>Conflicts</span>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#059669" }}>{p.context}</span>
                  <span style={{ fontSize: 10, color: C.textDim }}>Context</span>
                </div>
              </div>

              {/* Integration badges + footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {p.integrations.map(i => (
                    <span key={i} style={{ fontSize: 10, padding: "2px 7px", background: "rgba(0,0,0,0.04)", border: `1px solid ${C.border}`, borderRadius: 4, color: C.textMuted }}>{i}</span>
                  ))}
                  {p.integrations.length === 0 && <span style={{ fontSize: 10, color: C.textDim }}>No integrations yet</span>}
                </div>
                <span style={{ fontSize: 10, color: C.textDim }}>{p.lastActivity}</span>
              </div>
            </div>
          ))}

          {/* New project card */}
          <div onClick={() => router.push("/")}
            style={{ background: "transparent", border: `1px dashed ${C.border}`, borderRadius: 14, padding: "20px 22px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 200, transition: "all 0.18s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.purpleBorder; (e.currentTarget as HTMLDivElement).style.background = C.purpleBg; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, border: `1px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: C.textDim }}>+</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.textMuted, marginBottom: 4 }}>New Project</div>
              <div style={{ fontSize: 11, color: C.textDim }}>Describe your idea or import a product</div>
            </div>
          </div>
        </div>

        {/* Bottom integrations teaser */}
        <div style={{ marginTop: 48, background: "rgba(87,70,232,0.06)", border: `1px solid ${C.purpleBorder}`, borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>Connect your tools</p>
            <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>Vantage connects to Linear, Jira, GitHub, Notion, and Figma. You don't migrate — Vantage is the brain, your tools are the hands.</p>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[{l:"Linear",c:"#5E6AD2"},{l:"Notion",c:"rgba(0,0,0,0.05)"},{l:"GitHub",c:"rgba(0,0,0,0.05)"},{l:"Figma",c:"rgba(162,89,255,0.3)"},{l:"Jira",c:"rgba(0,101,255,0.2)"}].map(i=>(
              <div key={i.l} title={i.l} style={{width:30,height:30,borderRadius:7,background:i.c,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"rgba(0,0,0,0.5)",fontWeight:600}}>{i.l[0]}</div>
            ))}
            <button onClick={() => router.push("/workspace?idea=Checkout+Redesign")} style={{ marginLeft: 8, fontSize: 12, padding: "7px 14px", background: C.purple, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>Manage →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
