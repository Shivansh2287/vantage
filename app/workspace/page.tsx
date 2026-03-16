"use client";

import { useState, useEffect, useRef, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/* ─── DESIGN TOKENS ─── */
const C = {
  bg: "#080808",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.45)",
  textDim: "rgba(255,255,255,0.22)",
  purple: "#5746E8",
  purpleHover: "#4336D4",
  purpleLight: "#8B7FF5",
  purpleBg: "rgba(100,86,230,0.12)",
  purpleBorder: "rgba(100,86,230,0.25)",
  red: "#F87B72",
  yellow: "#F5B445",
  green: "#3ECF8E",
};

/* ─── TYPES ─── */
type Req = {
  id: string;
  title: string;
  priority: "P0" | "P1" | "P2";
  effort: string;
  points: number;
  conflict: boolean;
  conflictNote?: string;
};

type Ticket = {
  id: string;
  title: string;
  req: string;
  effort: string;
  pts: number;
  deps: string[];
  description: string;
  criteria: string[];
};

type Wave = { n: number; label: string; tickets: Ticket[] };
type MsgRole = "user" | "ai";
type Message = {
  role: MsgRole;
  text: string;
  cites?: { n: number; label: string }[];
  insertReq?: string | null;
};

/* ─── DATA ─── */
const REQS: Req[] = [
  { id: "R1", title: "Guest checkout must not require account creation", priority: "P0", effort: "M", points: 3, conflict: false },
  { id: "R2", title: "Support Apple Pay and Google Pay at checkout", priority: "P0", effort: "L", points: 5, conflict: false },
  { id: "R3", title: "Display trust badges and security copy at payment step", priority: "P1", effort: "S", points: 1, conflict: false },
  { id: "R4", title: "Autofill shipping from saved addresses", priority: "P0", effort: "M", points: 3, conflict: true, conflictNote: "Conflicts with R1: guest checkout users have no saved addresses to autofill. Resolution: scope R4 to authenticated users only — guest path shows empty form with browser autocomplete." },
  { id: "R5", title: "Show estimated delivery date before confirming order", priority: "P1", effort: "M", points: 3, conflict: false },
  { id: "R6", title: "One-page checkout with progress indicator", priority: "P1", effort: "L", points: 5, conflict: false },
  { id: "R7", title: "Send abandoned cart email 30 min after drop-off", priority: "P2", effort: "M", points: 3, conflict: false },
  { id: "R8", title: "A/B test CTA variants: 'Pay now' vs 'Complete order'", priority: "P2", effort: "S", points: 1, conflict: false },
];

const WAVES: Wave[] = [
  {
    n: 1, label: "Wave 1 · Foundation",
    tickets: [
      { id: "VAN-001", title: "Implement guest checkout bypass", req: "R1", effort: "M", pts: 3, deps: [], description: "Remove mandatory account creation from the checkout flow. Add 'Continue as Guest' path through auth middleware. Guest session persists in a secure cookie for 30 days.", criteria: ["Guest users can complete checkout without an account", "Logged-in flow is unchanged and tested", "Guest session persists in secure cookie for 30 days"] },
      { id: "VAN-002", title: "Build CheckoutProgress component", req: "R6", effort: "S", pts: 2, deps: [], description: "Reusable progress indicator component showing: Cart → Shipping → Payment → Confirmation. Should be placed at the top of the checkout page.", criteria: ["Current step is visually highlighted", "Completed steps are clickable (allows going back)", "Fully responsive on mobile (375px+)"] },
    ],
  },
  {
    n: 2, label: "Wave 2 · Payment",
    tickets: [
      { id: "VAN-003", title: "Integrate Apple Pay via Stripe", req: "R2", effort: "L", pts: 5, deps: ["VAN-001"], description: "Add Apple Pay button to the payment step using Stripe Payment Request API. Should appear above the manual card entry form.", criteria: ["Visible on Safari/iOS browsers", "Falls back gracefully on unsupported browsers", "Passes full Stripe test suite (all test cards)"] },
      { id: "VAN-004", title: "Integrate Google Pay via Stripe", req: "R2", effort: "L", pts: 5, deps: ["VAN-001"], description: "Add Google Pay button using the same Stripe Payment Request handler as Apple Pay. Should share the onPaymentMethod handler.", criteria: ["Visible on Chrome/Android", "Shares Payment Request handler with VAN-003", "Passes Stripe test suite"] },
      { id: "VAN-005", title: "Add trust badges at payment step", req: "R3", effort: "S", pts: 1, deps: ["VAN-002"], description: "SSL, PCI DSS, and money-back guarantee badge strip above the payment form. Renders as an inline row of small icons + labels.", criteria: ["Badges visible on payment step above card form", "All images have alt text (accessibility)", "Lighthouse accessibility score ≥ 95"] },
    ],
  },
  {
    n: 3, label: "Wave 3 · Conversion",
    tickets: [
      { id: "VAN-006", title: "Autofill shipping for logged-in users", req: "R4", effort: "M", pts: 3, deps: ["VAN-001"], description: "Pre-populate shipping form from address book for authenticated users only. Guest path unaffected, resolving the R4 conflict with R1.", criteria: ["Only shown for logged-in users (guest path unchanged)", "User can edit or select from address book", "Resolves R4 conflict flagged in PRD"] },
      { id: "VAN-007", title: "Delivery date estimate in order summary", req: "R5", effort: "M", pts: 3, deps: ["VAN-002"], description: "Integrate ShippingEstimator API to show delivery date range in the order summary panel before payment confirmation.", criteria: ["Date range shown in right-side order summary", "Updates when shipping method changes", "Shows 'Estimated' label with date range"] },
      { id: "VAN-008", title: "Abandoned cart email trigger", req: "R7", effort: "M", pts: 3, deps: [], description: "Fire event to the email service when a cart is abandoned (no checkout completion within 30 min of last activity).", criteria: ["Email sent ≤35 min after abandonment", "Not sent if purchase completes in time window", "Includes unsubscribe link per CAN-SPAM"] },
      { id: "VAN-009", title: "A/B test: checkout CTA copy", req: "R8", effort: "S", pts: 1, deps: ["VAN-002"], description: "Feature-flag based 50/50 A/B test on the final checkout CTA: 'Pay now' vs 'Complete order'.", criteria: ["50/50 random split per session", "Variant tracked in Amplitude as checkout_cta_variant", "Rollback via feature flag in <5 min"] },
    ],
  },
];

/* ─── QUERY ENGINE LOGIC ─── */
function getQueryResponse(q: string): { text: string; cites: { n: number; label: string }[]; insertReq: string | null } {
  const lower = q.toLowerCase();
  if (/abandon|drop.?off|conversion|complet/.test(lower)) return {
    text: "Baymard Institute's 2024 study found **69.8% average cart abandonment rate** across e-commerce. The single biggest driver: **forced account creation** causes 24% of users to abandon at that step alone.\n\nCheckouts with ≤3 steps outperform 5+ step flows by **3×**. Adding guest checkout alone increases completion by 23–35%. Shopify, Stripe, and BigCommerce all default to one-page or 3-step flows.",
    cites: [{ n: 1, label: "Baymard Institute 2024" }, { n: 2, label: "Stripe Checkout Study 2023" }],
    insertReq: "R1",
  };
  if (/apple.?pay|google.?pay|wallet|payment method|alternative/.test(lower)) return {
    text: "Apple Pay and Google Pay show **15–20% higher conversion** vs manual card entry on mobile:\n\n- Apple Pay: 63% of iPhone users have it set up (Worldpay 2024)\n- Google Pay: 42% of Android users (Google I/O 2024)\n- Average checkout: **8 seconds** vs 3 minutes for manual card entry\n\nStripe's Payment Request API handles both with a single integration point. Recommend adding above the card form.",
    cites: [{ n: 1, label: "Worldpay Global Payments 2024" }, { n: 2, label: "Google I/O 2024" }],
    insertReq: "R2",
  };
  if (/conflict|r4|autofill|address|guest/.test(lower)) return {
    text: "**Conflict detected between R1 and R4.**\n\nR1 requires guest checkout (no account). R4 requires autofilling saved addresses — which only exist for logged-in users.\n\n**Recommended resolution:** Apply R4 conditionally — only for authenticated users. Guest users see an empty form with browser autocomplete enabled. This satisfies both requirements with a scoped implementation.\n\nSee VAN-006 in the ticket breakdown for the resolved implementation.",
    cites: [{ n: 1, label: "PRD Conflict Analysis · Internal" }],
    insertReq: "R4",
  };
  if (/miss|gap|what else|overlook|coverage|complet/.test(lower)) return {
    text: "After analyzing your 8 requirements against checkout benchmarks, **3 gaps found:**\n\n1. **Error recovery** — No requirement for clear payment failure messaging. Baymard found 13% of users abandon at payment due to confusing error states.\n\n2. **Order confirmation email** — Not mentioned, but critical for perceived completion and trust.\n\n3. **Mobile keyboard optimization** — `inputMode=\"numeric\"` and `autocomplete` attributes for card fields. Small implementation detail, measurable UX impact.",
    cites: [{ n: 1, label: "Baymard UX Research 2024" }],
    insertReq: null,
  };
  if (/shopify|competitor|compare|stripe checkout|amazon/.test(lower)) return {
    text: "Top checkout flows across Shopify, Stripe, and Amazon share 4 patterns:\n\n1. **Guest first** — default to guest, offer account creation post-purchase\n2. **Progress indicator** — even single-page checkouts show step status\n3. **Express wallets** — Apple/Google Pay displayed prominently above card form\n4. **Real-time validation** — inline field errors, not submit-time\n\nYour PRD covers patterns 1–3. Real-time validation (pattern 4) is not currently specified.",
    cites: [{ n: 1, label: "Checkout Benchmark Report 2024" }, { n: 2, label: "Baymard Checkout UX Study" }],
    insertReq: null,
  };
  return {
    text: "Based on your PRD context and current industry data, your requirements align well with high-conversion checkout patterns. R1 (guest checkout) and R2 (Apple/Google Pay) address the two highest-impact drop-off points.\n\nOne observation: 72% of checkout sessions start on mobile. R6 (progress indicator) is especially critical at mobile viewport widths where users can't see context above the fold.",
    cites: [{ n: 1, label: "Checkout UX Report 2024" }, { n: 2, label: "Mobile Commerce Index 2024" }],
    insertReq: null,
  };
}

function priorityColor(p: string) {
  if (p === "P0") return C.red;
  if (p === "P1") return C.yellow;
  return C.textDim;
}

/* ══════════════════════════════════════════════════════════
   GENERATING SCREEN
══════════════════════════════════════════════════════════ */
function GeneratingScreen({ idea, onDone }: { idea: string; onDone: () => void }) {
  const steps = [
    "Analyzing your idea...",
    "Researching industry benchmarks...",
    "Identifying target users and use cases...",
    "Structuring requirements with priority + effort...",
    "PRD ready ✓",
  ];
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setStep(i);
        setProgress(Math.round(((i + 1) / steps.length) * 100));
      }, i * 480 + 150));
    });
    timers.push(setTimeout(onDone, steps.length * 480 + 500));
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line

  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.5 9H10.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
        <span style={{ fontSize: 18, fontWeight: 600, color: C.text, letterSpacing: "-0.3px" }}>Vantage</span>
      </div>

      {/* Idea pill */}
      <div style={{ background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, color: "rgba(200,190,255,0.85)", fontSize: 13, padding: "7px 18px", borderRadius: 20, marginBottom: 44, maxWidth: 480, textAlign: "center", lineHeight: 1.5, fontStyle: "italic" }}>
        "{idea}"
      </div>

      {/* Steps */}
      <div style={{ width: 340, marginBottom: 32 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 13, opacity: i <= step ? 1 : 0.18, transition: "opacity 0.35s" }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              background: i < step ? C.green : i === step ? C.purple : "rgba(255,255,255,0.08)",
              border: `1px solid ${i < step ? C.green : i === step ? C.purple : "rgba(255,255,255,0.12)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.3s, border-color 0.3s",
            }}>
              {i < step && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {i === step && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white", opacity: 0.9 }} />}
            </div>
            <span style={{ fontSize: 14, color: i <= step ? "rgba(255,255,255,0.85)" : C.textDim, transition: "color 0.3s" }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: 340, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.purple}, ${C.purpleLight})`, borderRadius: 2, width: `${progress}%`, transition: "width 0.45s ease" }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   QUERY PANEL (compact, right side of PRD view)
══════════════════════════════════════════════════════════ */
function QueryPanel({ messages, onSend, loading, onInsert }: {
  messages: Message[];
  onSend: (q: string) => void;
  loading: boolean;
  onInsert: (reqId: string) => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  }

  return (
    <div style={{ width: 296, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "13px 15px 11px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Research</span>
        <span style={{ fontSize: 10, background: C.purpleBg, color: C.purpleLight, border: `1px solid ${C.purpleBorder}`, padding: "2px 7px", borderRadius: 10 }}>
          {messages.filter(m => m.role === "ai").length} queries
        </span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "13px 13px", display: "flex", flexDirection: "column", gap: 9 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "88%", fontSize: 12, lineHeight: 1.65, padding: "8px 10px",
              borderRadius: m.role === "user" ? "8px 8px 2px 8px" : "8px 8px 8px 2px",
              background: m.role === "user" ? "rgba(100,86,230,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${m.role === "user" ? "rgba(100,86,230,0.3)" : C.border}`,
              color: m.role === "user" ? "rgba(200,190,255,0.9)" : "rgba(255,255,255,0.6)",
            }}>
              <div dangerouslySetInnerHTML={{
                __html: m.text
                  .replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(255,255,255,0.88)">$1</strong>')
                  .replace(/\n\n/g, "<br/><br/>")
                  .replace(/\n(\d+\.)/g, "<br/>$1")
              }} />
              {m.cites && m.cites.length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 7, flexWrap: "wrap" }}>
                  {m.cites.map(c => (
                    <span key={c.n} style={{ fontSize: 10, background: C.purpleBg, color: "rgba(170,160,255,0.85)", borderRadius: 3, padding: "2px 6px" }}>
                      [{c.n}] {c.label}
                    </span>
                  ))}
                </div>
              )}
              {m.insertReq && (
                <button onClick={() => onInsert(m.insertReq!)} style={{ marginTop: 7, fontSize: 11, color: C.purpleLight, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, display: "block" }}>
                  Insert into PRD →
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "8px 8px 8px 2px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.purpleLight, animation: `vpulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 11px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 6 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything..."
            style={{ flex: 1, padding: "7px 10px", fontSize: 12, color: C.text, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 7, fontFamily: "inherit" }}
            onFocus={e => e.currentTarget.style.borderColor = "rgba(100,86,230,0.45)"}
            onBlur={e => e.currentTarget.style.borderColor = C.border}
          />
          <button type="submit" disabled={loading} style={{ padding: "7px 13px", background: C.purple, border: "none", borderRadius: 7, color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "inherit", opacity: loading ? 0.5 : 1 }}>→</button>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CONFLICT MODAL
══════════════════════════════════════════════════════════ */
function ConflictModal({ req, onClose }: { req: Req; onClose: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#111111", border: "1px solid rgba(245,180,69,0.3)", borderRadius: 14, padding: 26, maxWidth: 460, width: "90%", fontFamily: "Inter, sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ fontSize: 16 }}>⚠</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.yellow }}>Requirement conflict</span>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 2px" }}>×</button>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.purpleLight, display: "block", marginBottom: 4 }}>{req.id}</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{req.title}</span>
        </div>

        <div style={{ background: "rgba(245,180,69,0.06)", border: "1px solid rgba(245,180,69,0.18)", borderRadius: 8, padding: "12px 14px", marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: "rgba(245,180,69,0.85)", lineHeight: 1.65 }}>{req.conflictNote}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Suggested resolution</p>
          <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>
            Scope {req.id} to apply only for authenticated users. Guest users see a clean shipping form with browser autocomplete. This keeps R1 (guest checkout) and R4 (autofill) both valid. See <strong style={{ color: C.purpleLight }}>VAN-006</strong> in the ticket breakdown for implementation details.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "9px", background: C.purple, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 500 }}>
            Apply resolution
          </button>
          <button onClick={onClose} style={{ padding: "9px 15px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PRD EDITOR
══════════════════════════════════════════════════════════ */
function PRDEditor({ insertedReqs, flashReqId, onConflictClick, onGenerateTickets, ticketsState }: {
  insertedReqs: string[];
  flashReqId: string | null;
  onConflictClick: (req: Req) => void;
  onGenerateTickets: () => void;
  ticketsState: "idle" | "generating" | "done";
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const filteredReqs = filter === "All" ? REQS : REQS.filter(r => r.priority === filter);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 26px" }}>
      {/* Doc header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: C.text, letterSpacing: "-0.4px", marginBottom: 5 }}>Checkout Redesign</h1>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>8 requirements</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.textDim }} />
            <span style={{ fontSize: 12, color: C.red }}>2 conflicts detected</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.textDim }} />
            <span style={{ fontSize: 12, color: "rgba(62,207,142,0.85)" }}>87% context coverage</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {ticketsState === "idle" && (
            <button onClick={onGenerateTickets} style={{ fontSize: 12, padding: "7px 15px", background: C.purple, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = C.purpleHover}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = C.purple}>
              Generate Tickets →
            </button>
          )}
          {ticketsState === "generating" && (
            <button disabled style={{ fontSize: 12, padding: "7px 15px", background: "rgba(87,70,232,0.4)", border: "none", borderRadius: 8, color: "rgba(255,255,255,0.45)", cursor: "not-allowed", fontFamily: "inherit" }}>
              Generating...
            </button>
          )}
          {ticketsState === "done" && (
            <button style={{ fontSize: 12, padding: "7px 15px", background: "rgba(62,207,142,0.12)", border: "1px solid rgba(62,207,142,0.25)", borderRadius: 8, color: "rgba(62,207,142,0.9)", cursor: "pointer", fontFamily: "inherit" }}>
              ✓ Tickets generated
            </button>
          )}
          <button style={{ fontSize: 12, padding: "7px 12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, cursor: "pointer", fontFamily: "inherit" }}>
            Export
          </button>
        </div>
      </div>

      {/* Conflict banner */}
      <div style={{ background: "rgba(245,180,69,0.07)", border: "1px solid rgba(245,180,69,0.2)", borderRadius: 9, padding: "10px 14px", marginBottom: 22, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>⚠</span>
        <span style={{ fontSize: 12, color: "#F5B445", fontWeight: 500 }}>2 requirement conflicts detected</span>
        <span style={{ fontSize: 12, color: "rgba(245,180,69,0.55)", marginLeft: 4 }}>— Click a conflict badge to see the analysis</span>
      </div>

      {/* Overview section */}
      <Section title="Overview" id="overview" expanded={expanded} onToggle={id => setExpanded(expanded === id ? null : id)}>
        <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.75 }}>
          The checkout redesign aims to reduce payment drop-off from <strong style={{ color: C.text }}>34.2%</strong> to under <strong style={{ color: C.text }}>22%</strong> by removing friction in the current 5-step flow. Key interventions: guest checkout, wallet payment methods (Apple Pay / Google Pay), and a single-page experience with a progress indicator.
        </p>
      </Section>

      {/* Target Users */}
      <Section title="Target Users" id="users" expanded={expanded} onToggle={id => setExpanded(expanded === id ? null : id)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Guest shoppers", desc: "First-time buyers who don't want to create an account" },
            { label: "Mobile users", desc: "72% of checkout sessions start on mobile (primary surface)" },
            { label: "Returning customers", desc: "Logged-in users who want a faster, remembered checkout" },
          ].map(u => (
            <div key={u.label} style={{ display: "flex", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.purpleLight, flexShrink: 0, minWidth: 120 }}>{u.label}</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>{u.desc}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Requirements */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0 10px", marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: C.textDim }}>▼</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Requirements</span>
          <span style={{ fontSize: 11, color: C.textDim }}>({REQS.length})</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 3 }}>
            {["All", "P0", "P1", "P2"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: "3px 8px", background: filter === f ? "rgba(255,255,255,0.09)" : "transparent", border: `1px solid ${filter === f ? C.border : "transparent"}`, borderRadius: 5, color: filter === f ? C.text : C.textDim, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filteredReqs.map(req => {
            const isFlashing = flashReqId === req.id;
            const hasCite = insertedReqs.includes(req.id);
            return (
              <div key={req.id}
                style={{
                  border: `1px solid ${req.conflict ? "rgba(245,180,69,0.28)" : isFlashing ? "rgba(100,86,230,0.55)" : C.border}`,
                  borderRadius: 8, padding: "10px 13px",
                  background: isFlashing ? "rgba(100,86,230,0.1)" : req.conflict ? "rgba(245,180,69,0.04)" : C.surface,
                  display: "flex", alignItems: "center", gap: 10,
                  transition: "border-color 0.35s, background 0.35s",
                  cursor: req.conflict ? "pointer" : "default",
                }}
                onClick={req.conflict ? () => onConflictClick(req) : undefined}
                onMouseEnter={req.conflict ? e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(245,180,69,0.07)"; } : undefined}
                onMouseLeave={req.conflict ? e => { (e.currentTarget as HTMLDivElement).style.background = isFlashing ? "rgba(100,86,230,0.1)" : "rgba(245,180,69,0.04)"; } : undefined}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: C.purpleLight, width: 24, flexShrink: 0 }}>{req.id}</span>
                <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 5px", borderRadius: 3, background: `${priorityColor(req.priority)}18`, color: priorityColor(req.priority), flexShrink: 0 }}>{req.priority}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", flex: 1, lineHeight: 1.45 }}>{req.title}</span>
                {hasCite && <span style={{ fontSize: 10, padding: "2px 7px", background: C.purpleBg, color: C.purpleLight, borderRadius: 3, flexShrink: 0, border: `1px solid ${C.purpleBorder}` }}>cited</span>}
                {req.conflict && <span style={{ fontSize: 10, padding: "2px 7px", background: "rgba(245,180,69,0.14)", color: C.yellow, borderRadius: 3, flexShrink: 0, whiteSpace: "nowrap" }}>Conflict ⚠</span>}
                <span style={{ fontSize: 11, color: C.textDim, flexShrink: 0 }}>{req.effort} · {req.points}pt{req.points !== 1 ? "s" : ""}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Metrics */}
      <Section title="Success Metrics" id="metrics" expanded={expanded} onToggle={id => setExpanded(expanded === id ? null : id)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Checkout completion rate", current: "65.8%", target: "78%+" },
            { label: "Payment drop-off", current: "34.2%", target: "<22%" },
            { label: "Avg checkout time", current: "4m 20s", target: "<2 minutes" },
          ].map(m => (
            <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, color: C.textMuted, flex: 1 }}>{m.label}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", minWidth: 48 }}>{m.current}</span>
              <span style={{ fontSize: 11, color: C.textDim }}>→</span>
              <span style={{ fontSize: 12, color: C.green, minWidth: 64, textAlign: "right" }}>{m.target}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Out of Scope */}
      <Section title="Out of Scope" id="scope" expanded={expanded} onToggle={id => setExpanded(expanded === id ? null : id)}>
        {["Subscription / recurring payment support", "International or multi-currency checkout", "In-store and POS payment flows", "Checkout analytics dashboard (separate project)"].map(item => (
          <div key={item} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: C.textDim, flexShrink: 0 }}>—</span>
            <span style={{ fontSize: 12, color: C.textMuted }}>{item}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, id, expanded, onToggle, children }: {
  title: string; id: string; expanded: string | null;
  onToggle: (id: string) => void; children: React.ReactNode;
}) {
  const isOpen = expanded === id;
  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={() => onToggle(id)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "9px 0", fontFamily: "inherit", textAlign: "left" }}>
        <span style={{ fontSize: 10, color: C.textDim, display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.18s" }}>▶</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{title}</span>
      </button>
      {isOpen && (
        <div style={{ padding: "12px 15px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 3 }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TICKETS GENERATING OVERLAY
══════════════════════════════════════════════════════════ */
function TicketsGeneratingOverlay() {
  const steps = [
    "Parsing requirements and priorities...",
    "Building dependency graph...",
    "Grouping into execution waves...",
    "Estimating effort per ticket...",
    "Tickets ready ✓",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    steps.forEach((_, i) => setTimeout(() => setStep(i), i * 420 + 100));
  }, []); // eslint-disable-line

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 320 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 13, opacity: i <= step ? 1 : 0.18, transition: "opacity 0.3s" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: i < step ? C.green : i === step ? C.purple : "rgba(255,255,255,0.08)", transition: "background 0.3s", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i < step && <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              {i === step && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "white", opacity: 0.9 }} />}
            </div>
            <span style={{ fontSize: 13, color: i <= step ? "rgba(255,255,255,0.8)" : C.textDim }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TICKET CARD
══════════════════════════════════════════════════════════ */
function TicketCard({ ticket, onClick, selected }: { ticket: Ticket; onClick: () => void; selected: boolean }) {
  const req = REQS.find(r => r.id === ticket.req);
  return (
    <div onClick={onClick}
      style={{ background: selected ? "rgba(100,86,230,0.1)" : C.surface, border: `1px solid ${selected ? "rgba(100,86,230,0.4)" : C.border}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer", transition: "all 0.15s" }}
      onMouseEnter={e => { if (!selected) { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(100,86,230,0.3)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(100,86,230,0.05)"; } }}
      onMouseLeave={e => { if (!selected) { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.background = C.surface; } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.purpleLight }}>{ticket.id}</span>
        {ticket.deps.length > 0 && <span style={{ fontSize: 9, color: C.textDim }}>↳ {ticket.deps.join(", ")}</span>}
        <div style={{ flex: 1 }} />
        {req && <span style={{ fontSize: 9, padding: "2px 5px", background: `${priorityColor(req.priority)}18`, color: priorityColor(req.priority), borderRadius: 3 }}>{req.priority}</span>}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", lineHeight: 1.45, marginBottom: 7 }}>{ticket.title}</div>
      <div style={{ display: "flex", gap: 6 }}>
        <span style={{ fontSize: 10, color: C.textDim }}>{ticket.req}</span>
        <span style={{ fontSize: 10, color: C.textDim }}>·</span>
        <span style={{ fontSize: 10, color: C.textDim }}>{ticket.effort} · {ticket.pts}pt{ticket.pts !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TICKET DETAIL PANEL
══════════════════════════════════════════════════════════ */
function TicketDetail({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const req = REQS.find(r => r.id === ticket.req);

  const agentPrompt = `# ${ticket.id}: ${ticket.title}

## Context
PRD: Checkout Redesign · Requirement ${ticket.req}
${req ? `Requirement: "${req.title}"` : ""}

## Task
${ticket.description}

## Acceptance Criteria
${ticket.criteria.map(c => `- [ ] ${c}`).join("\n")}

## Technical Notes
- Reference existing checkout flow in \`/src/pages/checkout/\`
- Stripe integration lives in \`/src/lib/stripe.ts\`
${ticket.deps.length > 0 ? `- Depends on: ${ticket.deps.join(", ")} (must be complete first)` : "- No external dependencies"}

## Output Expected
Working implementation with unit tests. Update TypeScript types as needed. Do not change unrelated files.`;

  function handleCopy() {
    navigator.clipboard.writeText(agentPrompt).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ width: 360, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100%", flexShrink: 0, overflowY: "auto" }}>
      <div style={{ padding: "13px 15px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.purpleLight }}>{ticket.id}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 2px" }}>×</button>
      </div>

      <div style={{ padding: "16px 16px", flex: 1 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.45, marginBottom: 13 }}>{ticket.title}</h3>

        <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
          {req && <span style={{ fontSize: 10, padding: "3px 7px", background: `${priorityColor(req.priority)}18`, color: priorityColor(req.priority), borderRadius: 4 }}>{req.priority}</span>}
          <span style={{ fontSize: 10, padding: "3px 7px", background: "rgba(255,255,255,0.06)", color: C.textMuted, borderRadius: 4 }}>{ticket.effort} effort</span>
          <span style={{ fontSize: 10, padding: "3px 7px", background: "rgba(255,255,255,0.06)", color: C.textMuted, borderRadius: 4 }}>{ticket.pts} point{ticket.pts !== 1 ? "s" : ""}</span>
          <span style={{ fontSize: 10, padding: "3px 7px", background: C.purpleBg, color: C.purpleLight, borderRadius: 4, border: `1px solid ${C.purpleBorder}` }}>{ticket.req}</span>
        </div>

        <Label>Description</Label>
        <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7, marginBottom: 16 }}>{ticket.description}</p>

        <Label>Acceptance Criteria</Label>
        <div style={{ marginBottom: 16 }}>
          {ticket.criteria.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: C.textDim, flexShrink: 0, marginTop: 1 }}>□</span>
              <span style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.55 }}>{c}</span>
            </div>
          ))}
        </div>

        {ticket.deps.length > 0 && (
          <>
            <Label>Depends on</Label>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {ticket.deps.map(d => (
                <span key={d} style={{ fontSize: 11, padding: "3px 9px", background: C.purpleBg, color: C.purpleLight, borderRadius: 4, border: `1px solid ${C.purpleBorder}` }}>{d}</span>
              ))}
            </div>
          </>
        )}

        {/* Agent Prompt */}
        <div style={{ background: "rgba(100,86,230,0.07)", border: `1px solid ${C.purpleBorder}`, borderRadius: 10, padding: "13px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.purpleLight }}>Agent Prompt</span>
              <span style={{ fontSize: 11, color: C.textDim, marginLeft: 8 }}>Paste into Cursor or Claude Code</span>
            </div>
            <button onClick={handleCopy} style={{ fontSize: 11, padding: "4px 10px", background: copied ? "rgba(62,207,142,0.15)" : C.purpleBg, border: `1px solid ${copied ? "rgba(62,207,142,0.3)" : C.purpleBorder}`, borderRadius: 6, color: copied ? "rgba(62,207,142,0.9)" : C.purpleLight, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {copied ? "✓ Copied!" : "Copy →"}
            </button>
          </div>
          <div style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${C.border}`, borderRadius: 7, padding: "11px 13px", fontSize: 11, color: "rgba(255,255,255,0.42)", fontFamily: "monospace", lineHeight: 1.75, whiteSpace: "pre-wrap", maxHeight: 240, overflowY: "auto" }}>
            {agentPrompt}
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6 }}>{children}</div>;
}

/* ══════════════════════════════════════════════════════════
   TICKETS BOARD
══════════════════════════════════════════════════════════ */
function TicketsBoard({ onTicketClick, selectedId }: { onTicketClick: (t: Ticket) => void; selectedId: string | null }) {
  return (
    <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", padding: "20px 22px", display: "flex", gap: 16, alignItems: "flex-start", height: "100%" }}>
      {WAVES.map(wave => (
        <div key={wave.n} style={{ minWidth: 264, width: 264, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>{wave.label}</span>
            <span style={{ fontSize: 10, background: "rgba(255,255,255,0.06)", color: C.textDim, borderRadius: 10, padding: "1px 7px" }}>{wave.tickets.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {wave.tickets.map(t => (
              <TicketCard key={t.id} ticket={t} onClick={() => onTicketClick(t)} selected={selectedId === t.id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RESEARCH VIEW (full-width query panel)
══════════════════════════════════════════════════════════ */
function ResearchView({ messages, onSend, loading, onInsert }: {
  messages: Message[];
  onSend: (q: string) => void;
  loading: boolean;
  onInsert: (reqId: string) => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  }

  const suggestions = [
    "Are any of my requirements conflicting?",
    "What do competitors do for checkout UX?",
    "What am I missing in this PRD?",
    "What's the ROI of adding Apple Pay?",
    "Compare my checkout to Shopify's",
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "15px 26px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>Research</span>
        <span style={{ fontSize: 12, color: C.textDim }}>AI searches the web + your product context simultaneously</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, background: C.purpleBg, color: C.purpleLight, border: `1px solid ${C.purpleBorder}`, padding: "3px 9px", borderRadius: 10 }}>
          {messages.filter(m => m.role === "ai").length} queries
        </span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "22px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 48, textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18 }}>🔍</div>
            <p style={{ fontSize: 15, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>Research your PRD with AI</p>
            <p style={{ fontSize: 13, color: C.textDim, marginBottom: 28, maxWidth: 360, lineHeight: 1.6 }}>Every answer is grounded in your product context and the latest web sources. Citations included.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 560 }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => onSend(s)} style={{ fontSize: 12, padding: "7px 13px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, color: C.textMuted, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.purpleBorder; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.textMuted; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: m.role === "user" ? 420 : 660, fontSize: 13, lineHeight: 1.72, padding: "11px 15px",
              borderRadius: m.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
              background: m.role === "user" ? "rgba(100,86,230,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${m.role === "user" ? "rgba(100,86,230,0.3)" : C.border}`,
              color: m.role === "user" ? "rgba(200,190,255,0.9)" : "rgba(255,255,255,0.65)",
            }}>
              <div dangerouslySetInnerHTML={{
                __html: m.text
                  .replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(255,255,255,0.9)">$1</strong>')
                  .replace(/\n\n/g, "<br/><br/>")
                  .replace(/\n(\d+\.)/g, "<br/>$1")
              }} />
              {m.cites && m.cites.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  {m.cites.map(c => (
                    <span key={c.n} style={{ fontSize: 11, background: C.purpleBg, color: "rgba(170,160,255,0.85)", borderRadius: 4, padding: "3px 8px", border: `1px solid ${C.purpleBorder}` }}>
                      [{c.n}] {c.label}
                    </span>
                  ))}
                </div>
              )}
              {m.insertReq && (
                <button onClick={() => onInsert(m.insertReq!)} style={{ marginTop: 9, fontSize: 12, color: C.purpleLight, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, display: "block" }}>
                  Insert into PRD →
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "12px 15px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "10px 10px 10px 2px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.purpleLight, animation: `vpulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "14px 26px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about your PRD — market research, gap analysis, conflict detection..."
            style={{ flex: 1, padding: "11px 16px", fontSize: 13, color: C.text, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: "inherit" }}
            onFocus={e => e.currentTarget.style.borderColor = "rgba(100,86,230,0.45)"}
            onBlur={e => e.currentTarget.style.borderColor = C.border}
          />
          <button type="submit" disabled={loading} style={{ padding: "11px 22px", background: C.purple, border: "none", borderRadius: 10, color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 500, opacity: loading ? 0.5 : 1 }}>
            Ask →
          </button>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════ */
function Sidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (t: string) => void }) {
  return (
    <div style={{ width: 196, borderRight: `1px solid ${C.border}`, padding: "13px 10px 16px", display: "flex", flexDirection: "column", gap: 3, flexShrink: 0, overflowY: "auto" }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 8px 2px", marginBottom: 18 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: C.purple, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.5 9H10.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text, letterSpacing: "-0.2px" }}>Vantage</span>
        </a>
      </div>

      <SideLabel>Projects</SideLabel>
      {[
        { name: "Checkout redesign", active: true },
        { name: "Onboarding v2", active: false },
        { name: "Mobile notifications", active: false },
      ].map(p => (
        <div key={p.name} style={{ fontSize: 12, padding: "6px 9px", borderRadius: 6, color: p.active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.3)", background: p.active ? C.purpleBg : "transparent", cursor: "pointer", lineHeight: 1.4 }}>
          {p.name}
        </div>
      ))}

      <div style={{ borderTop: `1px solid ${C.border}`, margin: "10px 0 6px" }} />
      <SideLabel>Views</SideLabel>

      {[
        { key: "prd", label: "PRD" },
        { key: "tickets", label: "Tickets" },
        { key: "research", label: "Research" },
      ].map(v => (
        <div key={v.key} onClick={() => onTabChange(v.key)}
          style={{ fontSize: 12, padding: "6px 9px", borderRadius: 6, color: activeTab === v.key ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)", background: activeTab === v.key ? C.purpleBg : "transparent", cursor: "pointer", fontWeight: activeTab === v.key ? 500 : 400 }}>
          {v.label}
        </div>
      ))}

      <div style={{ flex: 1 }} />
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 13, marginTop: 8 }}>
        <SideLabel>Context</SideLabel>
        {["stripe.com", "figma/checkout-v3", "amplitude.com"].map(s => (
          <div key={s} style={{ fontSize: 11, padding: "3px 8px", color: "rgba(255,255,255,0.3)", display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, padding: "0 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: C.textDim }}>Coverage</span>
            <span style={{ fontSize: 10, color: "rgba(62,207,142,0.75)" }}>87%</span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
            <div style={{ height: "100%", width: "87%", background: `linear-gradient(90deg, ${C.green}, rgba(62,207,142,0.45))`, borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SideLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.09em", padding: "0 8px", marginBottom: 5, marginTop: 2 }}>{children}</p>;
}

/* ══════════════════════════════════════════════════════════
   MAIN WORKSPACE
══════════════════════════════════════════════════════════ */
function WorkspaceContent() {
  const searchParams = useSearchParams();
  const idea = searchParams.get("idea") || "Redesign the checkout flow to reduce payment drop-off";

  const [phase, setPhase] = useState<"generating" | "workspace">("generating");
  const [activeTab, setActiveTab] = useState("prd");
  const [ticketsState, setTicketsState] = useState<"idle" | "generating" | "done">("idle");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [conflictReq, setConflictReq] = useState<Req | null>(null);
  const [insertedReqs, setInsertedReqs] = useState<string[]>([]);
  const [flashReqId, setFlashReqId] = useState<string | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", text: "What do top checkout flows do to reduce abandonment?" },
    {
      role: "ai",
      text: "Baymard Institute's 2024 study found **69.8% average cart abandonment rate** across e-commerce. The single biggest driver: **forced account creation** causes 24% of users to abandon at that step alone.\n\nCheckouts with ≤3 steps outperform 5+ step flows by **3×**. Adding guest checkout increases completion by 23–35%. Shopify, Stripe, and BigCommerce all default to one-page or 3-step flows.",
      cites: [{ n: 1, label: "Baymard Institute 2024" }, { n: 2, label: "Stripe Checkout Study 2023" }],
      insertReq: "R1",
    },
  ]);

  function handleQuery(q: string) {
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setQueryLoading(true);
    setTimeout(() => {
      const r = getQueryResponse(q);
      setMessages(prev => [...prev, { role: "ai", text: r.text, cites: r.cites, insertReq: r.insertReq }]);
      setQueryLoading(false);
    }, 1700);
  }

  function handleInsert(reqId: string) {
    setInsertedReqs(prev => prev.includes(reqId) ? prev : [...prev, reqId]);
    setActiveTab("prd");
    setTimeout(() => {
      setFlashReqId(reqId);
      setTimeout(() => setFlashReqId(null), 2200);
    }, 80);
  }

  function handleGenerateTickets() {
    setTicketsState("generating");
    setActiveTab("tickets");
    setTimeout(() => setTicketsState("done"), 2400);
  }

  if (phase === "generating") {
    return <GeneratingScreen idea={idea} onDone={() => setPhase("workspace")} />;
  }

  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ height: 47, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", paddingLeft: 18, paddingRight: 18, gap: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: C.textDim }}>Projects</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>/</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>Checkout redesign</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 2 }}>
          {[{ k: "prd", l: "PRD" }, { k: "tickets", l: "Tickets" }, { k: "research", l: "Research" }].map(t => (
            <button key={t.k} onClick={() => setActiveTab(t.k)}
              style={{ fontSize: 12, padding: "5px 13px", borderRadius: 7, background: activeTab === t.k ? C.purpleBg : "transparent", border: `1px solid ${activeTab === t.k ? C.purpleBorder : "transparent"}`, color: activeTab === t.k ? C.purpleLight : C.textDim, cursor: "pointer", fontFamily: "inherit", fontWeight: activeTab === t.k ? 500 : 400, transition: "all 0.15s" }}>
              {t.l}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(100,86,230,0.25)", border: `1px solid ${C.purpleBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.purpleLight, fontWeight: 600 }}>
          AK
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {activeTab === "prd" && (
            <>
              <PRDEditor
                insertedReqs={insertedReqs}
                flashReqId={flashReqId}
                onConflictClick={setConflictReq}
                onGenerateTickets={handleGenerateTickets}
                ticketsState={ticketsState}
              />
              <QueryPanel messages={messages} onSend={handleQuery} loading={queryLoading} onInsert={handleInsert} />
            </>
          )}

          {activeTab === "tickets" && (
            <>
              {ticketsState === "generating" && <TicketsGeneratingOverlay />}
              {ticketsState === "idle" && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 8 }}>No tickets generated yet</p>
                  <p style={{ fontSize: 12, color: C.textDim, marginBottom: 22 }}>Go to the PRD tab and click "Generate Tickets"</p>
                  <button onClick={() => setActiveTab("prd")} style={{ fontSize: 13, padding: "8px 18px", background: C.purple, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>Go to PRD →</button>
                </div>
              )}
              {ticketsState === "done" && (
                <>
                  <TicketsBoard onTicketClick={t => setSelectedTicket(prev => prev?.id === t.id ? null : t)} selectedId={selectedTicket?.id ?? null} />
                  {selectedTicket && <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
                </>
              )}
            </>
          )}

          {activeTab === "research" && (
            <ResearchView messages={messages} onSend={handleQuery} loading={queryLoading} onInsert={handleInsert} />
          )}
        </div>
      </div>

      {conflictReq && <ConflictModal req={conflictReq} onClose={() => setConflictReq(null)} />}

      <style>{`
        @keyframes vpulse {
          0%, 100% { transform: scale(0.7); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        input:focus { outline: none; }
        button:focus { outline: none; }
      `}</style>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div style={{ height: "100vh", background: "#080808" }} />}>
      <WorkspaceContent />
    </Suspense>
  );
}
