"use client";

import { useState, useEffect, useRef, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const C = {
  bg: "#fafafa", surface: "rgba(0,0,0,0.02)", border: "rgba(0,0,0,0.08)",
  text: "#0f0f0f", textMuted: "rgba(0,0,0,0.55)", textDim: "rgba(0,0,0,0.35)",
  purple: "#5746E8", purpleHover: "#4336D4", purpleLight: "#5746E8",
  purpleBg: "rgba(87,70,232,0.07)", purpleBorder: "rgba(87,70,232,0.2)",
  red: "#dc2626", yellow: "#b45309", green: "#059669", orange: "#ea580c",
};

type Req = { id: string; title: string; priority: "P0"|"P1"|"P2"; effort: string; points: number; conflict: boolean; conflictNote?: string };
type Ticket = { id: string; title: string; req: string; effort: string; pts: number; deps: string[]; description: string; criteria: string[] };
type Wave = { n: number; label: string; tickets: Ticket[] };
type Message = { role: "user"|"ai"; text: string; cites?: { n: number; label: string }[]; insertReq?: string | null };

const REQS: Req[] = [
  { id:"R1", title:"Guest checkout must not require account creation", priority:"P0", effort:"M", points:3, conflict:false },
  { id:"R2", title:"Support Apple Pay and Google Pay at checkout", priority:"P0", effort:"L", points:5, conflict:false },
  { id:"R3", title:"Display trust badges and security copy at payment step", priority:"P1", effort:"S", points:1, conflict:false },
  { id:"R4", title:"Autofill shipping from saved addresses", priority:"P0", effort:"M", points:3, conflict:true, conflictNote:"Conflicts with R1: guest users have no saved addresses. Resolution: scope R4 to authenticated users only." },
  { id:"R5", title:"Show estimated delivery date before confirming order", priority:"P1", effort:"M", points:3, conflict:false },
  { id:"R6", title:"One-page checkout with progress indicator", priority:"P1", effort:"L", points:5, conflict:false },
  { id:"R7", title:"Send abandoned cart email 30 min after drop-off", priority:"P2", effort:"M", points:3, conflict:false },
  { id:"R8", title:"A/B test CTA variants: 'Pay now' vs 'Complete order'", priority:"P2", effort:"S", points:1, conflict:false },
];

const WAVES: Wave[] = [
  { n:1, label:"Wave 1 · Foundation", tickets:[
    { id:"VAN-001", title:"Implement guest checkout bypass", req:"R1", effort:"M", pts:3, deps:[], description:"Remove mandatory account creation. Add 'Continue as Guest' path through auth middleware.", criteria:["Guest users complete checkout without account","Logged-in flow unchanged","Session persists 30 days in cookie"] },
    { id:"VAN-002", title:"Build CheckoutProgress component", req:"R6", effort:"S", pts:2, deps:[], description:"Reusable progress indicator: Cart → Shipping → Payment → Confirmation.", criteria:["Current step highlighted","Completed steps clickable","Mobile responsive"] },
  ]},
  { n:2, label:"Wave 2 · Payment", tickets:[
    { id:"VAN-003", title:"Integrate Apple Pay via Stripe", req:"R2", effort:"L", pts:5, deps:["VAN-001"], description:"Add Apple Pay via Stripe Payment Request API above card form.", criteria:["Visible on Safari/iOS","Graceful fallback on unsupported browsers","Passes Stripe test suite"] },
    { id:"VAN-004", title:"Integrate Google Pay via Stripe", req:"R2", effort:"L", pts:5, deps:["VAN-001"], description:"Add Google Pay using same Stripe Payment Request handler.", criteria:["Visible on Chrome/Android","Shares handler with VAN-003","Passes Stripe test suite"] },
    { id:"VAN-005", title:"Add trust badges at payment step", req:"R3", effort:"S", pts:1, deps:["VAN-002"], description:"SSL, PCI DSS, money-back guarantee badges above the payment form.", criteria:["Badges visible on payment step","Alt text on all images","Lighthouse a11y ≥ 95"] },
  ]},
  { n:3, label:"Wave 3 · Conversion", tickets:[
    { id:"VAN-006", title:"Autofill shipping for logged-in users", req:"R4", effort:"M", pts:3, deps:["VAN-001"], description:"Pre-populate shipping from address book for authenticated users only. Resolves R4 conflict with R1.", criteria:["Only for logged-in users","Can edit or select from address book","Guest path unaffected"] },
    { id:"VAN-007", title:"Delivery date estimate in order summary", req:"R5", effort:"M", pts:3, deps:["VAN-002"], description:"Integrate ShippingEstimator API to show delivery range before payment.", criteria:["Date range shown in order summary","Updates when shipping method changes","Shows 'Estimated' label"] },
    { id:"VAN-008", title:"Abandoned cart email trigger", req:"R7", effort:"M", pts:3, deps:[], description:"Fire event to email service when cart abandoned (no purchase within 30 min).", criteria:["Email sent ≤35 min after abandonment","Not sent if purchase completes","Unsubscribe link per CAN-SPAM"] },
    { id:"VAN-009", title:"A/B test: checkout CTA copy", req:"R8", effort:"S", pts:1, deps:["VAN-002"], description:"Feature-flag 50/50 A/B test: 'Pay now' vs 'Complete order' on final CTA.", criteria:["50/50 split","Tracked in Amplitude","Rollback via flag in <5 min"] },
  ]},
];

function getQueryResponse(q: string) {
  const l = q.toLowerCase();
  if (/abandon|drop.?off|conversion|complet/.test(l)) return { text:"Baymard 2024 found **69.8% average cart abandonment**. Top driver: forced account creation causes **24% of users to abandon** at that step alone.\n\nCheckouts with ≤3 steps outperform 5+ step flows by **3×**. Adding guest checkout increases completion by 23–35%.", cites:[{n:1,label:"Baymard Institute 2024"},{n:2,label:"Stripe Checkout Study 2023"}], insertReq:"R1" };
  if (/apple.?pay|google.?pay|wallet|payment method/.test(l)) return { text:"Apple Pay and Google Pay show **15–20% higher conversion** vs manual card entry on mobile:\n\n- Apple Pay: 63% of iPhone users have it set up\n- Google Pay: 42% of Android users\n- Avg checkout: **8 seconds** vs 3 minutes for manual entry\n\nStripe's Payment Request API handles both with one integration.", cites:[{n:1,label:"Worldpay 2024"},{n:2,label:"Google I/O 2024"}], insertReq:"R2" };
  if (/conflict|r4|autofill|address|guest/.test(l)) return { text:"**R4 conflicts with R1.** Guest users (R1) have no saved addresses to autofill (R4).\n\n**Resolution:** Apply R4 conditionally — authenticated users only. Guest path gets browser autocomplete. Amazon uses this exact pattern.", cites:[{n:1,label:"PRD Analysis · Internal"}], insertReq:"R4" };
  if (/miss|gap|what else|overlook/.test(l)) return { text:"3 gaps found after analyzing your 8 requirements:\n\n1. **Error recovery** — No req for payment failure messaging. 13% abandon due to confusing errors.\n2. **Order confirmation email** — Not mentioned, critical for perceived completion.\n3. **Mobile keyboard optimization** — `inputMode=\"numeric\"` for card fields.", cites:[{n:1,label:"Baymard UX Research 2024"}], insertReq:null };
  if (/shopify|competitor|compare|amazon/.test(l)) return { text:"Top checkout flows (Shopify, Stripe, Amazon) share 4 patterns:\n\n1. **Guest first** — default to guest, offer account post-purchase\n2. **Progress indicator** — even single-page flows show step status\n3. **Express wallets** — Apple/Google Pay above card form\n4. **Real-time validation** — inline field errors, not submit-time\n\nYour PRD covers 1–3. Pattern 4 not yet specified.", cites:[{n:1,label:"Checkout Benchmark 2024"},{n:2,label:"Baymard UX Study"}], insertReq:null };
  return { text:"Based on your PRD context, R1 (guest checkout) and R2 (Apple/Google Pay) address the two highest-impact drop-off points. 72% of checkout sessions start on mobile — R6 (progress indicator) is critical at mobile viewport widths.", cites:[{n:1,label:"Checkout UX Report 2024"},{n:2,label:"Mobile Commerce Index 2024"}], insertReq:null };
}

function pc(p: string) { return p==="P0" ? C.red : p==="P1" ? C.yellow : C.textDim; }

/* ══ GENERATING SCREEN ══ */
function GeneratingScreen({ idea, onDone }: { idea: string; onDone: () => void }) {
  const steps = ["Analyzing your idea...","Researching industry benchmarks...","Identifying target users...","Structuring requirements with priority + effort...","PRD ready ✓"];
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => t.push(setTimeout(() => { setStep(i); setProgress(Math.round(((i+1)/steps.length)*100)); }, i*480+150)));
    t.push(setTimeout(onDone, steps.length*480+500));
    return () => t.forEach(clearTimeout);
  }, []); // eslint-disable-line
  return (
    <div style={{height:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:48}}>
        <VLogo size={32}/><span style={{fontSize:18,fontWeight:600,color:C.text,letterSpacing:"-0.3px"}}>Vantage</span>
      </div>
      <div style={{background:C.purpleBg,border:`1px solid ${C.purpleBorder}`,color:"#5746E8",fontSize:13,padding:"7px 18px",borderRadius:20,marginBottom:44,maxWidth:480,textAlign:"center",lineHeight:1.5,fontStyle:"italic"}}>"{idea}"</div>
      <div style={{width:340,marginBottom:32}}>
        {steps.map((s,i)=>(
          <div key={s} style={{display:"flex",alignItems:"center",gap:12,marginBottom:13,opacity:i<=step?1:0.18,transition:"opacity 0.35s"}}>
            <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:i<step?C.green:i===step?C.purple:"rgba(0,0,0,0.08)",border:`1px solid ${i<step?C.green:i===step?C.purple:"rgba(0,0,0,0.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.3s"}}>
              {i<step&&<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {i===step&&<div style={{width:6,height:6,borderRadius:"50%",background:"white"}}/>}
            </div>
            <span style={{fontSize:14,color:i<=step?"rgba(0,0,0,0.85)":C.textDim}}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{width:340,height:3,background:"rgba(0,0,0,0.07)",borderRadius:2}}>
        <div style={{height:"100%",background:`linear-gradient(90deg,${C.purple},${C.purpleLight})`,borderRadius:2,width:`${progress}%`,transition:"width 0.45s ease"}}/>
      </div>
    </div>
  );
}

/* ══ QUERY PANEL ══ */
function QueryPanel({ messages, onSend, loading, onInsert }: { messages: Message[]; onSend:(q:string)=>void; loading:boolean; onInsert:(r:string)=>void }) {
  const [input, setInput] = useState("");
  const [panelWidth, setPanelWidth] = useState(296);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);
  useEffect(() => { if(scrollRef.current) scrollRef.current.scrollTop=scrollRef.current.scrollHeight; }, [messages, loading]);
  function handleSubmit(e: FormEvent) { e.preventDefault(); if(!input.trim()||loading) return; onSend(input.trim()); setInput(""); }
  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startW: panelWidth };
    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - ev.clientX;
      setPanelWidth(Math.max(220, Math.min(520, dragRef.current.startW + delta)));
    }
    function onUp() { dragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
  return (
    <div style={{width:panelWidth,display:"flex",flexDirection:"column",flexShrink:0,height:"100%",overflow:"hidden",position:"relative"}}>
      {/* Drag handle — straddles the left border for easy grabbing */}
      <div
        onMouseDown={onMouseDown}
        style={{position:"absolute",left:-5,top:0,bottom:0,width:10,cursor:"col-resize",zIndex:10,display:"flex",alignItems:"center",justifyContent:"center"}}
        onMouseEnter={e=>{(e.currentTarget.firstChild as HTMLElement).style.background="rgba(87,70,232,0.5)";(e.currentTarget.firstChild as HTMLElement).style.opacity="1";}}
        onMouseLeave={e=>{(e.currentTarget.firstChild as HTMLElement).style.background=C.border;(e.currentTarget.firstChild as HTMLElement).style.opacity="1";}}
      >
        <div style={{width:1,height:"100%",background:C.border,transition:"background 0.15s"}}/>
      </div>
      <div style={{padding:"13px 15px 11px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <span style={{fontSize:13,fontWeight:500,color:"rgba(0,0,0,0.65)"}}>Research</span>
        <span style={{fontSize:10,background:C.purpleBg,color:C.purpleLight,border:`1px solid ${C.purpleBorder}`,padding:"2px 7px",borderRadius:10}}>{messages.filter(m=>m.role==="ai").length} queries</span>
      </div>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"13px",display:"flex",flexDirection:"column",gap:9}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"88%",fontSize:12,lineHeight:1.65,padding:"8px 10px",borderRadius:m.role==="user"?"8px 8px 2px 8px":"8px 8px 8px 2px",background:m.role==="user"?"rgba(87,70,232,0.15)":"rgba(0,0,0,0.04)",border:`1px solid ${m.role==="user"?"rgba(87,70,232,0.25)":C.border}`,color:m.role==="user"?"#5746E8":"rgba(0,0,0,0.6)"}}>
              <div dangerouslySetInnerHTML={{__html:m.text.replace(/\*\*(.*?)\*\*/g,'<strong style="color:rgba(0,0,0,0.85)">$1</strong>').replace(/\n\n/g,"<br/><br/>").replace(/\n(\d+\.)/g,"<br/>$1")}}/>
              {m.cites&&m.cites.length>0&&<div style={{display:"flex",gap:4,marginTop:7,flexWrap:"wrap"}}>{m.cites.map(c=><span key={c.n} style={{fontSize:10,background:C.purpleBg,color:"#5746E8",borderRadius:3,padding:"2px 6px"}}>[{c.n}] {c.label}</span>)}</div>}
              {m.insertReq&&<button onClick={()=>onInsert(m.insertReq!)} style={{marginTop:7,fontSize:11,color:C.purpleLight,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0,display:"block"}}>Insert into PRD →</button>}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex"}}><div style={{padding:"10px 12px",background:"rgba(0,0,0,0.04)",border:`1px solid ${C.border}`,borderRadius:"8px 8px 8px 2px",display:"flex",gap:5,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:C.purpleLight,animation:`vpulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div></div>}
      </div>
      <div style={{padding:"10px 11px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
        <form onSubmit={handleSubmit} style={{display:"flex",gap:6}}>
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask anything..." style={{flex:1,padding:"7px 10px",fontSize:12,color:C.text,background:"rgba(0,0,0,0.05)",border:`1px solid ${C.border}`,borderRadius:7,fontFamily:"inherit"}} onFocus={e=>e.currentTarget.style.borderColor="rgba(100,86,230,0.45)"} onBlur={e=>e.currentTarget.style.borderColor=C.border}/>
          <button type="submit" disabled={loading} style={{padding:"7px 13px",background:C.purple,border:"none",borderRadius:7,color:"#fff",cursor:loading?"not-allowed":"pointer",fontSize:12,fontFamily:"inherit",opacity:loading?0.5:1}}>→</button>
        </form>
      </div>
    </div>
  );
}

/* ══ CONFLICT MODAL ══ */
function ConflictModal({ req, onClose }: { req: Req; onClose: () => void }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:"#ffffff",border:"1px solid rgba(180,83,9,0.2)",borderRadius:14,padding:26,maxWidth:460,width:"90%",fontFamily:"Inter,sans-serif",boxShadow:"0 8px 40px rgba(0,0,0,0.12)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
          <span style={{fontSize:16}}>⚠</span><span style={{fontSize:14,fontWeight:600,color:C.yellow}}>Requirement conflict</span>
          <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
        </div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",marginBottom:16}}>
          <span style={{fontSize:11,fontWeight:700,color:C.purpleLight,display:"block",marginBottom:4}}>{req.id}</span>
          <span style={{fontSize:13,color:"rgba(0,0,0,0.75)",lineHeight:1.5}}>{req.title}</span>
        </div>
        <div style={{background:"rgba(180,83,9,0.05)",border:"1px solid rgba(180,83,9,0.15)",borderRadius:8,padding:"12px 14px",marginBottom:18}}>
          <p style={{fontSize:12,color:"#b45309",lineHeight:1.65}}>{req.conflictNote}</p>
        </div>
        <p style={{fontSize:11,fontWeight:600,color:C.textDim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Suggested resolution</p>
        <p style={{fontSize:12,color:C.textMuted,lineHeight:1.65,marginBottom:20}}>Scope {req.id} to apply only for authenticated users. Guest users see a clean shipping form with browser autocomplete. See <strong style={{color:C.purpleLight}}>VAN-006</strong> for implementation details.</p>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"9px",background:C.purple,border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:500}}>Apply resolution</button>
          <button onClick={onClose} style={{padding:"9px 15px",background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,color:C.textMuted,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}

/* ══ EXPORT MODAL ══ */
function ExportModal({ onClose, ticketCount }: { onClose: () => void; ticketCount: number }) {
  const [linearState, setLinearState] = useState<"idle"|"connecting"|"done">("idle");
  const [mdCopied, setMdCopied] = useState(false);

  function handleLinear() {
    setLinearState("connecting");
    setTimeout(() => setLinearState("done"), 2200);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:16,padding:28,maxWidth:500,width:"92%",fontFamily:"Inter,sans-serif",boxShadow:"0 8px 40px rgba(0,0,0,0.12)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:16,fontWeight:600,color:C.text}}>Export Tickets</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
        </div>
        <p style={{fontSize:13,color:C.textDim,marginBottom:22}}>{ticketCount} agent-ready tickets · dependency waves included</p>

        {/* Linear */}
        <div style={{background:C.surface,border:`1px solid ${linearState==="done"?"rgba(62,207,142,0.3)":C.border}`,borderRadius:12,padding:"16px 18px",marginBottom:12,transition:"border-color 0.3s"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:28,height:28,borderRadius:6,background:"#5E6AD2",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12L12 21L3 12Z" fill="white" opacity="0.9"/></svg>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>Linear</div>
                <div style={{fontSize:11,color:C.textDim}}>Push to your Linear board · one-way sync</div>
              </div>
            </div>
            {linearState==="idle"&&<button onClick={handleLinear} style={{fontSize:12,padding:"6px 14px",background:C.purple,border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Push to Linear →</button>}
            {linearState==="connecting"&&<div style={{display:"flex",gap:4,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:C.purpleLight,animation:`vpulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>}
            {linearState==="done"&&<span style={{fontSize:12,color:C.green,fontWeight:500}}>✓ {ticketCount} tickets pushed</span>}
          </div>
          {linearState==="done"&&(
            <div style={{background:"rgba(62,207,142,0.06)",border:"1px solid rgba(62,207,142,0.15)",borderRadius:8,padding:"10px 13px",marginTop:4}}>
              <p style={{fontSize:12,color:"rgba(62,207,142,0.85)",lineHeight:1.6}}>Tickets are now in your Linear board. Your engineers never leave Linear — Vantage generated, Linear executes.</p>
            </div>
          )}
        </div>

        {/* Markdown */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 18px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:28,height:28,borderRadius:6,background:"rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>MD</div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>Copy as Markdown</div>
                <div style={{fontSize:11,color:C.textDim}}>All tickets with requirements + acceptance criteria</div>
              </div>
            </div>
            <button onClick={()=>{setMdCopied(true);setTimeout(()=>setMdCopied(false),2000);}} style={{fontSize:12,padding:"6px 14px",background:mdCopied?"rgba(62,207,142,0.15)":"rgba(0,0,0,0.07)",border:`1px solid ${mdCopied?"rgba(62,207,142,0.3)":C.border}`,borderRadius:7,color:mdCopied?C.green:C.textMuted,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>{mdCopied?"✓ Copied!":"Copy →"}</button>
          </div>
        </div>

        {/* Jira (V1) */}
        <div style={{background:"rgba(0,0,0,0.02)",border:`1px dashed ${C.border}`,borderRadius:12,padding:"14px 18px",marginBottom:22,opacity:0.6}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,borderRadius:6,background:"rgba(0,101,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#4C9AFF",fontWeight:700}}>J</div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:C.textMuted}}>Jira <span style={{fontSize:10,background:"rgba(139,127,245,0.15)",color:C.purpleLight,borderRadius:4,padding:"2px 6px",marginLeft:6}}>V1</span></div>
              <div style={{fontSize:11,color:C.textDim}}>Two-way sync — coming in V1</div>
            </div>
          </div>
        </div>

        {/* Pitch */}
        <div style={{background:"rgba(87,70,232,0.06)",border:`1px solid ${C.purpleBorder}`,borderRadius:10,padding:"13px 16px"}}>
          <p style={{fontSize:12,color:C.textMuted,lineHeight:1.65,textAlign:"center"}}>
            <strong style={{color:C.purple}}>Vantage = the brain. Linear/Cursor = the hands.</strong><br/>
            Your engineers never leave their tools. Vantage generates, they execute.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══ PRD EDITOR ══ */
/* ══ PRD DOCUMENT VIEW ══ */
function PRDDocumentView({ insertedReqs, flashReqId, onConflictClick }: { insertedReqs:string[]; flashReqId:string|null; onConflictClick:(r:Req)=>void }) {
  const H2 = ({ children }: { children: React.ReactNode }) => (
    <h2 style={{fontSize:16,fontWeight:600,color:C.text,letterSpacing:"-0.2px",marginBottom:10,marginTop:32,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>{children}</h2>
  );
  const P = ({ children }: { children: React.ReactNode }) => (
    <p style={{fontSize:14,color:C.textMuted,lineHeight:1.8,marginBottom:12}}>{children}</p>
  );
  return (
    <div style={{maxWidth:680,margin:"0 auto",padding:"8px 0 48px"}}>
      {/* Doc metadata */}
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:28,paddingBottom:20,borderBottom:`1px solid ${C.border}`}}>
        {[{l:"Status",v:"Draft",c:C.yellow},{l:"Owner",v:"AK",c:C.textMuted},{l:"Last updated",v:"2 hours ago",c:C.textDim},{l:"Version",v:"v4",c:C.textDim}].map(m=>(
          <div key={m.l}>
            <div style={{fontSize:10,color:C.textDim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{m.l}</div>
            <div style={{fontSize:13,color:m.c,fontWeight:500}}>{m.v}</div>
          </div>
        ))}
      </div>

      <H2>Overview</H2>
      <P>The checkout flow at Acme Commerce currently has a <strong style={{color:C.text}}>34.2% payment drop-off rate</strong>, significantly above the industry average of 24.9% (Baymard, 2024). Analysis of session recordings and funnel data identifies three primary causes: (1) mandatory account creation before purchase, (2) lack of express payment options on mobile, and (3) a 5-step checkout process that exceeds the 3-step threshold where abandonment accelerates sharply.</P>
      <P>This PRD defines the scope, requirements, and success criteria for a checkout redesign that addresses all three causes. The target outcome is reducing payment drop-off to under <strong style={{color:C.text}}>22%</strong> — a 12.2 percentage-point improvement — while maintaining or improving average order value.</P>

      <H2>Problem Statement</H2>
      <P>Product managers and engineers have patched the checkout flow incrementally over 3 years, resulting in a fragmented experience that doesn't reflect current user expectations. The current flow requires users to: (1) create an account, (2) verify their email, (3) fill in shipping, (4) fill in billing separately, and (5) confirm. Steps 1–2 alone cause 24% of drop-offs (Baymard, 2024). No express payment options exist despite 72% of checkout sessions starting on mobile.</P>
      <div style={{background:"rgba(245,180,69,0.06)",border:"1px solid rgba(180,83,9,0.1)",borderRadius:8,padding:"12px 16px",marginBottom:16}}>
        <p style={{fontSize:13,color:"rgba(245,180,69,0.85)",lineHeight:1.65}}><strong>⚠ 2 requirement conflicts detected.</strong> R4 (autofill shipping) conflicts with R1 (guest checkout). Click the conflict badge on any requirement to see the analysis and suggested resolution.</p>
      </div>

      <H2>Goals</H2>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:8}}>
        {[
          "Reduce payment drop-off rate from 34.2% to under 22% within 60 days of launch",
          "Increase checkout completion rate from 65.8% to 78%+",
          "Reduce average checkout time from 4 min 20s to under 2 minutes",
          "Maintain or improve average order value (no regression acceptable)",
        ].map((g,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:13,color:C.purpleLight,fontWeight:600,flexShrink:0,marginTop:1}}>{i+1}.</span>
            <span style={{fontSize:14,color:C.textMuted,lineHeight:1.65}}>{g}</span>
          </div>
        ))}
      </div>

      <H2>Target Users</H2>
      {[
        { persona:"Guest shoppers", desc:"First-time buyers who abandon when forced to create an account. This is the largest abandonment segment (24% of total drop-off). They need a frictionless path from cart to confirmation.", need:"Complete a purchase in under 2 minutes without creating an account." },
        { persona:"Mobile users", desc:"72% of checkout sessions begin on mobile. Current card entry UX is optimized for desktop. These users need express payment options (Apple Pay, Google Pay) that reduce checkout to a single tap.", need:"Pay in one tap using an already-trusted payment method." },
        { persona:"Returning customers", desc:"Logged-in users who have previously provided shipping information. They expect saved data to be pre-filled and the flow to be meaningfully faster than for new users.", need:"Checkout in under 60 seconds using saved addresses and payment methods." },
      ].map(u=>(
        <div key={u.persona} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:4}}>{u.persona}</div>
          <p style={{fontSize:13,color:C.textMuted,lineHeight:1.65,marginBottom:6}}>{u.desc}</p>
          <div style={{fontSize:12,color:C.textDim}}><span style={{color:C.purpleLight,fontWeight:500}}>Core need:</span> {u.need}</div>
        </div>
      ))}

      <H2>Requirements</H2>
      <P>Requirements are tagged with priority (P0 = must-have for launch, P1 = strong recommendation, P2 = nice-to-have) and effort estimate. P0 requirements are non-negotiable — a launch without them does not achieve the stated goals.</P>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {REQS.map(req=>{
          const flash=flashReqId===req.id; const cited=insertedReqs.includes(req.id);
          return (
            <div key={req.id} style={{border:`1px solid ${req.conflict?"rgba(245,180,69,0.28)":flash?"rgba(100,86,230,0.55)":C.border}`,borderRadius:10,padding:"14px 16px",background:flash?"rgba(87,70,232,0.06)":req.conflict?"rgba(245,180,69,0.03)":C.surface,transition:"all 0.35s",cursor:req.conflict?"pointer":"default"}} onClick={req.conflict?()=>onConflictClick(req):undefined}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:700,color:C.purpleLight}}>{req.id}</span>
                <span style={{fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:4,background:`${pc(req.priority)}18`,color:pc(req.priority)}}>{req.priority}</span>
                <span style={{fontSize:11,color:C.textDim}}>{req.effort} effort · {req.points}pt{req.points!==1?"s":""}</span>
                <div style={{flex:1}}/>
                {cited&&<span style={{fontSize:10,padding:"2px 7px",background:C.purpleBg,color:C.purpleLight,borderRadius:4,border:`1px solid ${C.purpleBorder}`}}>cited</span>}
                {req.conflict&&<span style={{fontSize:10,padding:"2px 7px",background:"rgba(245,180,69,0.14)",color:C.yellow,borderRadius:4,cursor:"pointer"}}>Conflict ⚠ — click to resolve</span>}
              </div>
              <p style={{fontSize:13,color:"rgba(0,0,0,0.75)",lineHeight:1.55,margin:0}}>{req.title}</p>
            </div>
          );
        })}
      </div>

      <H2>Success Metrics</H2>
      <P>These metrics will be tracked in Amplitude for 60 days post-launch. A/B test framework will be used where possible to isolate the impact of individual changes.</P>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 18px",marginBottom:8}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:"10px 20px",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:600,color:C.textDim,textTransform:"uppercase",letterSpacing:"0.07em"}}>Metric</span>
          <span style={{fontSize:11,fontWeight:600,color:C.textDim,textTransform:"uppercase",letterSpacing:"0.07em"}}>Baseline</span>
          <span style={{fontSize:11,fontWeight:600,color:C.textDim,textTransform:"uppercase",letterSpacing:"0.07em"}}>Target</span>
          <span style={{fontSize:11,fontWeight:600,color:C.textDim,textTransform:"uppercase",letterSpacing:"0.07em"}}>Timeline</span>
          {[
            {m:"Checkout completion rate",b:"65.8%",t:"78%+",tl:"60 days post-launch"},
            {m:"Payment drop-off rate",b:"34.2%",t:"<22%",tl:"60 days post-launch"},
            {m:"Average checkout time",b:"4m 20s",t:"<2 min",tl:"30 days post-launch"},
            {m:"Mobile conversion rate",b:"41.2%",t:"55%+",tl:"60 days post-launch"},
            {m:"Guest checkout adoption",b:"0% (not available)",t:">40% of sessions",tl:"30 days post-launch"},
          ].map(r=>(
            <>
              <span key={r.m+"-m"} style={{fontSize:13,color:C.textMuted}}>{r.m}</span>
              <span key={r.m+"-b"} style={{fontSize:13,color:"rgba(0,0,0,0.3)",textAlign:"right"}}>{r.b}</span>
              <span key={r.m+"-t"} style={{fontSize:13,color:C.green,fontWeight:500,textAlign:"right"}}>{r.t}</span>
              <span key={r.m+"-tl"} style={{fontSize:11,color:C.textDim}}>{r.tl}</span>
            </>
          ))}
        </div>
      </div>

      <H2>Open Questions</H2>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[
          { q:"Should guest checkout be the default path, or should we present an equal choice between guest and account creation?", owner:"AK", status:"Open" },
          { q:"Does Stripe's Payment Request API support our current custom checkout UI, or do we need to use Stripe Elements?", owner:"Engineering", status:"Open" },
          { q:"What is the impact on average order value for guest vs. logged-in checkouts? Do we have this data?", owner:"Data", status:"Open" },
        ].map((q,i)=>(
          <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px"}}>
            <p style={{fontSize:13,color:C.textMuted,lineHeight:1.6,marginBottom:6}}>{q.q}</p>
            <div style={{display:"flex",gap:12}}>
              <span style={{fontSize:11,color:C.textDim}}>Owner: <span style={{color:C.textMuted}}>{q.owner}</span></span>
              <span style={{fontSize:11,color:C.yellow}}>● {q.status}</span>
            </div>
          </div>
        ))}
      </div>

      <H2>Out of Scope</H2>
      <P>The following are explicitly excluded from this release to maintain focus on the core drop-off problem:</P>
      {["Subscription or recurring payment support — tracked in separate roadmap item","International or multi-currency checkout — Q3 initiative","In-store and POS payment flows — separate product surface","Checkout analytics dashboard — Product Analytics team owns","Refund or return flows — Post-purchase team owns"].map(item=>(
        <div key={item} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
          <span style={{fontSize:13,color:C.textDim,flexShrink:0,marginTop:1}}>—</span>
          <span style={{fontSize:13,color:C.textMuted,lineHeight:1.6}}>{item}</span>
        </div>
      ))}
    </div>
  );
}

/* ══ PRD EDITOR (with Document / Structured toggle) ══ */
function PRDEditor({ insertedReqs, flashReqId, onConflictClick, onGenerateTickets, ticketsState, onExport }: {
  insertedReqs: string[]; flashReqId: string|null; onConflictClick:(r:Req)=>void;
  onGenerateTickets:()=>void; ticketsState:"idle"|"generating"|"done"; onExport:()=>void;
}) {
  const [view, setView] = useState<"document"|"structured">("document");
  const [filter, setFilter] = useState("All");
  const filtered = filter==="All" ? REQS : REQS.filter(r=>r.priority===filter);

  return (
    <div style={{flex:1,overflowY:"auto",padding:"16px 28px"}}>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,position:"sticky",top:0,background:C.bg,paddingBottom:12,paddingTop:4,zIndex:10,borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <h1 style={{fontSize:18,fontWeight:600,color:C.text,letterSpacing:"-0.3px"}}>Checkout Redesign <span style={{fontSize:12,fontWeight:400,color:C.textDim,letterSpacing:"0"}}>· PRD</span></h1>
          {/* View toggle */}
          <div style={{display:"flex",background:"rgba(0,0,0,0.04)",border:`1px solid ${C.border}`,borderRadius:7,overflow:"hidden"}}>
            {(["document","structured"] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{fontSize:11,padding:"4px 11px",background:view===v?"rgba(87,70,232,0.15)":"transparent",border:"none",color:view===v?C.purpleLight:C.textDim,cursor:"pointer",fontFamily:"inherit",fontWeight:view===v?500:400,borderRight:v==="document"?`1px solid ${C.border}`:"none",transition:"all 0.15s"}}>
                {v==="document"?"📄 Document":"⚡ Structured"}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexShrink:0}}>
          {ticketsState==="idle"&&<button onClick={onGenerateTickets} style={{fontSize:12,padding:"6px 14px",background:C.purple,border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:500}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background=C.purpleHover} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background=C.purple}>Generate Tickets →</button>}
          {ticketsState==="generating"&&<button disabled style={{fontSize:12,padding:"6px 14px",background:"rgba(87,70,232,0.4)",border:"none",borderRadius:7,color:"rgba(0,0,0,0.45)",cursor:"not-allowed",fontFamily:"inherit"}}>Generating...</button>}
          {ticketsState==="done"&&<button style={{fontSize:12,padding:"6px 14px",background:"rgba(62,207,142,0.12)",border:"1px solid rgba(62,207,142,0.25)",borderRadius:7,color:"rgba(62,207,142,0.9)",cursor:"pointer",fontFamily:"inherit"}}>✓ Tickets ready</button>}
          <button onClick={onExport} style={{fontSize:12,padding:"6px 11px",background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,color:C.textMuted,cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=C.purpleBorder;(e.currentTarget as HTMLButtonElement).style.color=C.purpleLight;}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=C.border;(e.currentTarget as HTMLButtonElement).style.color=C.textMuted;}}>Export ↗</button>
        </div>
      </div>

      {/* Document view */}
      {view==="document"&&<PRDDocumentView insertedReqs={insertedReqs} flashReqId={flashReqId} onConflictClick={onConflictClick}/>}

      {/* Structured view */}
      {view==="structured"&&(
        <div>
          <div style={{background:"rgba(245,180,69,0.07)",border:"1px solid rgba(180,83,9,0.15)",borderRadius:9,padding:"10px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14,flexShrink:0}}>⚠</span>
            <span style={{fontSize:12,color:"#b45309",fontWeight:500}}>2 requirement conflicts detected</span>
            <span style={{fontSize:12,color:"rgba(180,83,9,0.5)",marginLeft:4}}>— Click any conflict badge to see the analysis</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontSize:12,fontWeight:500,color:"rgba(0,0,0,0.55)"}}>Requirements</span>
            <span style={{fontSize:11,color:C.textDim}}>({REQS.length})</span>
            <div style={{flex:1}}/>
            <div style={{display:"flex",gap:3}}>
              {["All","P0","P1","P2"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{fontSize:11,padding:"3px 8px",background:filter===f?"rgba(0,0,0,0.09)":"transparent",border:`1px solid ${filter===f?C.border:"transparent"}`,borderRadius:5,color:filter===f?C.text:C.textDim,cursor:"pointer",fontFamily:"inherit"}}>{f}</button>)}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {filtered.map(req=>{
              const flash=flashReqId===req.id; const cited=insertedReqs.includes(req.id);
              return (
                <div key={req.id} style={{border:`1px solid ${req.conflict?"rgba(245,180,69,0.28)":flash?"rgba(100,86,230,0.55)":C.border}`,borderRadius:8,padding:"10px 13px",background:flash?"rgba(100,86,230,0.1)":req.conflict?"rgba(180,83,9,0.04)":C.surface,display:"flex",alignItems:"center",gap:10,transition:"all 0.35s",cursor:req.conflict?"pointer":"default"}} onClick={req.conflict?()=>onConflictClick(req):undefined}>
                  <span style={{fontSize:11,fontWeight:700,color:C.purpleLight,width:24,flexShrink:0}}>{req.id}</span>
                  <span style={{fontSize:9,fontWeight:600,padding:"2px 5px",borderRadius:3,background:`${pc(req.priority)}18`,color:pc(req.priority),flexShrink:0}}>{req.priority}</span>
                  <span style={{fontSize:12,color:"rgba(0,0,0,0.75)",flex:1,lineHeight:1.45}}>{req.title}</span>
                  {cited&&<span style={{fontSize:10,padding:"2px 7px",background:C.purpleBg,color:C.purpleLight,borderRadius:3,flexShrink:0,border:`1px solid ${C.purpleBorder}`}}>cited</span>}
                  {req.conflict&&<span style={{fontSize:10,padding:"2px 7px",background:"rgba(245,180,69,0.14)",color:C.yellow,borderRadius:3,flexShrink:0,whiteSpace:"nowrap"}}>Conflict ⚠</span>}
                  <span style={{fontSize:11,color:C.textDim,flexShrink:0}}>{req.effort} · {req.points}pt{req.points!==1?"s":""}</span>
                </div>
              );
            })}
          </div>

          <div style={{marginTop:20}}>
            <Sec title="Success Metrics" id="metrics" expanded={"metrics"} onToggle={()=>{}}>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[{l:"Checkout completion",cur:"65.8%",tgt:"78%+"},{l:"Payment drop-off",cur:"34.2%",tgt:"<22%"},{l:"Avg checkout time",cur:"4m 20s",tgt:"<2 min"}].map(m=>(
                  <div key={m.l} style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:12,color:C.textMuted,flex:1}}>{m.l}</span>
                    <span style={{fontSize:12,color:"rgba(0,0,0,0.3)",minWidth:48}}>{m.cur}</span>
                    <span style={{fontSize:11,color:C.textDim}}>→</span>
                    <span style={{fontSize:12,color:C.green,minWidth:60,textAlign:"right"}}>{m.tgt}</span>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
        </div>
      )}
    </div>
  );
}

function Sec({ title, id, expanded, onToggle, children }: { title:string; id:string; expanded:string|null; onToggle:(id:string)=>void; children:React.ReactNode }) {
  const open=expanded===id;
  return (
    <div style={{marginBottom:12}}>
      <button onClick={()=>onToggle(id)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:"9px 0",fontFamily:"inherit",textAlign:"left"}}>
        <span style={{fontSize:10,color:C.textDim,display:"inline-block",transform:open?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.18s"}}>▶</span>
        <span style={{fontSize:13,fontWeight:500,color:"rgba(0,0,0,0.6)"}}>{title}</span>
      </button>
      {open&&<div style={{padding:"12px 15px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,marginTop:3}}>{children}</div>}
    </div>
  );
}

/* ══ TICKETS OVERLAY ══ */
function TicketsGeneratingOverlay() {
  const steps=["Parsing requirements and priorities...","Building dependency graph...","Grouping into execution waves...","Estimating effort per ticket...","Tickets ready ✓"];
  const [step,setStep]=useState(0);
  useEffect(()=>{ steps.forEach((_,i)=>setTimeout(()=>setStep(i),i*420+100)); },[]);// eslint-disable-line
  return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:320}}>
        {steps.map((s,i)=>(
          <div key={s} style={{display:"flex",gap:12,alignItems:"center",marginBottom:13,opacity:i<=step?1:0.18,transition:"opacity 0.3s"}}>
            <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,background:i<step?C.green:i===step?C.purple:"rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.3s"}}>
              {i<step&&<svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {i===step&&<div style={{width:5,height:5,borderRadius:"50%",background:"white"}}/>}
            </div>
            <span style={{fontSize:13,color:i<=step?"rgba(0,0,0,0.8)":C.textDim}}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══ TICKET CARD ══ */
function TicketCard({ ticket, onClick, selected }: { ticket:Ticket; onClick:()=>void; selected:boolean }) {
  const req=REQS.find(r=>r.id===ticket.req);
  return (
    <div onClick={onClick} style={{background:selected?"rgba(100,86,230,0.1)":C.surface,border:`1px solid ${selected?"rgba(87,70,232,0.3)":C.border}`,borderRadius:8,padding:"10px 12px",cursor:"pointer",transition:"all 0.15s"}} onMouseEnter={e=>{if(!selected){(e.currentTarget as HTMLDivElement).style.borderColor="rgba(87,70,232,0.25)";(e.currentTarget as HTMLDivElement).style.background="rgba(100,86,230,0.05)";}}} onMouseLeave={e=>{if(!selected){(e.currentTarget as HTMLDivElement).style.borderColor=C.border;(e.currentTarget as HTMLDivElement).style.background=C.surface;}}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
        <span style={{fontSize:10,fontWeight:700,color:C.purpleLight}}>{ticket.id}</span>
        {ticket.deps.length>0&&<span style={{fontSize:9,color:C.textDim}}>↳ {ticket.deps.join(", ")}</span>}
        <div style={{flex:1}}/>
        {req&&<span style={{fontSize:9,padding:"2px 5px",background:`${pc(req.priority)}18`,color:pc(req.priority),borderRadius:3}}>{req.priority}</span>}
      </div>
      <div style={{fontSize:12,color:"rgba(0,0,0,0.8)",lineHeight:1.45,marginBottom:7}}>{ticket.title}</div>
      <div style={{display:"flex",gap:6}}><span style={{fontSize:10,color:C.textDim}}>{ticket.req}</span><span style={{fontSize:10,color:C.textDim}}>·</span><span style={{fontSize:10,color:C.textDim}}>{ticket.effort} · {ticket.pts}pt{ticket.pts!==1?"s":""}</span></div>
    </div>
  );
}

/* ══ TICKET DETAIL ══ */
function TicketDetail({ ticket, onClose }: { ticket:Ticket; onClose:()=>void }) {
  const [copied,setCopied]=useState(false);
  const req=REQS.find(r=>r.id===ticket.req);
  const prompt=`# ${ticket.id}: ${ticket.title}\n\n## Context\nPRD: Checkout Redesign · ${ticket.req}\n${req?`Requirement: "${req.title}"`:"" }\n\n## Task\n${ticket.description}\n\n## Acceptance Criteria\n${ticket.criteria.map(c=>`- [ ] ${c}`).join("\n")}\n\n## Technical Notes\n- Checkout flow: \`/src/pages/checkout/\`\n- Stripe: \`/src/lib/stripe.ts\`\n${ticket.deps.length>0?`- Depends on: ${ticket.deps.join(", ")}`:"- No dependencies"}\n\n## Output\nWorking implementation with unit tests. Don't change unrelated files.`;

  return (
    <div style={{width:360,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"100%",flexShrink:0,overflowY:"auto"}}>
      <div style={{padding:"13px 15px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <span style={{fontSize:12,fontWeight:700,color:C.purpleLight}}>{ticket.id}</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
      </div>
      <div style={{padding:"16px",flex:1}}>
        <h3 style={{fontSize:14,fontWeight:600,color:C.text,lineHeight:1.45,marginBottom:13}}>{ticket.title}</h3>
        <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
          {req&&<span style={{fontSize:10,padding:"3px 7px",background:`${pc(req.priority)}18`,color:pc(req.priority),borderRadius:4}}>{req.priority}</span>}
          <span style={{fontSize:10,padding:"3px 7px",background:"rgba(0,0,0,0.06)",color:C.textMuted,borderRadius:4}}>{ticket.effort} effort</span>
          <span style={{fontSize:10,padding:"3px 7px",background:"rgba(0,0,0,0.06)",color:C.textMuted,borderRadius:4}}>{ticket.pts}pt{ticket.pts!==1?"s":""}</span>
          <span style={{fontSize:10,padding:"3px 7px",background:C.purpleBg,color:C.purpleLight,borderRadius:4,border:`1px solid ${C.purpleBorder}`}}>{ticket.req}</span>
        </div>
        <Lbl>Description</Lbl>
        <p style={{fontSize:12,color:C.textMuted,lineHeight:1.7,marginBottom:16}}>{ticket.description}</p>
        <Lbl>Acceptance Criteria</Lbl>
        <div style={{marginBottom:16}}>{ticket.criteria.map((c,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6}}><span style={{fontSize:12,color:C.textDim,flexShrink:0}}>□</span><span style={{fontSize:12,color:C.textMuted,lineHeight:1.55}}>{c}</span></div>)}</div>
        {ticket.deps.length>0&&<><Lbl>Depends on</Lbl><div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>{ticket.deps.map(d=><span key={d} style={{fontSize:11,padding:"3px 9px",background:C.purpleBg,color:C.purpleLight,borderRadius:4,border:`1px solid ${C.purpleBorder}`}}>{d}</span>)}</div></>}
        <div style={{background:"rgba(100,86,230,0.07)",border:`1px solid ${C.purpleBorder}`,borderRadius:10,padding:"13px 14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div><span style={{fontSize:12,fontWeight:600,color:C.purpleLight}}>Agent Prompt</span><span style={{fontSize:11,color:C.textDim,marginLeft:8}}>Paste into Cursor / Claude Code</span></div>
            <button onClick={()=>{navigator.clipboard.writeText(prompt).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{fontSize:11,padding:"4px 10px",background:copied?"rgba(62,207,142,0.15)":C.purpleBg,border:`1px solid ${copied?"rgba(62,207,142,0.3)":C.purpleBorder}`,borderRadius:6,color:copied?C.green:C.purpleLight,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>{copied?"✓ Copied!":"Copy →"}</button>
          </div>
          <div style={{background:"#f0f0f0",border:`1px solid ${C.border}`,borderRadius:7,padding:"11px 13px",fontSize:11,color:"rgba(0,0,0,0.6)",fontFamily:"monospace",lineHeight:1.75,whiteSpace:"pre-wrap",maxHeight:240,overflowY:"auto"}}>{prompt}</div>
        </div>
      </div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <div style={{fontSize:10,fontWeight:600,color:C.textDim,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>{children}</div>;
}

/* ══ TICKETS BOARD ══ */
function TicketsBoard({ onTicketClick, selectedId }: { onTicketClick:(t:Ticket)=>void; selectedId:string|null }) {
  return (
    <div style={{flex:1,overflowX:"auto",overflowY:"auto",padding:"20px 22px",display:"flex",gap:16,alignItems:"flex-start",height:"100%"}}>
      {WAVES.map(wave=>(
        <div key={wave.n} style={{minWidth:264,width:264,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:11}}>
            <span style={{fontSize:12,fontWeight:500,color:"rgba(0,0,0,0.5)"}}>{wave.label}</span>
            <span style={{fontSize:10,background:"rgba(0,0,0,0.06)",color:C.textDim,borderRadius:10,padding:"1px 7px"}}>{wave.tickets.length}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {wave.tickets.map(t=><TicketCard key={t.id} ticket={t} onClick={()=>onTicketClick(t)} selected={selectedId===t.id}/>)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══ PROGRESS VIEW (management) ══ */
function ProgressView() {
  const waves = [
    { label:"Wave 1 · Foundation", total:2, done:2, pts:5, ptsDone:5, status:"done" as const },
    { label:"Wave 2 · Payment", total:3, done:1, pts:11, ptsDone:5, status:"active" as const },
    { label:"Wave 3 · Conversion", total:4, done:0, pts:10, ptsDone:0, status:"upcoming" as const },
  ];
  const blocked = [
    { id:"VAN-006", title:"Autofill shipping for logged-in users", reason:"Needs API design review from backend team", since:"2 days" },
  ];
  const statusRows = [
    { label:"Done", count:3, pts:10, color:C.green },
    { label:"In Progress", count:2, pts:8, color:C.purple },
    { label:"Blocked", count:1, pts:3, color:C.red },
    { label:"Not started", count:3, pts:7, color:C.textDim },
  ];
  const totalPts = 28, donePts = 10;

  return (
    <div style={{flex:1,overflowY:"auto",padding:"24px 28px",height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <h2 style={{fontSize:16,fontWeight:600,color:C.text,margin:0}}>Sprint Progress</h2>
        <span style={{fontSize:11,background:"rgba(5,150,105,0.08)",color:C.green,border:`1px solid rgba(5,150,105,0.2)`,borderRadius:6,padding:"2px 8px"}}>Checkout Redesign · Week 3</span>
      </div>

      {/* Summary row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {[
          { label:"Total tickets", value:"9", sub:"across 3 waves" },
          { label:"Points done", value:`${donePts}/${totalPts}`, sub:"36% complete" },
          { label:"Velocity", value:"8 pts/wk", sub:"on track" },
          { label:"ETA", value:"2 weeks", sub:"Apr 2 at current pace" },
        ].map(s=>(
          <div key={s.label} style={{background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:11,color:C.textDim,marginBottom:8}}>{s.label}</div>
            <div style={{fontSize:20,fontWeight:700,color:C.text,letterSpacing:"-0.4px",marginBottom:3}}>{s.value}</div>
            <div style={{fontSize:11,color:C.textMuted}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16,marginBottom:20}}>
        {/* Wave progress */}
        <div style={{background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:16}}>Wave completion</div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {waves.map(w=>{
              const pct = Math.round((w.done/w.total)*100);
              const waveColor = w.status==="done"?C.green:w.status==="active"?C.purple:C.textDim;
              return (
                <div key={w.label}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,color:C.textMuted}}>{w.label}</span>
                      <span style={{fontSize:10,padding:"1px 6px",background:w.status==="done"?"rgba(5,150,105,0.08)":w.status==="active"?"rgba(87,70,232,0.08)":"rgba(0,0,0,0.04)",color:waveColor,borderRadius:4}}>{w.status==="done"?"Done":w.status==="active"?"Active":"Upcoming"}</span>
                    </div>
                    <span style={{fontSize:12,fontWeight:600,color:C.text}}>{w.done}/{w.total} tickets · {w.ptsDone}/{w.pts}pts</span>
                  </div>
                  <div style={{height:6,background:"rgba(0,0,0,0.05)",borderRadius:3}}>
                    <div style={{height:"100%",width:`${pct}%`,background:waveColor,borderRadius:3,transition:"width 0.5s ease"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status breakdown */}
        <div style={{background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:16}}>Status breakdown</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {statusRows.map(s=>(
              <div key={s.label} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                <span style={{fontSize:12,color:C.textMuted,flex:1}}>{s.label}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.text}}>{s.count}</span>
                <span style={{fontSize:11,color:C.textDim,width:42,textAlign:"right"}}>{s.pts}pts</span>
              </div>
            ))}
          </div>
          <div style={{borderTop:`1px solid ${C.border}`,marginTop:12,paddingTop:12}}>
            <div style={{height:6,background:"rgba(0,0,0,0.05)",borderRadius:3,overflow:"hidden"}}>
              <div style={{display:"flex",height:"100%"}}>
                <div style={{width:`${(10/28)*100}%`,background:C.green}}/>
                <div style={{width:`${(8/28)*100}%`,background:C.purple}}/>
                <div style={{width:`${(3/28)*100}%`,background:C.red}}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blocked tickets */}
      {blocked.length>0&&(
        <div style={{background:"rgba(220,38,38,0.03)",border:`1px solid rgba(220,38,38,0.15)`,borderRadius:12,padding:"16px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{fontSize:13,fontWeight:600,color:C.red}}>Blocked</span>
            <span style={{fontSize:11,background:"rgba(220,38,38,0.08)",color:C.red,borderRadius:4,padding:"1px 6px"}}>{blocked.length}</span>
          </div>
          {blocked.map(b=>(
            <div key={b.id} style={{display:"flex",alignItems:"flex-start",gap:14}}>
              <span style={{fontSize:11,fontWeight:700,color:C.purple,flexShrink:0,paddingTop:1}}>{b.id}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500,color:C.text,marginBottom:3}}>{b.title}</div>
                <div style={{fontSize:11,color:C.textMuted}}>⚠ {b.reason}</div>
              </div>
              <span style={{fontSize:11,color:C.textDim,flexShrink:0}}>Blocked {b.since}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══ RESEARCH VIEW ══ */
function ResearchView({ messages, onSend, loading, onInsert }: { messages:Message[]; onSend:(q:string)=>void; loading:boolean; onInsert:(r:string)=>void }) {
  const [input,setInput]=useState("");
  const scrollRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{ if(scrollRef.current) scrollRef.current.scrollTop=scrollRef.current.scrollHeight; },[messages,loading]);
  function handleSubmit(e: FormEvent) { e.preventDefault(); if(!input.trim()||loading) return; onSend(input.trim()); setInput(""); }
  const suggestions=["Are any of my requirements conflicting?","What do competitors do for checkout?","What am I missing in this PRD?","What's the ROI of adding Apple Pay?","Compare to Shopify checkout"];
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <div style={{padding:"15px 26px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <span style={{fontSize:14,fontWeight:500,color:"rgba(0,0,0,0.75)"}}>Research</span>
        <span style={{fontSize:12,color:C.textDim}}>AI searches the web + your product context simultaneously</span>
        <div style={{flex:1}}/>
        <span style={{fontSize:11,background:C.purpleBg,color:C.purpleLight,border:`1px solid ${C.purpleBorder}`,padding:"3px 9px",borderRadius:10}}>{messages.filter(m=>m.role==="ai").length} queries</span>
      </div>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"22px 26px",display:"flex",flexDirection:"column",gap:14}}>
        {messages.length===0&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:48,textAlign:"center"}}>
            <div style={{width:52,height:52,borderRadius:14,background:C.purpleBg,border:`1px solid ${C.purpleBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:18}}>🔍</div>
            <p style={{fontSize:15,color:C.textMuted,marginBottom:6,fontWeight:500}}>Research your PRD with AI</p>
            <p style={{fontSize:13,color:C.textDim,marginBottom:28,maxWidth:360,lineHeight:1.6}}>Every answer is grounded in your product context and live web sources. Citations included.</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",maxWidth:560}}>
              {suggestions.map(s=><button key={s} onClick={()=>onSend(s)} style={{fontSize:12,padding:"7px 13px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,color:C.textMuted,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>)}
            </div>
          </div>
        )}
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:m.role==="user"?420:660,fontSize:13,lineHeight:1.72,padding:"11px 15px",borderRadius:m.role==="user"?"10px 10px 2px 10px":"10px 10px 10px 2px",background:m.role==="user"?"rgba(87,70,232,0.15)":"rgba(0,0,0,0.04)",border:`1px solid ${m.role==="user"?"rgba(87,70,232,0.25)":C.border}`,color:m.role==="user"?"#5746E8":"rgba(0,0,0,0.65)"}}>
              <div dangerouslySetInnerHTML={{__html:m.text.replace(/\*\*(.*?)\*\*/g,'<strong style="color:rgba(0,0,0,0.9)">$1</strong>').replace(/\n\n/g,"<br/><br/>").replace(/\n(\d+\.)/g,"<br/>$1")}}/>
              {m.cites&&m.cites.length>0&&<div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>{m.cites.map(c=><span key={c.n} style={{fontSize:11,background:C.purpleBg,color:"#5746E8",borderRadius:4,padding:"3px 8px",border:`1px solid ${C.purpleBorder}`}}>[{c.n}] {c.label}</span>)}</div>}
              {m.insertReq&&<button onClick={()=>onInsert(m.insertReq!)} style={{marginTop:9,fontSize:12,color:C.purpleLight,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0,display:"block"}}>Insert into PRD →</button>}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex"}}><div style={{padding:"12px 15px",background:"rgba(0,0,0,0.04)",border:`1px solid ${C.border}`,borderRadius:"10px 10px 10px 2px",display:"flex",gap:5,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.purpleLight,animation:`vpulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div></div>}
      </div>
      <div style={{padding:"14px 26px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
        <form onSubmit={handleSubmit} style={{display:"flex",gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask anything about your PRD — research, gap analysis, conflict detection..." style={{flex:1,padding:"11px 16px",fontSize:13,color:C.text,background:"rgba(0,0,0,0.05)",border:`1px solid ${C.border}`,borderRadius:10,fontFamily:"inherit"}} onFocus={e=>e.currentTarget.style.borderColor="rgba(100,86,230,0.45)"} onBlur={e=>e.currentTarget.style.borderColor=C.border}/>
          <button type="submit" disabled={loading} style={{padding:"11px 22px",background:C.purple,border:"none",borderRadius:10,color:"#fff",cursor:loading?"not-allowed":"pointer",fontSize:13,fontFamily:"inherit",fontWeight:500,opacity:loading?0.5:1}}>Ask →</button>
        </form>
      </div>
    </div>
  );
}

/* ══ INTEGRATIONS VIEW ══ */
function IntegrationsView({ linearConnected, onLinearConnect }: { linearConnected: boolean; onLinearConnect: () => void }) {
  const mvp = [
    { id:"linear", name:"Linear", desc:"Push tickets to your Linear board. One-way sync — your engineers never leave Linear.", logo:<div style={{width:28,height:28,borderRadius:6,background:"#5E6AD2",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12L12 21L3 12Z" fill="white" opacity="0.9"/></svg></div>, connected:linearConnected, onConnect:onLinearConnect, badge:"MVP" },
    { id:"url", name:"URL & Doc Import", desc:"Import any URL or document. Web pages, PDFs, Notion exports — all queryable in Research.", logo:<div style={{width:28,height:28,borderRadius:6,background:"rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🌐</div>, connected:true, onConnect:()=>{}, badge:"MVP" },
    { id:"gsuite", name:"Google Workspace", desc:"Import Docs, Sheets, and Drive files into your product context.", logo:<div style={{width:28,height:28,borderRadius:6,background:"rgba(66,133,244,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>G</div>, connected:false, onConnect:()=>{}, badge:"MVP" },
  ];
  const v1 = [
    { name:"GitHub", desc:"Index your codebase. Tickets reference actual files + functions.", color:"rgba(0,0,0,0.08)", letter:"</>", badge:"V1" },
    { name:"Notion", desc:"Import PRDs, decision logs, roadmaps. Query across all pages.", color:"rgba(0,0,0,0.08)", letter:"N", badge:"V1" },
    { name:"Figma", desc:"Pull linked screens into Design tab. Conflict detection vs PRD.", color:"rgba(162,89,255,0.15)", letter:"✦", badge:"V1" },
    { name:"Jira", desc:"Two-way sync. Tickets land in Jira. Changes propagate back.", color:"rgba(0,101,255,0.15)", letter:"J", badge:"V1" },
    { name:"Loom / Video", desc:"Paste Loom URL → extract key frames → process like screenshots.", color:"rgba(99,91,255,0.15)", letter:"▶", badge:"V1" },
    { name:"Amplitude", desc:"Connect live metrics. Query: 'Did we hit our 78% target?'", color:"rgba(62,207,142,0.1)", letter:"∿", badge:"V1" },
  ];

  return (
    <div style={{flex:1,overflowY:"auto",padding:"28px 32px",height:"100%"}}>
      {/* MVP Connectors */}
      <div style={{marginBottom:32}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <span style={{fontSize:13,fontWeight:600,color:"rgba(0,0,0,0.7)"}}>MVP Connectors</span>
          <span style={{fontSize:11,background:"rgba(62,207,142,0.12)",color:C.green,border:"1px solid rgba(62,207,142,0.2)",borderRadius:6,padding:"2px 8px"}}>Plug in, don't migrate</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {mvp.map(c=>(
            <div key={c.id} style={{background:C.surface,border:`1px solid ${c.connected?"rgba(62,207,142,0.25)":C.border}`,borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,transition:"border-color 0.3s"}}>
              {c.logo}
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{c.name}</div>
                <div style={{fontSize:12,color:C.textMuted}}>{c.desc}</div>
              </div>
              {c.connected
                ? <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/><span style={{fontSize:12,color:C.green}}>Connected</span></div>
                : <button onClick={c.onConnect} style={{fontSize:12,padding:"6px 14px",background:C.purpleBg,border:`1px solid ${C.purpleBorder}`,borderRadius:7,color:C.purpleLight,cursor:"pointer",fontFamily:"inherit"}}>Connect →</button>
              }
            </div>
          ))}
        </div>
      </div>

      {/* V1 Connectors */}
      <div style={{marginBottom:32}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <span style={{fontSize:13,fontWeight:600,color:"rgba(0,0,0,0.7)"}}>V1 — Deepen Context</span>
          <span style={{fontSize:11,background:"rgba(139,127,245,0.12)",color:C.purpleLight,border:`1px solid ${C.purpleBorder}`,borderRadius:6,padding:"2px 8px"}}>No migration, just deeper reads</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
          {v1.map(c=>(
            <div key={c.name} style={{background:"rgba(0,0,0,0.02)",border:`1px dashed ${C.border}`,borderRadius:12,padding:"14px 16px",opacity:0.75}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:28,height:28,borderRadius:6,background:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"rgba(0,0,0,0.6)",fontWeight:700}}>{c.letter}</div>
                <span style={{fontSize:13,fontWeight:600,color:C.textMuted}}>{c.name}</span>
                <span style={{fontSize:10,background:"rgba(139,127,245,0.15)",color:C.purpleLight,borderRadius:4,padding:"2px 6px",marginLeft:"auto"}}>V1</span>
              </div>
              <p style={{fontSize:12,color:C.textDim,lineHeight:1.55}}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* V2 */}
      <div style={{marginBottom:32}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <span style={{fontSize:13,fontWeight:600,color:"rgba(0,0,0,0.7)"}}>V2 — Agent Execution</span>
          <span style={{fontSize:11,background:"rgba(249,115,22,0.1)",color:C.orange,border:"1px solid rgba(249,115,22,0.2)",borderRadius:6,padding:"2px 8px"}}>Agents do the building</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
          {[{name:"Priority Engine",desc:"Aggregates feedback, tickets, revenue. Ranks problems by impact. 'Generate PRD' on any signal."},{name:"Agent Fleet",desc:"Agents with full PRD + codebase + design context. Wave-based, dependency-aware execution."},{name:"GitHub PRs",desc:"Agents create real branches and PRs. Diff view with reasoning annotations. Human review gate."}].map(c=>(
            <div key={c.name} style={{background:"rgba(249,115,22,0.04)",border:"1px dashed rgba(249,115,22,0.2)",borderRadius:12,padding:"14px 16px",opacity:0.75}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:600,color:"rgba(249,115,22,0.7)"}}>{c.name}</span>
                <span style={{fontSize:10,background:"rgba(249,115,22,0.12)",color:C.orange,borderRadius:4,padding:"2px 6px"}}>V2</span>
              </div>
              <p style={{fontSize:12,color:C.textDim,lineHeight:1.55}}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pitch footer */}
      <div style={{background:"rgba(87,70,232,0.08)",border:`1px solid ${C.purpleBorder}`,borderRadius:12,padding:"18px 22px",textAlign:"center"}}>
        <p style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:6}}>Vantage = the brain. Linear/Cursor = the hands.</p>
        <p style={{fontSize:13,color:C.textMuted,lineHeight:1.65}}>Your engineers stay in their tools. Your PMs stay in their flow. Vantage generates everything — they execute.</p>
      </div>
    </div>
  );
}

/* ══ FIGMA VIEW ══ */
function FigmaView() {
  const [selectedFrame, setSelectedFrame] = useState("payment");
  const frames = [
    { id:"cart", label:"Cart Review" },
    { id:"shipping", label:"Shipping Form" },
    { id:"payment", label:"Payment Step", reqs:["R2","R3"] },
    { id:"confirmation", label:"Order Confirmation" },
  ];

  return (
    <div style={{flex:1,display:"flex",height:"100%",overflow:"hidden"}}>
      {/* Frame list */}
      <div style={{width:200,borderRight:`1px solid ${C.border}`,padding:"16px 12px",flexShrink:0}}>
        <div style={{fontSize:11,fontWeight:600,color:C.textDim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12,padding:"0 6px"}}>Frames</div>
        {frames.map(f=>(
          <div key={f.id} onClick={()=>setSelectedFrame(f.id)} style={{fontSize:12,padding:"7px 10px",borderRadius:6,marginBottom:3,cursor:"pointer",color:selectedFrame===f.id?"rgba(0,0,0,0.9)":"rgba(0,0,0,0.4)",background:selectedFrame===f.id?C.purpleBg:"transparent",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span>{f.label}</span>
            {"reqs" in f&&f.reqs&&<span style={{fontSize:10,color:C.purpleLight}}>●</span>}
          </div>
        ))}
        <div style={{borderTop:`1px solid ${C.border}`,marginTop:16,paddingTop:16}}>
          <div style={{fontSize:11,fontWeight:600,color:C.textDim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,padding:"0 6px"}}>Connected</div>
          <div style={{fontSize:11,padding:"5px 10px",display:"flex",alignItems:"center",gap:6,color:C.textMuted}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:C.green}}/>
            figma.com/checkout-v3
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{flex:1,background:"rgba(0,0,0,0.01)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",top:14,left:16,fontSize:11,color:C.textDim}}>Payment Step · 1440×900</div>
        {/* Wireframe */}
        <div style={{background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:8,width:580,padding:"24px 28px",fontFamily:"Inter,sans-serif",boxShadow:"0 2px 16px rgba(0,0,0,0.06)"}}>
          {/* Progress bar */}
          <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:24,justifyContent:"center"}}>
            {["Cart","Shipping","Payment","Confirm"].map((s,i)=>(
              <div key={s} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:i<2?C.green:i===2?C.purple:"rgba(0,0,0,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"white",fontWeight:600}}>{i<2?"✓":i+1}</div>
                <span style={{fontSize:10,color:i===2?"rgba(0,0,0,0.8)":"rgba(0,0,0,0.3)",fontWeight:i===2?600:400}}>{s}</span>
                {i<3&&<div style={{width:20,height:1,background:"rgba(0,0,0,0.15)"}}/>}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:20}}>
            {/* Left: Payment form */}
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:"rgba(0,0,0,0.6)",marginBottom:12}}>Payment method</div>
              {/* Wallet buttons — R2 */}
              <div style={{background:"rgba(87,70,232,0.06)",border:"1px solid rgba(87,70,232,0.15)",borderRadius:6,padding:"6px 8px",marginBottom:4,display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:C.purpleLight}}/>
                <span style={{fontSize:10,color:C.purpleLight,fontWeight:500}}>R2</span>
                <div style={{flex:1,background:"#000",borderRadius:5,padding:"8px 14px",textAlign:"center",fontSize:11,color:"white",fontWeight:500}}>🍎 Apple Pay</div>
              </div>
              <div style={{background:"rgba(87,70,232,0.06)",border:"1px solid rgba(87,70,232,0.15)",borderRadius:6,padding:"6px 8px",marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:C.purpleLight}}/>
                <span style={{fontSize:10,color:C.purpleLight,fontWeight:500}}>R2</span>
                <div style={{flex:1,background:"white",borderRadius:5,padding:"8px 14px",textAlign:"center",fontSize:11,color:"#000",fontWeight:500}}>G Pay</div>
              </div>
              <div style={{fontSize:11,color:C.textDim,textAlign:"center",marginBottom:12}}>— or pay by card —</div>
              {/* Card form */}
              {[{ph:"Card number",w:"100%"},{ph:"MM / YY",w:"48%"},{ph:"CVV",w:"48%"}].map(f=>(
                <div key={f.ph} style={{width:f.w,display:"inline-block",marginRight:f.w==="48%"?"4%":"0",marginBottom:8}}>
                  <div style={{background:"rgba(0,0,0,0.05)",border:`1px solid ${C.border}`,borderRadius:5,padding:"9px 11px",fontSize:11,color:C.textDim}}>{f.ph}</div>
                </div>
              ))}
              {/* Trust badges — R3 */}
              <div style={{background:"rgba(87,70,232,0.05)",border:"1px solid rgba(87,70,232,0.1)",borderRadius:6,padding:"6px 8px",marginTop:4,display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:C.purpleLight}}/>
                <span style={{fontSize:10,color:C.purpleLight,fontWeight:500}}>R3</span>
                <div style={{display:"flex",gap:8,alignItems:"center",flex:1,justifyContent:"center"}}>
                  {["🔒 SSL","✓ PCI DSS","↩ 30-day returns"].map(b=><span key={b} style={{fontSize:10,color:C.textDim}}>{b}</span>)}
                </div>
              </div>
            </div>
            {/* Right: Order summary */}
            <div style={{width:180,flexShrink:0}}>
              <div style={{fontSize:12,fontWeight:600,color:"rgba(0,0,0,0.6)",marginBottom:12}}>Order summary</div>
              <div style={{background:"rgba(0,0,0,0.03)",border:`1px solid ${C.border}`,borderRadius:6,padding:"12px"}}>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <div style={{width:32,height:32,background:"rgba(0,0,0,0.06)",borderRadius:4,flexShrink:0}}/>
                  <div><div style={{fontSize:11,color:"rgba(0,0,0,0.6)"}}>Premium Plan</div><div style={{fontSize:11,color:C.textDim}}>×1</div></div>
                  <span style={{marginLeft:"auto",fontSize:11,color:"rgba(0,0,0,0.6)"}}>$49</span>
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:4}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:C.textDim}}>Subtotal</span><span style={{fontSize:11,color:C.textMuted}}>$49.00</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,color:C.textDim}}>Tax</span><span style={{fontSize:11,color:C.textMuted}}>$4.41</span></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,fontWeight:600,color:C.text}}>Total</span><span style={{fontSize:12,fontWeight:600,color:C.text}}>$53.41</span></div>
                </div>
                {/* R5 */}
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:5,height:5,borderRadius:"50%",background:C.purpleLight}}/><span style={{fontSize:9,color:C.purpleLight}}>R5</span></div>
                  <div style={{fontSize:10,color:C.textDim,marginTop:3}}>Est. delivery: Mar 20–22</div>
                </div>
              </div>
              <button style={{width:"100%",marginTop:10,padding:"10px",background:C.purple,border:"none",borderRadius:6,color:"white",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Pay now</button>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements panel */}
      <div style={{width:240,borderLeft:`1px solid ${C.border}`,padding:"16px 14px",flexShrink:0,overflowY:"auto"}}>
        <div style={{fontSize:11,fontWeight:600,color:C.textDim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Linked Requirements</div>
        {["R2","R3","R5","R6"].map(id=>{
          const req=REQS.find(r=>r.id===id);
          if(!req) return null;
          return (
            <div key={id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 11px",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontSize:10,fontWeight:700,color:C.purpleLight}}>{id}</span>
                <span style={{fontSize:9,padding:"1px 4px",background:`${pc(req.priority)}18`,color:pc(req.priority),borderRadius:3}}>{req.priority}</span>
              </div>
              <p style={{fontSize:11,color:C.textMuted,lineHeight:1.45}}>{req.title}</p>
            </div>
          );
        })}
        <div style={{borderTop:`1px solid ${C.border}`,marginTop:16,paddingTop:14}}>
          <div style={{fontSize:11,color:C.textDim,marginBottom:8}}>Design gaps</div>
          <div style={{background:"rgba(245,180,69,0.06)",border:"1px solid rgba(180,83,9,0.15)",borderRadius:7,padding:"9px 11px"}}>
            <p style={{fontSize:11,color:"rgba(245,180,69,0.8)",lineHeight:1.5}}>R1 (guest checkout) has no corresponding frame in Figma yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ VERSION HISTORY PANEL ══ */
function VersionHistoryPanel({ onClose }: { onClose: () => void }) {
  const [restored, setRestored] = useState<string|null>(null);
  const versions = [
    { id:"v4", label:"Current version", time:"2 min ago", changes:"R4 conflict resolved — scoped to auth users", author:"AK", tag:"latest" },
    { id:"v3", time:"1 hour ago", changes:"Added R7 (abandoned cart) and R8 (A/B test)", author:"AK" },
    { id:"v2", time:"3 hours ago", changes:"AI-generated initial PRD structure", author:"AI" },
    { id:"v1", time:"3 hours ago", changes:"Project created from idea prompt", author:"AK" },
  ];
  return (
    <div style={{width:280,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"100%",flexShrink:0}}>
      <div style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <span style={{fontSize:13,fontWeight:500,color:"rgba(0,0,0,0.7)"}}>Version History</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:18}}>×</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 14px"}}>
        {versions.map((v,i)=>(
          <div key={v.id} style={{marginBottom:16,position:"relative"}}>
            {i<versions.length-1&&<div style={{position:"absolute",left:7,top:22,width:1,height:"calc(100% + 4px)",background:`1px solid ${C.border}`,borderLeft:`1px solid ${C.border}`}}/>}
            <div style={{display:"flex",gap:10}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:i===0?C.purple:"rgba(0,0,0,0.1)",border:`1px solid ${i===0?C.purple:C.border}`,flexShrink:0,marginTop:2}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:i===0?600:400,color:i===0?C.text:"rgba(0,0,0,0.6)"}}>{v.label||v.id}</span>
                  {v.tag&&<span style={{fontSize:9,background:"rgba(62,207,142,0.15)",color:C.green,borderRadius:3,padding:"1px 5px"}}>{v.tag}</span>}
                </div>
                <p style={{fontSize:11,color:C.textMuted,lineHeight:1.5,marginBottom:5}}>{v.changes}</p>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:10,color:C.textDim}}>{v.time}</span>
                  <span style={{fontSize:10,color:C.textDim}}>·</span>
                  <span style={{fontSize:10,color:C.textDim}}>{v.author==="AI"?"✨ AI generated":`@${v.author}`}</span>
                </div>
                {i>0&&<button onClick={()=>setRestored(v.id)} style={{marginTop:7,fontSize:11,padding:"3px 9px",background:restored===v.id?"rgba(62,207,142,0.12)":"rgba(0,0,0,0.05)",border:`1px solid ${restored===v.id?"rgba(62,207,142,0.25)":C.border}`,borderRadius:5,color:restored===v.id?C.green:C.textDim,cursor:"pointer",fontFamily:"inherit"}}>{restored===v.id?"✓ Restored":"Restore →"}</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══ SIDEBAR ══ */
function Sidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (t: string) => void }) {
  return (
    <div style={{width:196,borderRight:`1px solid ${C.border}`,padding:"13px 10px 16px",display:"flex",flexDirection:"column",gap:3,flexShrink:0,overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"3px 8px",marginBottom:18}}>
        <a href="/dashboard" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
          <VLogo size={22}/><span style={{fontSize:14,fontWeight:600,color:C.text,letterSpacing:"-0.2px"}}>Vantage</span>
        </a>
      </div>
      <SL>Projects</SL>
      {[{name:"Checkout redesign",active:true},{name:"Onboarding v2",active:false},{name:"Mobile notifications",active:false}].map(p=>(
        <div key={p.name} style={{fontSize:12,padding:"6px 9px",borderRadius:6,color:p.active?"rgba(0,0,0,0.85)":"rgba(0,0,0,0.3)",background:p.active?C.purpleBg:"transparent",cursor:"pointer",lineHeight:1.4}}>{p.name}</div>
      ))}
      <div style={{borderTop:`1px solid ${C.border}`,margin:"10px 0 6px"}}/>
      <SL>Views</SL>
      {[{k:"prd",l:"PRD"},{k:"tickets",l:"Tickets"},{k:"research",l:"Research"},{k:"figma",l:"Figma"},{k:"integrations",l:"Integrations"},{k:"metrics",l:"Metrics"}].map(v=>(
        <div key={v.k} onClick={()=>onTabChange(v.k)} style={{fontSize:12,padding:"6px 9px",borderRadius:6,color:activeTab===v.k?"rgba(0,0,0,0.9)":"rgba(0,0,0,0.35)",background:activeTab===v.k?C.purpleBg:"transparent",cursor:"pointer",fontWeight:activeTab===v.k?500:400,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span>{v.l}</span>
          {v.k==="figma"&&<span style={{fontSize:9,color:C.purpleLight,background:"rgba(139,127,245,0.15)",borderRadius:3,padding:"1px 4px"}}>V1</span>}
          {v.k==="integrations"&&<span style={{fontSize:9,color:C.green,background:"rgba(62,207,142,0.12)",borderRadius:3,padding:"1px 4px"}}>4 MVP</span>}
          {v.k==="metrics"&&<span style={{fontSize:9,color:C.green,background:"rgba(5,150,105,0.1)",borderRadius:3,padding:"1px 4px"}}>Live</span>}
        </div>
      ))}
      <div style={{flex:1}}/>
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:13,marginTop:8}}>
        <SL>Context</SL>
        {["stripe.com","figma/checkout-v3","amplitude.com"].map(s=>(
          <div key={s} style={{fontSize:11,padding:"3px 8px",color:"rgba(0,0,0,0.3)",display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:C.green,flexShrink:0}}/>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s}</span>
          </div>
        ))}
        <div style={{marginTop:10,padding:"0 8px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:10,color:C.textDim}}>Coverage</span>
            <span style={{fontSize:10,color:"rgba(62,207,142,0.75)"}}>87%</span>
          </div>
          <div style={{height:3,background:"rgba(0,0,0,0.07)",borderRadius:2}}>
            <div style={{height:"100%",width:"87%",background:`linear-gradient(90deg,${C.green},rgba(62,207,142,0.45))`,borderRadius:2}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function SL({ children }: { children: React.ReactNode }) {
  return <p style={{fontSize:10,color:C.textDim,textTransform:"uppercase",letterSpacing:"0.09em",padding:"0 8px",marginBottom:5,marginTop:2}}>{children}</p>;
}

function VLogo({ size }: { size: number }) {
  return (
    <div style={{width:size,height:size,borderRadius:Math.round(size*0.22),background:C.purple,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <svg width={size*0.6} height={size*0.6} viewBox="0 0 16 16" fill="none">
        <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.5 9H10.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

/* ══ TICKETS TAB CONTENT (Board + Progress toggle) ══ */
function TicketsTabContent({ selectedTicket, onTicketClick, onClearTicket }: { selectedTicket:Ticket|null; onTicketClick:(t:Ticket)=>void; onClearTicket:()=>void }) {
  const [view, setView] = useState<"board"|"progress">("board");
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Sub-nav */}
      <div style={{padding:"10px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        {([{k:"board",l:"Board"},{k:"progress",l:"Progress"}] as const).map(v=>(
          <button key={v.k} onClick={()=>{setView(v.k);if(v.k==="progress")onClearTicket();}} style={{fontSize:12,padding:"4px 12px",borderRadius:6,background:view===v.k?C.purpleBg:"transparent",border:`1px solid ${view===v.k?C.purpleBorder:"transparent"}`,color:view===v.k?C.purpleLight:C.textDim,cursor:"pointer",fontFamily:"inherit",fontWeight:view===v.k?500:400}}>
            {v.l}
          </button>
        ))}
        <span style={{fontSize:11,color:C.textDim,marginLeft:8}}>{view==="board"?"Drag to move across waves · Click to see agent prompt":"Sprint tracking for stakeholders"}</span>
      </div>
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {view==="board"&&<><TicketsBoard onTicketClick={onTicketClick} selectedId={selectedTicket?.id??null}/>{selectedTicket&&<TicketDetail ticket={selectedTicket} onClose={onClearTicket}/>}</>}
        {view==="progress"&&<ProgressView/>}
      </div>
    </div>
  );
}

/* ══ METRICS VIEW — Telemetry Loop ══ */

const TELEMETRY_QUERIES: Record<string, {
  kpis: { label:string; value:string; delta:string; good:boolean; sub:string }[];
  charts: { title:string; type:"area"|"bar"; color:string; data:Record<string,string|number>[] }[];
}> = {
  conversion: {
    kpis:[
      {label:"Completion rate",value:"81%",delta:"+15pp",good:true,sub:"vs 66% pre-launch"},
      {label:"Avg checkout time",value:"2.1 min",delta:"−50%",good:true,sub:"was 4.2 min"},
      {label:"Mobile conversion",value:"67%",delta:"+26pp",good:true,sub:"desktop 91%"},
    ],
    charts:[
      {title:"Checkout conversion rate — last 14 days",type:"area",color:"#5746E8",data:[
        {d:"Mar 3",v:62},{d:"Mar 5",v:65},{d:"Mar 7",v:68},{d:"Mar 9",v:71},{d:"Mar 11",v:74},{d:"Mar 13",v:76},{d:"Mar 15",v:79},{d:"Mar 17",v:81},
      ]},
      {title:"Conversion by device",type:"bar",color:"#5746E8",data:[
        {d:"Desktop",v:91},{d:"Mobile",v:67},{d:"Tablet",v:58},
      ]},
    ],
  },
  abandonment: {
    kpis:[
      {label:"Cart abandonment",value:"19%",delta:"−15pp",good:true,sub:"was 34%"},
      {label:"Payment drop-off",value:"8%",delta:"−9pp",good:true,sub:"biggest gain"},
      {label:"Shipping step",value:"9%",delta:"−3pp",good:true,sub:"still highest risk"},
    ],
    charts:[
      {title:"Abandonment rate trend — 5 weeks",type:"area",color:"#dc2626",data:[
        {d:"W-5",v:36},{d:"W-4",v:34},{d:"W-3",v:28},{d:"W-2",v:23},{d:"W-1",v:20},{d:"Now",v:19},
      ]},
      {title:"Drop-off by checkout step (%)",type:"bar",color:"#b45309",data:[
        {d:"Cart",v:5},{d:"Shipping",v:9},{d:"Payment",v:8},{d:"Confirm",v:3},
      ]},
    ],
  },
  wallet: {
    kpis:[
      {label:"Apple Pay adoption",value:"24%",delta:"+24pp",good:true,sub:"of completions"},
      {label:"Google Pay",value:"11%",delta:"+11pp",good:true,sub:"of completions"},
      {label:"Card payments",value:"59%",delta:"−35pp",good:true,sub:"shifting to wallets"},
    ],
    charts:[
      {title:"Wallet adoption growth — weekly",type:"area",color:"#059669",data:[
        {d:"Week 1",v:0},{d:"Week 2",v:12},{d:"Week 3",v:21},{d:"Week 4",v:31},{d:"Week 5",v:35},
      ]},
      {title:"Payment method split (%)",type:"bar",color:"#5746E8",data:[
        {d:"Card",v:59},{d:"Apple Pay",v:24},{d:"Google Pay",v:11},{d:"Other",v:6},
      ]},
    ],
  },
  default: {
    kpis:[
      {label:"Active users (7d)",value:"1,840",delta:"+48%",good:true,sub:"vs prev week"},
      {label:"Sessions → purchase",value:"25%",delta:"+8pp",good:true,sub:"funnel rate"},
      {label:"Avg session",value:"3.4 min",delta:"−0.8 min",good:true,sub:"faster checkout"},
    ],
    charts:[
      {title:"Weekly active users",type:"area",color:"#5746E8",data:[
        {d:"W-5",v:1240},{d:"W-4",v:1380},{d:"W-3",v:1520},{d:"W-2",v:1710},{d:"W-1",v:1840},
      ]},
      {title:"Funnel events — last 7 days (%)",type:"bar",color:"#059669",data:[
        {d:"Page view",v:100},{d:"Add to cart",v:44},{d:"Checkout",v:31},{d:"Purchase",v:25},
      ]},
    ],
  },
};

function getQueryKey(q:string):string {
  const l=q.toLowerCase();
  if(/conversion|completion|checkout rate/.test(l)) return "conversion";
  if(/abandon|drop.?off/.test(l)) return "abandonment";
  if(/apple.?pay|google.?pay|wallet|payment method/.test(l)) return "wallet";
  if(/revenue|stripe|gmv|cost/.test(l)) return "no_data:Revenue data requires a Stripe webhook integration.";
  if(/bug|qa|error|crash|sentry/.test(l)) return "no_data:QA error tracking requires Sentry or Datadog.";
  return "default";
}

const TICKET_PROGRESS = [
  {wave:"Wave 1 · Foundation",done:2,total:2,pts:5,ptsDone:5,status:"done"},
  {wave:"Wave 2 · Payment",done:1,total:3,pts:11,ptsDone:5,status:"active"},
  {wave:"Wave 3 · Conversion",done:0,total:4,pts:10,ptsDone:0,status:"upcoming"},
];

function MetricsView() {
  const [input, setInput] = useState("");
  const [queryKey, setQueryKey] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const suggestions = [
    "Show checkout conversion","What's our cart abandonment?",
    "Show Apple Pay adoption","Revenue this sprint","QA error rate",
  ];

  function runQuery(q:string) {
    if(!q.trim()) return;
    setLoading(true); setQueryKey(null); setTicketCreated(false);
    setTimeout(()=>{ setQueryKey(getQueryKey(q)); setLoading(false); }, 1400);
  }

  const isNoData = queryKey?.startsWith("no_data:");
  const noDataMsg = isNoData ? queryKey!.split(":").slice(1).join(":") : "";
  const data = (!isNoData && queryKey) ? (TELEMETRY_QUERIES[queryKey] ?? TELEMETRY_QUERIES.default) : null;

  const CustomTooltip = ({ active, payload, label }: { active?:boolean; payload?:{value:number}[]; label?:string }) => {
    if(active && payload && payload.length) return (
      <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
        <p style={{color:C.textDim,margin:"0 0 2px"}}>{label}</p>
        <p style={{color:C.text,fontWeight:600,margin:0}}>{payload[0].value}{typeof payload[0].value==="number"&&payload[0].value<=100?"%":""}</p>
      </div>
    );
    return null;
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",background:"#f7f7f8"}}>
      {/* Query bar */}
      <div style={{padding:"16px 24px 12px",borderBottom:`1px solid ${C.border}`,background:"#ffffff",flexShrink:0}}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <div style={{position:"relative",flex:1}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,pointerEvents:"none"}}>🔍</span>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runQuery(input)} placeholder="Ask anything — e.g. Show checkout conversion by device…" style={{width:"100%",padding:"10px 14px 10px 36px",fontSize:13,color:C.text,background:"#fafafa",border:`1px solid ${C.border}`,borderRadius:10,fontFamily:"inherit",boxSizing:"border-box"}} onFocus={e=>{e.currentTarget.style.borderColor="rgba(87,70,232,0.45)";e.currentTarget.style.background="#fff";}} onBlur={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="#fafafa";}}/>
          </div>
          <button onClick={()=>runQuery(input)} style={{padding:"10px 20px",background:"linear-gradient(135deg,#5746E8,#7C5FF5)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:500,whiteSpace:"nowrap",boxShadow:"0 2px 8px rgba(87,70,232,0.25)"}}>Generate dashboard</button>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {suggestions.map(s=>(
            <button key={s} onClick={()=>{setInput(s);runQuery(s);}} style={{fontSize:11,padding:"4px 12px",background:"rgba(0,0,0,0.04)",border:`1px solid ${C.border}`,borderRadius:20,color:C.textMuted,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(87,70,232,0.07)";e.currentTarget.style.color=C.purple;e.currentTarget.style.borderColor="rgba(87,70,232,0.25)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,0,0,0.04)";e.currentTarget.style.color=C.textMuted;e.currentTarget.style.borderColor=C.border;}}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{flex:1,overflowY:"auto",padding:"24px"}}>

        {/* Always-visible: ticket progress strip */}
        <div style={{background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 22px",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div>
              <span style={{fontSize:13,fontWeight:600,color:C.text}}>Sprint progress</span>
              <span style={{fontSize:11,color:C.textDim,marginLeft:10}}>Checkout Redesign · Week 3 of 5</span>
            </div>
            <div style={{display:"flex",gap:16}}>
              {[{l:"Done",v:"3",c:C.green},{l:"In progress",v:"2",c:C.purple},{l:"Blocked",v:"1",c:C.red},{l:"Remaining",v:"3",c:C.textDim}].map(s=>(
                <div key={s.l} style={{textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:s.c,letterSpacing:"-0.5px"}}>{s.v}</div>
                  <div style={{fontSize:10,color:C.textDim}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {TICKET_PROGRESS.map(w=>{
              const pct=(w.done/w.total)*100;
              const wc=w.status==="done"?C.green:w.status==="active"?C.purple:"rgba(0,0,0,0.12)";
              return (
                <div key={w.wave} style={{display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontSize:11,color:C.textMuted,width:170,flexShrink:0}}>{w.wave}</span>
                  <div style={{flex:1,height:6,background:"rgba(0,0,0,0.05)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:w.status==="done"?"linear-gradient(90deg,#059669,#34d399)":w.status==="active"?"linear-gradient(90deg,#5746E8,#9B72F5)":"transparent",borderRadius:3,transition:"width 0.6s ease"}}/>
                  </div>
                  <span style={{fontSize:11,color:wc,fontWeight:500,width:80,textAlign:"right",flexShrink:0}}>{w.done}/{w.total} tickets · {w.ptsDone}pts</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* KPI cards — always visible */}
        {!loading&&!queryKey&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            {[
              {label:"Checkout completion",value:"81%",delta:"+15pp",sub:"vs 66% pre-launch",grad:"linear-gradient(135deg,#5746E8 0%,#9B72F5 100%)"},
              {label:"Cart abandonment",value:"19%",delta:"−15pp",sub:"was 34%",grad:"linear-gradient(135deg,#059669 0%,#34d399 100%)"},
              {label:"Apple Pay adoption",value:"31%",delta:"+31pp",sub:"of all checkouts",grad:"linear-gradient(135deg,#b45309 0%,#f59e0b 100%)"},
            ].map(k=>(
              <div key={k.label} style={{background:k.grad,borderRadius:14,padding:"20px 22px",color:"#fff",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>
                <div style={{fontSize:11,opacity:0.8,marginBottom:10}}>{k.label}</div>
                <div style={{fontSize:32,fontWeight:700,letterSpacing:"-1px",marginBottom:4}}>{k.value}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,fontWeight:600,background:"rgba(255,255,255,0.2)",padding:"2px 8px",borderRadius:20}}>{k.delta}</span>
                  <span style={{fontSize:11,opacity:0.7}}>{k.sub}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Query result KPIs */}
        {!loading&&data&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            {data.kpis.map(k=>(
              <div key={k.label} style={{background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:k.good?"linear-gradient(90deg,#5746E8,#9B72F5)":"linear-gradient(90deg,#dc2626,#f87171)",borderRadius:"14px 14px 0 0"}}/>
                <div style={{fontSize:11,color:C.textDim,marginBottom:10,marginTop:2}}>{k.label}</div>
                <div style={{fontSize:28,fontWeight:700,color:C.text,letterSpacing:"-0.8px",marginBottom:6}}>{k.value}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,fontWeight:600,color:k.good?C.green:C.red,background:k.good?"rgba(5,150,105,0.08)":"rgba(220,38,38,0.08)",padding:"2px 8px",borderRadius:20}}>{k.delta}</span>
                  <span style={{fontSize:11,color:C.textDim}}>{k.sub}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 0",gap:14}}>
            <div style={{display:"flex",gap:7}}>{[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:C.purple,animation:`vpulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>
            <p style={{fontSize:13,color:C.textMuted}}>Querying connected data sources…</p>
          </div>
        )}

        {/* Recharts */}
        {!loading&&data&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {data.charts.map((chart,i)=>(
              <div key={i} style={{background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:16}}>{chart.title}</div>
                <ResponsiveContainer width="100%" height={180}>
                  {chart.type==="area"?(
                    <AreaChart data={chart.data} margin={{top:4,right:4,bottom:0,left:-24}}>
                      <defs>
                        <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chart.color} stopOpacity={0.15}/>
                          <stop offset="95%" stopColor={chart.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
                      <XAxis dataKey="d" tick={{fontSize:10,fill:C.textDim as string}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:C.textDim as string}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Area type="monotone" dataKey="v" stroke={chart.color} strokeWidth={2.5} fill={`url(#grad${i})`} dot={{fill:chart.color,r:3,strokeWidth:0}} activeDot={{r:5,strokeWidth:0}}/>
                    </AreaChart>
                  ):(
                    <BarChart data={chart.data} margin={{top:4,right:4,bottom:0,left:-24}} barSize={28}>
                      <defs>
                        <linearGradient id={`bgrad${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chart.color} stopOpacity={0.9}/>
                          <stop offset="100%" stopColor={chart.color} stopOpacity={0.5}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
                      <XAxis dataKey="d" tick={{fontSize:10,fill:C.textDim as string}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:C.textDim as string}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="v" fill={`url(#bgrad${i})`} radius={[4,4,0,0]}/>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}

        {/* No data */}
        {!loading&&isNoData&&(
          <div style={{maxWidth:500,margin:"0 auto",paddingTop:8}}>
            <div style={{background:"rgba(220,38,38,0.04)",border:"1px solid rgba(220,38,38,0.12)",borderRadius:14,padding:"22px 26px",marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:600,color:C.red,marginBottom:8}}>Data not tracked yet</div>
              <p style={{fontSize:13,color:C.textMuted,lineHeight:1.65,margin:0}}>{noDataMsg}</p>
            </div>
            {!ticketCreated?(
              <button onClick={()=>setTicketCreated(true)} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#5746E8,#7C5FF5)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:500,boxShadow:"0 4px 12px rgba(87,70,232,0.2)"}}>
                Create tracking ticket for engineering →
              </button>
            ):(
              <div style={{background:"rgba(5,150,105,0.06)",border:"1px solid rgba(5,150,105,0.2)",borderRadius:12,padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.green}}>Ticket created — VAN-010</div>
                  <div style={{fontSize:11,color:C.textDim,marginTop:2}}>Add analytics tracking · Assigned to Engineering · Wave 4</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══ WORKSPACE CONTENT ══ */
function WorkspaceContent() {
  const searchParams = useSearchParams();
  const idea = searchParams.get("idea") || "Redesign the checkout flow to reduce payment drop-off";

  const [phase, setPhase] = useState<"generating"|"workspace">("generating");
  const [activeTab, setActiveTab] = useState("prd");
  const [ticketsState, setTicketsState] = useState<"idle"|"generating"|"done">("idle");
  const [selectedTicket, setSelectedTicket] = useState<Ticket|null>(null);
  const [conflictReq, setConflictReq] = useState<Req|null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [linearConnected, setLinearConnected] = useState(false);
  const [insertedReqs, setInsertedReqs] = useState<string[]>([]);
  const [flashReqId, setFlashReqId] = useState<string|null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role:"user", text:"What do top checkout flows do to reduce abandonment?" },
    { role:"ai", text:"Baymard 2024 found **69.8% average cart abandonment**. The single biggest driver: **forced account creation** causes 24% of users to abandon at that step.\n\nCheckouts with ≤3 steps outperform 5+ step flows by **3×**. Adding guest checkout increases completion by 23–35%.", cites:[{n:1,label:"Baymard Institute 2024"},{n:2,label:"Stripe Checkout Study 2023"}], insertReq:"R1" },
  ]);

  function handleQuery(q: string) {
    setMessages(prev=>[...prev,{role:"user",text:q}]);
    setQueryLoading(true);
    setTimeout(()=>{ const r=getQueryResponse(q); setMessages(prev=>[...prev,{role:"ai",text:r.text,cites:r.cites,insertReq:r.insertReq}]); setQueryLoading(false); }, 1700);
  }

  function handleInsert(reqId: string) {
    setInsertedReqs(prev=>prev.includes(reqId)?prev:[...prev,reqId]);
    setActiveTab("prd");
    setTimeout(()=>{ setFlashReqId(reqId); setTimeout(()=>setFlashReqId(null),2200); },80);
  }

  function handleGenerateTickets() {
    setTicketsState("generating");
    setActiveTab("tickets");
    setTimeout(()=>setTicketsState("done"),2400);
  }

  if (phase==="generating") return <GeneratingScreen idea={idea} onDone={()=>setPhase("workspace")}/>;

  const totalTickets = WAVES.reduce((a,w)=>a+w.tickets.length,0);

  return (
    <div style={{height:"100vh",background:C.bg,display:"flex",flexDirection:"column",fontFamily:"Inter,sans-serif",overflow:"hidden"}}>
      {/* Top bar */}
      <div style={{height:47,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",paddingLeft:18,paddingRight:18,gap:14,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <a href="/dashboard" style={{fontSize:12,color:C.textDim,textDecoration:"none",transition:"color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.color=C.textMuted} onMouseLeave={e=>e.currentTarget.style.color=C.textDim}>← Projects</a>
          <span style={{fontSize:12,color:"rgba(0,0,0,0.15)"}}/>/
          <span style={{fontSize:12,color:"rgba(0,0,0,0.75)",fontWeight:500}}>Checkout redesign</span>
        </div>
        <div style={{flex:1}}/>
        <div style={{display:"flex",gap:2}}>
          {[{k:"prd",l:"PRD"},{k:"tickets",l:"Tickets"},{k:"research",l:"Research"},{k:"figma",l:"Figma"},{k:"integrations",l:"Integrations"},{k:"metrics",l:"Metrics"}].map(t=>(
            <button key={t.k} onClick={()=>setActiveTab(t.k)} style={{fontSize:12,padding:"5px 11px",borderRadius:7,background:activeTab===t.k?C.purpleBg:"transparent",border:`1px solid ${activeTab===t.k?C.purpleBorder:"transparent"}`,color:activeTab===t.k?C.purpleLight:C.textDim,cursor:"pointer",fontFamily:"inherit",fontWeight:activeTab===t.k?500:400,transition:"all 0.15s"}}>{t.l}</button>
          ))}
        </div>
        <div style={{flex:1}}/>
        {/* Multiplayer */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center"}}>
            {[{i:"AK",c:"rgba(100,86,230,0.35)"},{i:"SR",c:"rgba(249,115,22,0.3)"},{i:"TM",c:"rgba(62,207,142,0.3)"}].map((a,i)=>(
              <div key={a.i} title={a.i==="AK"?"You":a.i} style={{width:26,height:26,borderRadius:"50%",background:a.c,border:`2px solid ${C.bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,color:C.textMuted,marginLeft:i===0?0:-6,position:"relative",zIndex:3-i,cursor:"default"}}>{a.i}</div>
            ))}
          </div>
          <span style={{fontSize:11,color:C.textDim}}>3 online</span>
          <button onClick={()=>setShowVersionHistory(v=>!v)} style={{fontSize:11,padding:"4px 10px",background:showVersionHistory?C.purpleBg:"rgba(0,0,0,0.05)",border:`1px solid ${showVersionHistory?C.purpleBorder:C.border}`,borderRadius:6,color:showVersionHistory?C.purpleLight:C.textDim,cursor:"pointer",fontFamily:"inherit",marginLeft:4}}>History</button>
        </div>
      </div>

      {/* Body */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab}/>
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {activeTab==="prd"&&(
            <>
              <PRDEditor insertedReqs={insertedReqs} flashReqId={flashReqId} onConflictClick={setConflictReq} onGenerateTickets={handleGenerateTickets} ticketsState={ticketsState} onExport={()=>setShowExport(true)}/>
              <QueryPanel messages={messages} onSend={handleQuery} loading={queryLoading} onInsert={handleInsert}/>
            </>
          )}
          {activeTab==="tickets"&&(
            <>
              {ticketsState==="generating"&&<TicketsGeneratingOverlay/>}
              {ticketsState==="idle"&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}><p style={{fontSize:14,color:C.textMuted,marginBottom:8}}>No tickets yet</p><p style={{fontSize:12,color:C.textDim,marginBottom:22}}>Go to the PRD tab and click "Generate Tickets"</p><button onClick={()=>setActiveTab("prd")} style={{fontSize:13,padding:"8px 18px",background:C.purple,border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Go to PRD →</button></div>}
              {ticketsState==="done"&&<TicketsTabContent selectedTicket={selectedTicket} onTicketClick={t=>setSelectedTicket(prev=>prev?.id===t.id?null:t)} onClearTicket={()=>setSelectedTicket(null)}/>}
            </>
          )}
          {activeTab==="research"&&<ResearchView messages={messages} onSend={handleQuery} loading={queryLoading} onInsert={handleInsert}/>}
          {activeTab==="figma"&&<FigmaView/>}
          {activeTab==="integrations"&&<IntegrationsView linearConnected={linearConnected} onLinearConnect={()=>setLinearConnected(true)}/>}
          {activeTab==="metrics"&&<MetricsView/>}
        </div>
        {showVersionHistory&&(activeTab==="prd"||activeTab==="tickets")&&<VersionHistoryPanel onClose={()=>setShowVersionHistory(false)}/>}
      </div>

      {conflictReq&&<ConflictModal req={conflictReq} onClose={()=>setConflictReq(null)}/>}
      {showExport&&<ExportModal onClose={()=>setShowExport(false)} ticketCount={totalTickets}/>}

      <style>{`
        @keyframes vpulse { 0%,100%{transform:scale(0.7);opacity:0.3} 50%{transform:scale(1.15);opacity:1} }
        ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.1);border-radius:2px}
        input:focus,button:focus{outline:none}
      `}</style>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div style={{height:"100vh",background:"#fafafa"}}/>}>
      <WorkspaceContent/>
    </Suspense>
  );
}
