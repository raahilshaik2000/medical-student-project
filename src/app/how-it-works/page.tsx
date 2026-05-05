"use client";
import { useRouter } from "next/navigation";
import { BlurFade } from "@/components/ui/blur-fade";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import {
  Upload,
  Brain,
  BookOpen,
  ArrowRight,
  GraduationCap,
  FileText,
  Zap,
  Layers,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your source material",
    description: "Drag and drop any PDF — lecture slides, textbook chapters, clinical guidelines, or research papers. We accept files up to 200 pages long.",
    details: [
      "Supports PDF files up to 200 pages",
      "Handles scanned documents and images within PDFs",
      "Multiple files can be added to a single project",
      "Word document and plain text support coming soon",
    ],
  },
  {
    number: "02",
    icon: Brain,
    title: "AI processes your content",
    description: "Our medically-trained AI reads your document, identifies key concepts, clinical correlations, and high-yield information that actually shows up on exams.",
    details: [
      "Powered by Claude — Anthropic's frontier AI model",
      "Fine-tuned for medical and clinical content",
      "Identifies mechanisms, diagnoses, treatments, and differentials",
      "Generates 30–60 cards per 20-page document in under 30 seconds",
    ],
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Study in your preferred format",
    description: "Choose from AI flashcards, board-style MCQ quizzes, spaced repetition sessions, and more. Switch modes anytime — all from the same source.",
    details: [
      "Flip-card mode for active recall",
      "USMLE-style MCQ quiz mode with explanations",
      "Spaced repetition scheduling built in",
      "Clinical vignette practice (coming soon)",
    ],
  },
];

const whyItWorks = [
  {
    icon: Zap,
    title: "Active recall over passive reading",
    description: "Flashcards force your brain to retrieve information, which is 2–3× more effective for retention than re-reading your notes.",
  },
  {
    icon: Clock,
    title: "Spaced repetition scheduling",
    description: "Our SM-2 algorithm shows you cards right before you'd forget them, so every minute of study time is maximally efficient.",
  },
  {
    icon: Layers,
    title: "Your material, not generic content",
    description: "Unlike question banks, MedFlash AI generates content from your actual lecture slides and notes, so it's 100% relevant to your curriculum.",
  },
  {
    icon: Shield,
    title: "Privacy and security first",
    description: "Your documents are encrypted at rest and in transit. We never train AI models on your personal data. Your notes stay yours.",
  },
];

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #eaecf5 0%, #e4e8f2 100%)", color: "#09090b", fontFamily: "var(--font-dm-sans), DM Sans, sans-serif" }}>
      <SiteNavbar />

      {/* Hero */}
      <section style={{ padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <BlurFade delay={0.05}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 100, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#71717a", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <FileText size={12} /> Simple three-step process
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20 }}>
              From PDF to flashcards{" "}
              <span style={{ color: "#71717a" }}>in seconds.</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.15}>
            <p style={{ fontSize: 18, color: "#71717a", lineHeight: 1.7, marginBottom: 36 }}>
              MedFlash AI removes every friction point between you and effective studying. Upload once, study forever.
            </p>
          </BlurFade>
          <BlurFade delay={0.2}>
            <button
              onClick={() => router.push("/auth")}
              style={{ height: 50, padding: "0 32px", borderRadius: 12, background: "#09090b", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.2)", letterSpacing: "-0.01em" }}
            >
              Try it free <ArrowRight size={16} />
            </button>
          </BlurFade>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          {steps.map((step, i) => (
            <BlurFade key={i} delay={0.1 + i * 0.1}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center", background: "#fff", borderRadius: 20, padding: "48px 48px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
                <div>
                  <div style={{ fontSize: 64, fontWeight: 800, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 16 }}>
                    {step.number}
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <step.icon size={24} color="#fff" />
                  </div>
                  <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", marginBottom: 14, lineHeight: 1.2 }}>
                    {step.title}
                  </h2>
                  <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.75 }}>
                    {step.description}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {step.details.map((d, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px", borderRadius: 12, background: "#fafafa", border: "1px solid #f4f4f5" }}>
                      <CheckCircle size={16} color="#09090b" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 14, color: "#52525b", lineHeight: 1.5 }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* Why it works */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <BlurFade delay={0.05}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>The science</div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
                Why MedFlash AI works
              </h2>
              <p style={{ fontSize: 16, color: "#71717a", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
                Every feature is grounded in cognitive science research on how humans actually retain information long-term.
              </p>
            </div>
          </BlurFade>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {whyItWorks.map((item, i) => (
              <BlurFade key={i} delay={0.1 + i * 0.08}>
                <div style={{ background: "#fff", borderRadius: 16, padding: "28px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", height: "100%" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                    <item.icon size={20} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#09090b", marginBottom: 10, letterSpacing: "-0.02em" }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.7 }}>{item.description}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 48px rgba(0,0,0,0.12)", padding: "56px 48px" }}>
            <BlurFade delay={0.05}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f4f4f5", border: "1px solid #e4e4e7", borderRadius: 100, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#71717a", marginBottom: 24 }}>
                <GraduationCap size={12} /> Join 50,000+ medical students
              </div>
            </BlurFade>
            <BlurFade delay={0.1}>
              <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>
                See it in action
              </h2>
            </BlurFade>
            <BlurFade delay={0.15}>
              <p style={{ fontSize: 16, color: "#71717a", marginBottom: 32, lineHeight: 1.7 }}>
                Upload your first PDF in 30 seconds and have a complete study deck before your next lecture ends.
              </p>
            </BlurFade>
            <BlurFade delay={0.2}>
              <button
                onClick={() => router.push("/auth")}
                style={{ height: 50, padding: "0 32px", borderRadius: 12, background: "#09090b", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
              >
                Get started free <ArrowRight size={16} />
              </button>
              <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 14 }}>No credit card required · Free forever plan available</p>
            </BlurFade>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
