"use client";
import { useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "#" },
      { label: "Roadmap", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Story", href: "/our-story" },
      { label: "Team", href: "/our-story#team" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Step 1 Guide", href: "#" },
      { label: "Step 2 Guide", href: "#" },
      { label: "Study Tips", href: "#" },
      { label: "Anki vs MedFlash", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "HIPAA Compliance", href: "#" },
    ],
  },
];

export function SiteFooter() {
  const router = useRouter();
  return (
    <footer style={{ background: "rgba(255,255,255,0.5)", borderTop: "1px solid rgba(0,0,0,0.06)", padding: "72px 24px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)", gap: 40, marginBottom: 60 }}>
          {/* Brand */}
          <div>
            <div
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, cursor: "pointer" }}
              onClick={() => router.push("/")}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Stethoscope size={16} color="#fff" />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#09090b", letterSpacing: "-0.02em" }}>MedFlash AI</span>
            </div>
            <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.7, maxWidth: 220 }}>
              AI-powered study tools for medical students. Turn any document into a complete learning system.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {["X", "Li", "In"].map((s) => (
                <div key={s} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e4e4e7", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#71717a" }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#09090b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                {col.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{ fontSize: 13, color: "#71717a", textDecoration: "none", fontWeight: 500 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#09090b")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #e4e4e7", paddingTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "#a1a1aa" }}>© 2025 MedFlash AI, Inc. All rights reserved.</p>
          <p style={{ fontSize: 12, color: "#a1a1aa" }}>Made with care for medical students everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
