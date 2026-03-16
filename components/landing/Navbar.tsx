"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 56,
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        transition: "background 0.2s, border-color 0.2s",
        background: scrolled ? "rgba(8,8,8,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        {/* Logo */}
        <a
          href="/"
          style={{
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "-0.3px",
            color: "#ffffff",
            textDecoration: "none",
          }}
        >
          Vantage
        </a>

        {/* Center nav */}
        <nav
          className="nav-center"
          style={{ display: "flex", gap: 32, alignItems: "center" }}
        >
          {["Features", "Pricing", "Changelog"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a
            href="#"
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: "rgba(255,255,255,0.6)",
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: 8,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >
            Sign in
          </a>
          <a
            href="#waitlist"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#ffffff",
              textDecoration: "none",
              padding: "6px 14px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.13)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            }}
          >
            Get early access
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .nav-center { display: none !important; } }
      `}</style>
    </header>
  );
}
