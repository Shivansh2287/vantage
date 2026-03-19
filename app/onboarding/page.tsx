"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const C = {
  bg: "#fafafa", surface: "rgba(0,0,0,0.02)", border: "rgba(0,0,0,0.08)",
  text: "#0f0f0f", textMuted: "rgba(0,0,0,0.55)", textDim: "rgba(0,0,0,0.35)",
  purple: "#5746E8", purpleHover: "#4336D4", purpleLight: "#5746E8",
  purpleBg: "rgba(87,70,232,0.07)", purpleBorder: "rgba(87,70,232,0.2)",
  green: "#059669", yellow: "#b45309",
};

function VLogo({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.22), background: C.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="none">
        <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 9H10.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

const EXTRACTED = {
  name: "Acme Commerce",
  category: "E-commerce platform",
  audience: "SMB online retailers",
  features: ["Product catalog","Checkout & payments","Inventory management","Customer accounts","Analytics dashboard"],
  techStack: ["React","Node.js","Stripe","PostgreSQL"],
  pages: 47,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1|2|3|4|5>(1);
  const [connectedServices, setConnectedServices] = useState<Set<string>>(new Set());
  const [url, setUrl] = useState("");
  const [crawlState, setCrawlState] = useState<"idle"|"crawling"|"done">("idle");
  const [crawlCount, setCrawlCount] = useState(0);
  const [docs, setDocs] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [idea, setIdea] = useState("");
  const [editedName, setEditedName] = useState(EXTRACTED.name);
  const [editedDesc, setEditedDesc] = useState("Acme Commerce is an e-commerce platform for SMB retailers, built on React + Node.js with Stripe payments.");

  function handleCrawl(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setCrawlState("crawling");
    const interval = setInterval(() => setCrawlCount(n => n + 1), 180);
    setTimeout(() => {
      clearInterval(interval);
      setCrawlCount(EXTRACTED.pages);
      setCrawlState("done");
      setTimeout(() => setStep(2), 600);
    }, 3200);
  }

  function handleDocAdd(name: string) {
    if (!docs.includes(name)) setDocs(prev => [...prev, name]);
  }

  function handleScreenshotAdd(name: string) {
    if (!screenshots.includes(name)) setScreenshots(prev => [...prev, name]);
  }

  function handleGeneratePRD(e: FormEvent) {
    e.preventDefault();
    if (!idea.trim()) return;
    router.push(`/workspace?idea=${encodeURIComponent(idea)}&context=existing`);
  }

  const coverage = Math.min(95, 42 + docs.length * 12 + screenshots.length * 8);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <div style={{ height: 52, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 32px", gap: 12, flexShrink: 0 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <VLogo size={24} /><span style={{ fontSize: 15, fontWeight: 600, color: C.text, letterSpacing: "-0.3px" }}>Vantage</span>
        </a>
        <div style={{ flex: 1 }} />
        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {([1,2,3,4,5] as const).map((n, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: step > n ? C.green : step === n ? C.purple : "rgba(0,0,0,0.08)", border: `1px solid ${step > n ? C.green : step === n ? C.purple : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "white", transition: "all 0.3s" }}>
                {step > n ? "✓" : n}
              </div>
              {i < 4 && <div style={{ width: 18, height: 1, background: step > n ? C.green : C.border, transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <a href="/dashboard" style={{ fontSize: 13, color: C.textDim, textDecoration: "none" }}>← Dashboard</a>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 600 }}>

          {/* STEP 1: URL */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.purpleLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Step 1 of 5</div>
                <h1 style={{ fontSize: 28, fontWeight: 600, color: C.text, letterSpacing: "-0.5px", marginBottom: 10 }}>What's your product URL?</h1>
                <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.65 }}>Vantage will crawl your website and extract your product context — name, features, audience, and tech stack. Up to 50 pages.</p>
              </div>

              <form onSubmit={handleCrawl}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yourproduct.com" style={{ flex: 1, padding: "12px 16px", fontSize: 14, color: C.text, background: "rgba(0,0,0,0.05)", border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: "inherit" }} onFocus={e => e.currentTarget.style.borderColor = "rgba(87,70,232,0.45)"} onBlur={e => e.currentTarget.style.borderColor = C.border} />
                  <button type="submit" disabled={crawlState === "crawling"} style={{ padding: "12px 22px", background: C.purple, border: "none", borderRadius: 10, color: "#fff", cursor: crawlState === "crawling" ? "not-allowed" : "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 500, opacity: crawlState === "crawling" ? 0.7 : 1 }}>
                    {crawlState === "idle" ? "Crawl →" : crawlState === "crawling" ? "Crawling..." : "Done ✓"}
                  </button>
                </div>
              </form>

              {crawlState === "crawling" && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.purpleLight, animation: `vpulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}</div>
                    <span style={{ fontSize: 13, color: C.textMuted }}>Crawling {url || "your product"}...</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textDim }}>{crawlCount} pages indexed</div>
                  <div style={{ height: 3, background: "rgba(0,0,0,0.07)", borderRadius: 2, marginTop: 10 }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (crawlCount / EXTRACTED.pages) * 100)}%`, background: `linear-gradient(90deg, ${C.purple}, ${C.purpleLight})`, borderRadius: 2, transition: "width 0.3s" }} />
                  </div>
                </div>
              )}

              {crawlState === "done" && (
                <div style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.15))", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>✓</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.green }}>{EXTRACTED.pages} pages indexed</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>Moving to context review...</div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>Or try a demo product:</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {["acmecommerce.com","shopify.com/checkout","stripe.com"].map(d => (
                    <button key={d} onClick={() => { setUrl(`https://${d}`); }} style={{ fontSize: 11, padding: "6px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, color: C.textMuted, cursor: "pointer", fontFamily: "inherit" }}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Data Connectors */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.purpleLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Step 2 of 5</div>
                <h1 style={{ fontSize: 28, fontWeight: 600, color: C.text, letterSpacing: "-0.5px", marginBottom: 10 }}>Connect your data sources</h1>
                <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.65 }}>Pull in context from the tools your team already uses. Vantage reads from these sources to inform your PRD and tickets.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {[
                  { id: "github", name: "GitHub", desc: "Index your codebase — tickets reference real files and functions.", icon: "</>", color: "rgba(0,0,0,0.08)", badge: "MVP" },
                  { id: "jira", name: "Jira", desc: "Two-way sync — existing tickets and epics inform the PRD context.", icon: "J", color: "rgba(0,101,255,0.15)", badge: "MVP" },
                  { id: "notion", name: "Notion", desc: "Import PRDs, decision logs, and roadmaps. Query across all pages.", icon: "N", color: "rgba(0,0,0,0.07)", badge: "MVP" },
                  { id: "slack", name: "Slack", desc: "Surface relevant channel discussions and decisions as product context.", icon: "#", color: "rgba(74,21,75,0.12)", badge: "MVP" },
                  { id: "gsuite", name: "Google Workspace", desc: "Import Docs, Sheets, and Drive files into your product context.", icon: "G", color: "rgba(66,133,244,0.15)", badge: "MVP" },
                ].map(svc => {
                  const isConnected = connectedServices.has(svc.id);
                  return (
                    <div key={svc.id} style={{ background: isConnected ? "rgba(5,150,105,0.04)" : C.surface, border: `1px solid ${isConnected ? "rgba(5,150,105,0.2)" : C.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, transition: "all 0.25s" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: svc.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "rgba(0,0,0,0.65)", fontWeight: 700, flexShrink: 0 }}>{svc.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{svc.name} <span style={{ fontSize: 10, background: "rgba(87,70,232,0.1)", color: C.purpleLight, borderRadius: 4, padding: "1px 5px", marginLeft: 4 }}>{svc.badge}</span></div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>{svc.desc}</div>
                      </div>
                      {isConnected
                        ? <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} /><span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>Connected</span></div>
                        : <button onClick={() => setConnectedServices(prev => { const n = new Set(prev); n.add(svc.id); return n; })} style={{ fontSize: 12, padding: "6px 14px", background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, borderRadius: 7, color: C.purpleLight, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Connect →</button>
                      }
                    </div>
                  );
                })}
              </div>

              {connectedServices.size > 0 && (
                <div style={{ background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: C.green }}>
                  ✓ {connectedServices.size} connector{connectedServices.size !== 1 ? "s" : ""} active — Vantage will index these alongside your crawled pages.
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "11px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.textMuted, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: "11px", background: C.purple, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 500 }}>
                  {connectedServices.size > 0 ? "Add more context →" : "Skip for now →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Docs + Screenshots */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.purpleLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Step 3 of 5</div>
                <h1 style={{ fontSize: 28, fontWeight: 600, color: C.text, letterSpacing: "-0.5px", marginBottom: 10 }}>Add more context</h1>
                <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.65 }}>Upload existing docs and screenshots to give Vantage internal context that no crawl can find.</p>
              </div>

              {/* Docs */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.65)", marginBottom: 10 }}>Documents <span style={{ fontSize: 11, color: C.textDim }}>(PRDs, specs, meeting notes)</span></div>
                <div style={{ background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", marginBottom: 10 }}
                  onClick={() => handleDocAdd(`Checkout-PRD-v1.pdf`)}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>📄</div>
                  <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>Click to add a document</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>PDF, Notion export, Google Doc, Markdown</div>
                </div>
                {docs.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {docs.map(d => (
                      <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.15)", borderRadius: 7 }}>
                        <span style={{ fontSize: 14 }}>✓</span><span style={{ fontSize: 12, color: "#059669" }}>{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Screenshots */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.65)", marginBottom: 10 }}>Screenshots <span style={{ fontSize: 11, color: C.textDim }}>(app flows, key screens)</span></div>
                <div style={{ background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", marginBottom: 10 }}
                  onClick={() => handleScreenshotAdd(`checkout-flow-${screenshots.length + 1}.png`)}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>🖼️</div>
                  <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>Click to add a screenshot</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>AI uses vision to understand your UI layout and flows</div>
                </div>
                {screenshots.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {screenshots.map(s => (
                      <div key={s} style={{ padding: "6px 10px", background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.15)", borderRadius: 6, fontSize: 11, color: "#059669", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>🖼️</span>{s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coverage meter */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: C.textMuted }}>Context coverage</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: coverage >= 70 ? C.green : C.yellow }}>{coverage}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(0,0,0,0.07)", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${coverage}%`, background: coverage >= 70 ? `linear-gradient(90deg, ${C.green}, rgba(5,150,105,0.5))` : `linear-gradient(90deg, ${C.yellow}, rgba(180,83,9,0.4))`, borderRadius: 3, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 7 }}>
                  {coverage < 60 ? "Add more docs or screenshots to improve context quality." : coverage < 80 ? "Good coverage. More context = more accurate PRDs." : "Excellent context coverage. Vantage has strong product knowledge."}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(2)} style={{ padding: "11px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.textMuted, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>← Back</button>
                <button onClick={() => setStep(4)} style={{ flex: 1, padding: "11px", background: C.purple, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 500 }}>Review context →</button>
              </div>
            </div>
          )}

          {/* STEP 4: Review context */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.purpleLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Step 4 of 5</div>
                <h1 style={{ fontSize: 28, fontWeight: 600, color: C.text, letterSpacing: "-0.5px", marginBottom: 10 }}>Review what we found</h1>
                <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.65 }}>Vantage extracted this from your website. Correct anything that's wrong.</p>
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "12px 16px" }}>
                  <span style={{ fontSize: 12, color: C.textDim, alignSelf: "center" }}>Product name</span>
                  <input value={editedName} onChange={e => setEditedName(e.target.value)} style={{ fontSize: 13, color: C.text, background: "rgba(0,0,0,0.04)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 10px", fontFamily: "inherit" }} />
                  <span style={{ fontSize: 12, color: C.textDim, alignSelf: "center" }}>Category</span>
                  <span style={{ fontSize: 13, color: C.textMuted }}>{EXTRACTED.category}</span>
                  <span style={{ fontSize: 12, color: C.textDim, alignSelf: "center" }}>Target audience</span>
                  <span style={{ fontSize: 13, color: C.textMuted }}>{EXTRACTED.audience}</span>
                  <span style={{ fontSize: 12, color: C.textDim }}>Key features</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {EXTRACTED.features.map(f => <span key={f} style={{ fontSize: 11, padding: "3px 8px", background: C.purpleBg, color: C.purpleLight, borderRadius: 4, border: `1px solid ${C.purpleBorder}` }}>{f}</span>)}
                  </div>
                  <span style={{ fontSize: 12, color: C.textDim }}>Tech stack</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {EXTRACTED.techStack.map(t => <span key={t} style={{ fontSize: 11, padding: "3px 8px", background: "rgba(0,0,0,0.06)", color: C.textMuted, borderRadius: 4, border: `1px solid ${C.border}` }}>{t}</span>)}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.65)", marginBottom: 8 }}>Product description</div>
                <textarea value={editedDesc} onChange={e => setEditedDesc(e.target.value)} rows={3} style={{ width: "100%", padding: "11px 14px", fontSize: 13, color: C.text, background: "rgba(0,0,0,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", lineHeight: 1.6, resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(3)} style={{ padding: "11px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.textMuted, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>← Back</button>
                <button onClick={() => setStep(5)} style={{ flex: 1, padding: "11px", background: C.purple, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 500 }}>Looks good →</button>
              </div>
            </div>
          )}

          {/* STEP 5: What are you building */}
          {step === 5 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.purpleLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Step 5 of 5</div>
                <h1 style={{ fontSize: 28, fontWeight: 600, color: C.text, letterSpacing: "-0.5px", marginBottom: 10 }}>What are you working on?</h1>
                <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.65 }}>Describe the specific feature or project. Vantage will generate a PRD informed by your full product context.</p>
              </div>

              {/* Context summary */}
              <div style={{ background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.15))", borderRadius: 10, padding: "12px 16px", marginBottom: 22, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 14 }}>✓</span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#059669" }}>{editedName} · {coverage}% context coverage</span>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{EXTRACTED.pages} web pages · {docs.length} doc{docs.length !== 1 ? "s" : ""} · {screenshots.length} screenshot{screenshots.length !== 1 ? "s" : ""}</div>
                </div>
              </div>

              <form onSubmit={handleGeneratePRD}>
                <textarea value={idea} onChange={e => setIdea(e.target.value)} rows={4} placeholder={`e.g. "Redesign the checkout flow to reduce payment drop-off from 34% to under 22%"`} style={{ width: "100%", padding: "13px 16px", fontSize: 14, color: C.text, background: "rgba(0,0,0,0.05)", border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: "inherit", lineHeight: 1.65, resize: "vertical", marginBottom: 12 }} onFocus={e => e.currentTarget.style.borderColor = "rgba(87,70,232,0.45)"} onBlur={e => e.currentTarget.style.borderColor = C.border} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                  {["Redesign the checkout flow","Rebuild the onboarding experience","Add mobile push notifications","Launch a referral program"].map(s => (
                    <button key={s} type="button" onClick={() => setIdea(s)} style={{ fontSize: 11, padding: "6px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, color: C.textMuted, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => setStep(4)} style={{ padding: "12px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.textMuted, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>← Back</button>
                  <button type="submit" style={{ flex: 1, padding: "12px", background: C.purple, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 15, fontFamily: "inherit", fontWeight: 600 }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = C.purpleHover}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = C.purple}>
                    Generate PRD with context →
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes vpulse { 0%,100%{transform:scale(0.7);opacity:0.3} 50%{transform:scale(1.15);opacity:1} }
        input:focus,textarea:focus,button:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}
