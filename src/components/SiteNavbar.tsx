"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Stethoscope, ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Our Story", href: "/our-story" },
];

export function SiteNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "transparent" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: scrolled ? "8px 24px" : "16px 24px", transition: "padding 0.25s ease" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            borderRadius: 16,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
            padding: "0 20px",
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", flexShrink: 0 }}
            onClick={() => router.push("/")}
          >
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #1d1d1f 0%, #3c3c43 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
              <Stethoscope size={15} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.02em" }}>MedFlash AI</span>
          </div>

          {/* Nav links */}
          <div
            className="hidden md:flex"
            style={{ alignItems: "center", gap: 2, background: "rgba(0,0,0,0.04)", borderRadius: 10, padding: "3px" }}
          >
            {navLinks.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <a
                  key={label}
                  href={href}
                  style={{
                    fontSize: 13,
                    color: active ? "#09090b" : "#52525b",
                    textDecoration: "none",
                    fontWeight: active ? 600 : 500,
                    padding: "5px 14px",
                    borderRadius: 7,
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                    background: active ? "rgba(255,255,255,0.9)" : "transparent",
                    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.9)";
                      e.currentTarget.style.color = "#09090b";
                      e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#52525b";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  {label}
                </a>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {!user && (
              <button
                onClick={() => router.push("/auth")}
                style={{ height: 34, padding: "0 16px", borderRadius: 9, background: "transparent", color: "#52525b", fontSize: 13, fontWeight: 500, border: "1px solid rgba(0,0,0,0.1)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#09090b"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#52525b"; }}
              >
                Sign in
              </button>
            )}
            <button
              onClick={() => router.push(user ? "/app" : "/auth")}
              style={{ height: 34, padding: "0 18px", borderRadius: 9, background: "#09090b", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.2)", letterSpacing: "-0.01em", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2c2c2e")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#09090b")}
            >
              {user ? (<>Open App <ArrowRight size={13} /></>) : "Get started free"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
