"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Marquee } from "@/components/ui/marquee";
import { SiteFooter } from "@/components/SiteFooter";
import { NumberTicker } from "@/components/ui/number-ticker";
import { WordRotate } from "@/components/ui/word-rotate";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { DotPattern } from "@/components/ui/dot-pattern";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  FileText,
  Brain,
  Zap,
  BookOpen,
  BarChart3,
  Users,
  Shield,
  Star,
  Menu,
  X,
  Stethoscope,
  Upload,
  Layers,
  Target,
  Clock,
  Sparkles,
  GraduationCap,
  Play,
  Quote,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Testimonial {
  quote: string;
  name: string;
  role: string;
  school: string;
  initials: string;
  color: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const testimonials: Testimonial[] = [
  {
    quote: "I uploaded my entire Robbins pathology notes and had 200 high-yield cards in under 3 minutes. I've never studied this efficiently before Step 1.",
    name: "Priya Nair",
    role: "MS2",
    school: "Johns Hopkins SOM",
    initials: "PN",
    color: "#6366f1",
  },
  {
    quote: "The quiz mode is exactly like board questions. It pulls from my own lecture PDFs and quizzes me on things I actually need to know for my shelf exams.",
    name: "Marcus Webb",
    role: "MS3",
    school: "University of Michigan",
    initials: "MW",
    color: "#0ea5e9",
  },
  {
    quote: "I went from a 220 to a 247 on Step 1. MedFlash AI was my secret weapon. The way it extracts key concepts from dense material is genuinely incredible.",
    name: "Anika Sharma",
    role: "MS3",
    school: "Stanford School of Medicine",
    initials: "AS",
    color: "#10b981",
  },
  {
    quote: "My study group uses this together. We upload the same PDFs and quiz each other with the generated questions. It's replaced our old Anki workflow completely.",
    name: "David Kim",
    role: "MS2",
    school: "UCSF School of Medicine",
    initials: "DK",
    color: "#f59e0b",
  },
  {
    quote: "As a DO student balancing two curriculums, I needed something that could keep up with my material. MedFlash processes anything, including hand-written notes scanned to PDF.",
    name: "Jess Ramirez",
    role: "OMS2",
    school: "Touro College of Osteopathic Medicine",
    initials: "JR",
    color: "#ec4899",
  },
  {
    quote: "I'm a visual learner and the flashcard format is perfect. The AI actually understands clinical context. It doesn't just copy sentences, it synthesizes concepts.",
    name: "Ethan Park",
    role: "MS1",
    school: "Mayo Clinic Alix SOM",
    initials: "EP",
    color: "#8b5cf6",
  },
  {
    quote: "Every clerkship I rotate through, I upload the department's handout PDFs and generate a study deck on day one. It's become a non-negotiable part of my routine.",
    name: "Lauren Osei",
    role: "MS4",
    school: "Harvard Medical School",
    initials: "LO",
    color: "#ef4444",
  },
  {
    quote: "The explanations on quiz answers are what make this different. It doesn't just tell you what's wrong. It explains the physiology. That's what sticks for boards.",
    name: "Ryan Torres",
    role: "MS2",
    school: "Icahn School of Medicine",
    initials: "RT",
    color: "#14b8a6",
  },
];

const faqs: FaqItem[] = [
  {
    question: "What file types can I upload?",
    answer:
      "MedFlash AI supports PDF files, which covers lecture slides, textbook chapters, research papers, clinical guidelines, and scanned handwritten notes. Support for Word documents and plain text is coming soon.",
  },
  {
    question: "How many flashcards are generated per document?",
    answer:
      "It depends on the length and density of your source material. Typically, a 20-page lecture PDF generates 30 to 60 high-yield flashcards. Longer documents are automatically chunked so no content is missed.",
  },
  {
    question: "Can I export my flashcards to Anki?",
    answer:
      "Anki export (.apkg) is on our roadmap and will be available in the next major release. For now, you can study directly in MedFlash AI using our built-in flashcard and quiz modes.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Yes. Your documents and study data are encrypted at rest and in transit. We never use your personal documents to train AI models. Each user's data is fully isolated via row-level security in our database.",
  },
  {
    question: "How accurate are the AI-generated cards?",
    answer:
      "Our AI is fine-tuned for medical content and achieves over 94% factual accuracy on benchmarks. We recommend reviewing generated cards before your exam, since the review process itself is a great study technique.",
  },
  {
    question: "Does MedFlash AI work for non-medical subjects?",
    answer:
      "Absolutely. While we've optimized for medical education (boards, shelf exams, rotations), the platform works well for nursing, pharmacy, dentistry, PA school, and other graduate health science programs.",
  },
];

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out MedFlash AI before committing.",
    features: [
      "3 decks",
      "Up to 60 cards per deck",
      "Flashcard study mode",
      "Basic quiz mode",
      "PDF upload (up to 20 pages)",
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "Everything you need to ace your boards and shelf exams.",
    features: [
      "Unlimited decks",
      "Unlimited flashcards",
      "All study modes",
      "Priority AI processing",
      "PDF upload (up to 200 pages)",
      "Anki export (coming soon)",
      "Progress analytics",
    ],
    cta: "Start Pro free for 7 days",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "per month",
    description: "Built for study groups, residencies, and medical schools.",
    features: [
      "Everything in Pro",
      "Up to 10 seats",
      "Shared deck library",
      "Team quiz sessions",
      "Admin dashboard",
      "Priority support",
      "Custom branding",
    ],
    cta: "Contact us",
    highlighted: false,
  },
];

const teamMembers = [
  {
    name: "Dr. Aisha Patel",
    role: "CEO & Co-Founder",
    bio: "MD/PhD candidate at Stanford. Former research fellow at the NIH. Built MedFlash AI during her own Step 1 prep after spending too many nights on Anki.",
    initials: "AP",
    color: "#6366f1",
  },
  {
    name: "James Chen",
    role: "CTO & Co-Founder",
    bio: "Former ML Engineer at Google Brain. Obsessed with making AI actually useful for real people. Dropped out of his second Master's to build this full-time.",
    initials: "JC",
    color: "#0ea5e9",
  },
  {
    name: "Dr. Marcus Rivera",
    role: "Chief Medical Officer",
    bio: "Board-certified internist. Spent 10 years as a clinical educator at UCSF. Joined MedFlash AI to fix the way an entire generation learns medicine.",
    initials: "MR",
    color: "#10b981",
  },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ user }: { user: User | null }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = document.getElementById("landing-scroll");
    if (!el) return;
    const onScroll = () => {
      const current = el.scrollTop;
      const prev = lastScrollY.current;
      setScrolled(current > 20);

      if (current > prev && current > 100) {
        // Scrolling down past threshold — lazy delay before hiding
        if (!hideTimer.current) {
          hideTimer.current = setTimeout(() => {
            setHidden(true);
            hideTimer.current = null;
          }, 120);
        }
      } else if (current < prev) {
        // Scrolling up — reveal immediately
        if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
        setHidden(false);
      }
      lastScrollY.current = current;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "transparent",
        transform: hidden ? "translateY(-110%)" : "translateY(0)",
        // Slow drift up when hiding, snap back when showing
        transition: hidden
          ? "transform 0.55s cubic-bezier(0.4, 0, 0.6, 1)"
          : "transform 0.3s cubic-bezier(0.0, 0, 0.2, 1)",
      }}
    >
      {/* Pill navbar container */}
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
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.02em" }}>
              MedFlash AI
            </span>
          </div>

          {/* Nav links — centered pill group */}
          <div
            className="hidden md:flex"
            style={{ alignItems: "center", gap: 2, background: "rgba(0,0,0,0.04)", borderRadius: 10, padding: "3px" }}
          >
            {[
              { label: "Features", href: "/features" },
              { label: "How It Works", href: "/how-it-works" },
              { label: "Pricing", href: "/pricing" },
              { label: "Our Story", href: "/our-story" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  fontSize: 13,
                  color: "#52525b",
                  textDecoration: "none",
                  fontWeight: 500,
                  padding: "5px 14px",
                  borderRadius: 7,
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#09090b"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#52525b"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {label}
              </a>
            ))}
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

// ─── Product Mockup ───────────────────────────────────────────────────────────
function ProductMockup() {
  const [scene, setScene] = useState<"home" | "flash-q" | "flash-a" | "quiz" | "quiz-done">("home");
  const [cursorX, setCursorX] = useState(38);
  const [cursorY, setCursorY] = useState(62);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
    async function animate() {
      while (!cancelled) {
        // Home view — cursor moves to "Study" button on first project card
        setScene("home"); setCursorX(38); setCursorY(62);
        await wait(2200);
        if (cancelled) break;
        setCursorX(32); setCursorY(72);
        await wait(900);
        if (cancelled) break;
        setClicking(true); await wait(160); setClicking(false);
        setScene("flash-q");
        await wait(2000);
        if (cancelled) break;
        // Move to Quiz in right panel
        setCursorX(88); setCursorY(28);
        await wait(900);
        if (cancelled) break;
        setClicking(true); await wait(160); setClicking(false);
        setScene("quiz");
        await wait(2000);
        if (cancelled) break;
        // Click answer A
        setCursorX(52); setCursorY(60);
        await wait(900);
        if (cancelled) break;
        setClicking(true); await wait(160); setClicking(false);
        setScene("quiz-done");
        await wait(2000);
        if (cancelled) break;
        // Back to Flashcards
        setCursorX(88); setCursorY(18);
        await wait(900);
        if (cancelled) break;
        setClicking(true); await wait(160); setClicking(false);
        setScene("flash-a");
        await wait(2000);
        if (cancelled) break;
        // Click Good
        setCursorX(52); setCursorY(83);
        await wait(900);
        if (cancelled) break;
        setClicking(true); await wait(160); setClicking(false);
        setScene("home");
        await wait(1200);
      }
    }
    animate();
    return () => { cancelled = true; };
  }, []);

  const isFlash = scene === "flash-q" || scene === "flash-a";
  const isQuiz = scene === "quiz" || scene === "quiz-done";

  const projectCards = [
    { name: "Cardiology Essentials", cards: 48, color: "#6366f1" },
    { name: "Pharmacology: Antibiotics", cards: 62, color: "#10b981" },
  ];

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 960, margin: "0 auto" }}>
      <div style={{
        borderRadius: 16, overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 32px 100px rgba(0,0,0,0.14), 0 8px 32px rgba(0,0,0,0.07)",
        position: "relative", background: "#f5f5f7",
      }}>
        {/* Browser bar */}
        <div style={{ background: "rgba(255,255,255,0.9)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#27c93f" }} />
          <div style={{ flex: 1, maxWidth: 240, margin: "0 auto", background: "rgba(0,0,0,0.07)", borderRadius: 6, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, color: "#6e6e73" }}>medflashai.com/app</span>
          </div>
        </div>

        {/* App panels */}
        <div style={{ display: "flex", height: 460, position: "relative" }}>

          {/* Left panel */}
          <div style={{ width: 200, borderRight: "1px solid rgba(0,0,0,0.08)", background: "#fff", display: "flex", flexDirection: "column" }}>
            {/* Logo row */}
            <div style={{ padding: "12px 14px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>M</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>MedFlash AI</span>
              </div>
            </div>
            {/* Projects label + search */}
            <div style={{ padding: "4px 12px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.07em" }}>Projects</span>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, color: "#6e6e73", lineHeight: 1 }}>+</span>
                </div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: 7, padding: "5px 9px", fontSize: 11, color: "#aeaeb2" }}>🔍 Search projects...</div>
            </div>
            {/* Project list */}
            <div style={{ padding: "0 8px" }}>
              {[
                { name: "Cardiology Essentials", cards: 48, active: scene !== "home" },
                { name: "Pharmacology: Antibiotics", cards: 62, active: false },
                { name: "Neurology High-Yield", cards: 35, active: false },
                { name: "Step 1 Pathology", cards: 91, active: false },
              ].map((deck, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, background: deck.active ? "rgba(99,102,241,0.08)" : "transparent", marginBottom: 1 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: deck.active ? "rgba(99,102,241,0.15)" : "rgba(0,0,0,0.06)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: deck.active ? 600 : 400, color: deck.active ? "#1d1d1f" : "#3c3c43", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>{deck.name}</div>
                    <div style={{ fontSize: 10, color: "#aeaeb2" }}>{deck.cards} cards · 1 source</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center panel */}
          <div style={{ flex: 1, background: "#f5f5f7", overflow: "hidden", position: "relative" }}>

            {/* HOME scene */}
            {scene === "home" && (
              <div style={{ padding: "28px 24px" }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f", marginBottom: 4 }}>Good morning 👋</div>
                  <div style={{ fontSize: 12, color: "#6e6e73" }}>You have 2 projects — pick up where you left off.</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {projectCards.map((p, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ height: 3, background: p.color }} />
                      <div style={{ padding: "14px 14px 12px" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${p.color}18`, border: `1px solid ${p.color}30`, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <BookOpen size={14} color={p.color} />
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#1d1d1f", lineHeight: 1.3, marginBottom: 6 }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "#aeaeb2", marginBottom: 12 }}>{p.cards} cards · 1 source</div>
                        <button style={{ background: "#1d1d1f", color: "#fff", border: "none", borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Study</button>
                      </div>
                    </div>
                  ))}
                  {/* New project card */}
                  <div style={{ background: "transparent", borderRadius: 14, border: "1.5px dashed rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 16, color: "#6e6e73", lineHeight: 1 }}>+</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#6e6e73" }}>New project</div>
                    <div style={{ fontSize: 10, color: "#aeaeb2" }}>Upload a PDF</div>
                  </div>
                </div>
              </div>
            )}

            {/* FLASHCARD scene */}
            {isFlash && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "24px" }}>
                <div style={{ fontSize: 11, color: "#aeaeb2", marginBottom: 14 }}>Card 3 of 48 · Cardiology Essentials</div>
                <div style={{ width: "100%", maxWidth: 360, borderRadius: 16, background: "#fff", border: "1px solid rgba(0,0,0,0.08)", padding: "22px 20px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", transition: "all 0.3s" }}>
                  <div style={{ fontSize: 10, color: "#aeaeb2", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Question</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", lineHeight: 1.6 }}>What is the most common cause of mitral stenosis in adults?</div>
                  {scene === "flash-a" ? (
                    <>
                      <div style={{ margin: "14px 0", borderTop: "1px dashed rgba(0,0,0,0.1)" }} />
                      <div style={{ fontSize: 10, color: "#aeaeb2", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Answer</div>
                      <div style={{ fontSize: 12, color: "#3c3c43", lineHeight: 1.65 }}>Rheumatic fever, causing fibrous thickening and fusion of the mitral valve leaflets.</div>
                    </>
                  ) : (
                    <div style={{ marginTop: 12, fontSize: 11, color: "#c7c7cc" }}>Tap to reveal answer</div>
                  )}
                </div>
                {scene === "flash-a" && (
                  <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
                    {[{ l: "Again", c: "#dc2626" }, { l: "Hard", c: "#d97706" }, { l: "Good", c: "#fff", bg: "#1d1d1f" }, { l: "Easy", c: "#16a34a" }].map(({ l, c, bg }) => (
                      <button key={l} style={{ padding: "6px 14px", borderRadius: 20, border: bg ? "none" : `1px solid ${c}40`, background: bg ?? "rgba(255,255,255,0.8)", color: bg ? c : c, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>{l}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* QUIZ scene */}
            {isQuiz && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "24px" }}>
                <div style={{ fontSize: 11, color: "#aeaeb2", marginBottom: 14 }}>Question 2 of 5 · Cardiology Essentials</div>
                <div style={{ width: "100%", maxWidth: 380, borderRadius: 16, background: "#fff", border: "1px solid rgba(0,0,0,0.08)", padding: "20px 18px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                  <div style={{ fontSize: 10, color: "#aeaeb2", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Quiz</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", lineHeight: 1.5, marginBottom: 14 }}>Which drug class is first-line for HFrEF?</div>
                  {["ACE Inhibitors / ARBs", "Beta-blockers", "Loop diuretics", "Digoxin"].map((opt, i) => {
                    const isA = i === 0;
                    return (
                      <div key={i} style={{
                        padding: "8px 12px", borderRadius: 9, marginBottom: 6, fontSize: 12,
                        border: `1px solid ${isQuiz && scene === "quiz-done" && isA ? "rgba(22,163,74,0.4)" : scene === "quiz" && isA ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.07)"}`,
                        background: scene === "quiz-done" && isA ? "rgba(22,163,74,0.07)" : scene === "quiz" && isA ? "rgba(0,0,0,0.04)" : "transparent",
                        color: scene === "quiz-done" && isA ? "#16a34a" : "#3c3c43",
                        transition: "all 0.25s",
                      }}>{opt}</div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Studio */}
          <div style={{ width: 190, borderLeft: "1px solid rgba(0,0,0,0.08)", background: "#fafafa", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: "#1d1d1f" }}>Studio</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "6px 0" }}>
              {[
                { label: "Flashcards", active: isFlash },
                { label: "Quiz", active: isQuiz },
                { label: "Chat", active: false },
                { label: "Clinical Cases", active: false },
                { label: "Mind Map", active: false },
                { label: "Audio", active: false },
                { label: "Slide Deck", active: false },
                { label: "Infographic", active: false },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "12px 10px", fontSize: 11, margin: "1px 4px", borderRadius: 8, textAlign: "center",
                  background: item.active ? "#fff" : "transparent",
                  color: item.active ? "#1d1d1f" : "#aeaeb2",
                  fontWeight: item.active ? 600 : 400,
                  boxShadow: item.active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.25s",
                  opacity: item.active || scene === "home" ? (item.active ? 1 : 0.5) : (item.active ? 1 : 0.5),
                }}>{item.label}</div>
              ))}
            </div>
          </div>

          {/* Cursor */}
          <div style={{
            position: "absolute",
            left: `${cursorX}%`,
            top: `${cursorY}%`,
            transform: `scale(${clicking ? 0.75 : 1})`,
            transition: "left 0.8s cubic-bezier(0.4,0,0.2,1), top 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.08s ease",
            pointerEvents: "none",
            zIndex: 50,
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.25))",
          }}>
            {/* Proper cursor arrow: tip at upper-left, body extends lower-right */}
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
              <path d="M3 2 L6.5 17 L9.5 13 L13.5 18.5 L15.5 17 L11.5 11.5 L16 9 Z" fill="#1d1d1f" />
            </svg>
          </div>
        </div>

        <BorderBeam size={300} duration={14} colorFrom="#a1a1aa" colorTo="#09090b" />
      </div>

      {/* Floating badge */}
      <div style={{
        position: "absolute", bottom: -18, right: 40,
        background: "#09090b", color: "#fff",
        padding: "8px 16px", borderRadius: 100,
        fontSize: 12, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 6,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}>
        <Zap size={12} fill="#fff" /> 48 cards generated in 12s
      </div>
    </div>
  );
}

// ─── Section: Hero ────────────────────────────────────────────────────────────
function HeroSection({ user }: { user: User | null }) {
  const router = useRouter();
  return (
    <section style={{ padding: "80px 24px 120px", textAlign: "center", position: "relative", overflow: "visible", background: "transparent" }}>
      {/* Backdrop image — extends above section to cover nav padding area */}
      <div style={{
        position: "absolute", inset: 0, top: -90, zIndex: 0,
        backgroundImage: "url('/backdrop.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center 60%",
        opacity: 0.55,
      }} />
      {/* Fade overlay */}
      <div style={{
        position: "absolute", inset: 0, top: -90, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(234,236,245,0.6) 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, rgba(234,236,245,0.4) 100%)",
      }} />
      <div style={{ position: "relative", zIndex: 2 }}>
      <BlurFade delay={0.05}>
        <div style={{ marginBottom: 28 }}>
          <AnimatedGradientText colorFrom="#6366f1" colorTo="#0ea5e9" speed={0.8} style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.01em" }}>
            ✦ Now in Public Beta · Free to start
          </AnimatedGradientText>
        </div>
      </BlurFade>

      <BlurFade delay={0.1}>
        <div style={{ maxWidth: 860, margin: "0 auto 24px" }}>
          <h1
            style={{
              fontSize: "clamp(42px, 7vw, 76px)",
              fontWeight: 800,
              color: "#09090b",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: 4,
            }}
          >
            Stop drowning in notes.{" "}
            <span style={{ color: "#71717a" }}>Start</span>
          </h1>
          <WordRotate
            words={["acing Step 1.", "crushing shelf exams.", "scoring in the 260s.", "studying smarter."]}
            duration={2200}
            motionProps={{
              initial: { opacity: 0, y: -30 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 30 },
              transition: { duration: 0.3, ease: "easeOut" },
              style: {
                fontSize: "clamp(42px, 7vw, 76px)",
                fontWeight: 800,
                color: "#6366f1",
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                margin: 0,
              },
            }}
          />
        </div>
      </BlurFade>

      <BlurFade delay={0.15}>
        <p
          style={{
            fontSize: "clamp(16px, 2vw, 19px)",
            color: "#71717a",
            maxWidth: 760,
            margin: "0 auto 40px",
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          Upload lecture notes, textbooks, or clinical guidelines. MedFlash AI
          instantly generates flashcards, board-style quizzes, and personalized
          study plans, so you can study smarter and score higher.
        </p>
      </BlurFade>

      <BlurFade delay={0.2}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <ShimmerButton
            shimmerColor="#6366f1"
            background="#09090b"
            borderRadius="10px"
            onClick={() => router.push(user ? "/app" : "/auth")}
            className="gap-2 px-7 py-3 text-sm font-semibold tracking-tight"
          >
            Start for free <ArrowRight size={16} />
          </ShimmerButton>
          <button
            onClick={() => router.push("/how-it-works")}
            style={{
              height: 48,
              padding: "0 24px",
              borderRadius: 10,
              background: "#fff",
              color: "#09090b",
              fontSize: 15,
              fontWeight: 500,
              border: "1px solid #e4e4e7",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Play size={14} fill="#09090b" /> See how it works
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 500 }}>
          No credit card required · 3 decks free forever
        </p>
      </BlurFade>

      <BlurFade delay={0.3}>
        <div style={{ marginTop: 72 }}>
          <ProductMockup />
        </div>
      </BlurFade>
      </div>{/* end z-index wrapper */}
    </section>
  );
}

// ─── Section: Trust Strip ─────────────────────────────────────────────────────
function TrustStrip() {
  const schools = [
    "Harvard Medical School",
    "Johns Hopkins SOM",
    "Stanford Medicine",
    "UCSF School of Medicine",
    "Mayo Clinic Alix SOM",
    "Columbia Vagelos COM",
    "NYU Grossman SOM",
    "UPenn Perelman SOM",
    "Yale School of Medicine",
    "Duke School of Medicine",
    "University of Michigan",
    "Vanderbilt School of Medicine",
  ];
  return (
    <section style={{ padding: "48px 0", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "transparent", overflow: "hidden" }}>
      <p style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>
        Trusted by students at top medical schools
      </p>
      <Marquee pauseOnHover className="[--duration:40s]">
        {schools.map((school) => (
          <div
            key={school}
            style={{
              padding: "8px 24px",
              margin: "0 8px",
              borderRadius: 100,
              border: "1px solid #e4e4e7",
              background: "#fff",
              fontSize: 13,
              fontWeight: 500,
              color: "#52525b",
              whiteSpace: "nowrap",
            }}
          >
            {school}
          </div>
        ))}
      </Marquee>
    </section>
  );
}

// ─── Section: How It Works ────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Upload your source material",
      description:
        "Drag and drop any PDF: lecture slides, textbook chapters, clinical guidelines, or research papers. We accept files up to 200 pages long.",
    },
    {
      number: "02",
      icon: Brain,
      title: "AI processes your content",
      description:
        "Our medically-trained AI reads your document, identifies key concepts, clinical correlations, and high-yield information that actually shows up on exams.",
    },
    {
      number: "03",
      icon: BookOpen,
      title: "Study in your preferred format",
      description:
        "Choose from AI flashcards, board-style MCQ quizzes, slide decks, audio overviews, and more. Switch modes anytime, all from the same source.",
    },
  ];

  return (
    <section id="how-it-works" style={{ padding: "100px 24px", background: "transparent" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              How it works
            </div>
            <h2
              style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 800,
                color: "#09090b",
                letterSpacing: "-0.03em",
                marginBottom: 16,
                lineHeight: 1.1,
              }}
            >
              From PDF to flashcards in seconds
            </h2>
            <p style={{ fontSize: 17, color: "#71717a", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
              MedFlash AI removes every friction point between you and effective studying.
            </p>
          </div>
        </BlurFade>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
          {steps.map((step, i) => (
            <BlurFade key={i} delay={0.1 + i * 0.1}>
              <div
                style={{
                  padding: 32,
                  borderRadius: 16,
                  border: "none",
                  background: "#fff",
                  boxShadow: "0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: "#f4f4f5",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    marginBottom: 16,
                  }}
                >
                  {step.number}
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "#09090b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <step.icon size={22} color="#fff" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#09090b", marginBottom: 12, letterSpacing: "-0.02em" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.7 }}>
                  {step.description}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Features ────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      eyebrow: "Intelligent flashcard generation",
      title: "AI cards that capture what actually matters",
      description:
        "MedFlash AI doesn't just copy sentences from your PDFs. It synthesizes concepts, identifies clinical correlations, and generates cards that mirror the way high-yield exam questions are written. Every card is optimized for retention.",
      bullets: [
        "Extracts key definitions, mechanisms, and clinical presentations",
        "Generates front and back pairs with clear, concise language",
        "Compatible with spaced repetition study schedules",
        "Anki export coming in Q1 2025",
      ],
      visual: (
        <div style={{ background: "#fff", borderRadius: 14, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 28 }}>
          {[
            { q: "MOA of metformin?", a: "Inhibits hepatic gluconeogenesis via AMPK activation" },
            { q: "Classic EKG finding in hyperkalemia?", a: "Peaked T waves → widened QRS → sine wave" },
            { q: "Virchow's Triad components?", a: "Stasis, endothelial injury, hypercoagulability" },
          ].map((card, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: i < 2 ? "1px solid #f4f4f5" : "none" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#09090b", marginBottom: 4 }}>{card.q}</div>
              <div style={{ fontSize: 12, color: "#71717a" }}>{card.a}</div>
            </div>
          ))}
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: 11, color: "#71717a", fontWeight: 500 }}>38 cards generated · 18 seconds</span>
          </div>
        </div>
      ),
    },
    {
      eyebrow: "Board-style practice quizzes",
      title: "Quizzes that prepare you for the real thing",
      description:
        "Our quiz engine generates USMLE-style MCQs directly from your source material. Each question comes with detailed explanations that reinforce the underlying physiology, not just the right answer.",
      bullets: [
        "A/B/C/D format matching Step 1, Step 2, and shelf exam styles",
        "Explanations for both correct and incorrect answers",
        "Adaptive difficulty based on your performance",
        "Topic tagging so you can focus on your weak areas",
      ],
      visual: (
        <div style={{ background: "#fff", borderRadius: 14, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Question 4 of 12</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#09090b", marginBottom: 20, lineHeight: 1.6 }}>
            A 55-year-old man presents with crushing chest pain radiating to his left arm. ECG shows ST elevations in leads II, III, and aVF. Which coronary artery is most likely occluded?
          </div>
          {["A. Left anterior descending", "B. Left circumflex", "C. Right coronary artery", "D. Left main coronary artery"].map((opt, i) => (
            <div key={i} style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: `1px solid ${i === 2 ? "#10b981" : "#e4e4e7"}`,
              background: i === 2 ? "#f0fdf4" : "#fff",
              marginBottom: 8,
              fontSize: 13,
              color: i === 2 ? "#15803d" : "#09090b",
              fontWeight: i === 2 ? 600 : 400,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              {i === 2 && <CheckCircle size={14} color="#10b981" />}
              {opt}
            </div>
          ))}
        </div>
      ),
    },
    {
      eyebrow: "Organized study workspace",
      title: "Everything in one place, always accessible",
      description:
        "Keep your study materials organized by subject, rotation, or exam date. Your decks are stored securely in the cloud and accessible from any device, any time, whether you're on call or cramming the night before.",
      bullets: [
        "Unlimited decks with search and tagging",
        "Cloud sync across all your devices",
        "Secure and private. Your documents are never shared",
        "Built for the pace of medical school",
      ],
      visual: (
        <div style={{ background: "#fff", borderRadius: 14, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { name: "Cardiology Essentials", cards: 48, color: "#ef4444" },
              { name: "Pharm: Antibiotics", cards: 62, color: "#f59e0b" },
              { name: "Neurology High-Yield", cards: 35, color: "#6366f1" },
              { name: "IM Shelf Prep", cards: 91, color: "#10b981" },
              { name: "Step 1 Pathology", cards: 84, color: "#0ea5e9" },
              { name: "Biochemistry", cards: 57, color: "#8b5cf6" },
            ].map((deck, i) => (
              <div key={i} style={{ padding: "14px", borderRadius: 10, background: "#fff", border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                <div style={{ width: 28, height: 4, borderRadius: 100, background: deck.color, marginBottom: 10 }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: "#09090b", marginBottom: 4, lineHeight: 1.3 }}>{deck.name}</div>
                <div style={{ fontSize: 11, color: "#a1a1aa", fontWeight: 500 }}>{deck.cards} cards</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="features" style={{ padding: "100px 24px", background: "transparent" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              Features
            </div>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
              Every study tool you need. One platform.
            </h2>
            <p style={{ fontSize: 17, color: "#71717a", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
              Built for the way medical students actually study: fast, focused, and built around your own material.
            </p>
          </div>
        </BlurFade>

        <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
          {features.map((feature, i) => (
            <BlurFade key={i} delay={0.1}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: 60,
                  alignItems: "center",
                }}
              >
                <div style={{ order: i % 2 === 1 ? 2 : 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                    {feature.eyebrow}
                  </div>
                  <h3 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.15 }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.75, marginBottom: 24 }}>
                    {feature.description}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {feature.bullets.map((b, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <CheckCircle size={16} color="#09090b" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 14, color: "#52525b", lineHeight: 1.5 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ order: i % 2 === 1 ? 1 : 2 }}>{feature.visual}</div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Stats ───────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { display: "50,000+", label: "Students enrolled", icon: Users },
    { display: "2M+", label: "Flashcards generated", icon: Zap },
    { display: "94%", label: "Board exam pass rate", icon: Target },
    { display: "4.9 / 5", label: "Average user rating", icon: Star },
  ];
  return (
    <section style={{ padding: "80px 24px", background: "#09090b" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 40 }}>
          {stats.map((stat, i) => (
            <BlurFade key={i} delay={0.05 + i * 0.1}>
              <div style={{ textAlign: "center" }}>
                <stat.icon size={20} color="#52525b" style={{ marginBottom: 16 }} />
                <div style={{ fontSize: "clamp(40px, 5vw, 56px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, whiteSpace: "nowrap" }}>
                  {stat.display}
                </div>
                <div style={{ fontSize: 14, color: "#71717a", marginTop: 10, fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Testimonials ────────────────────────────────────────────────────
function TestimonialsSection() {
  const half = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, half);
  const row2 = testimonials.slice(half);

  const TestCard = ({ t }: { t: Testimonial }) => (
    <div
      style={{
        minWidth: 320,
        maxWidth: 360,
        padding: "24px",
        margin: "0 8px",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.06)",
        background: "#fff",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={13} fill="#facc15" color="#facc15" />
        ))}
      </div>
      <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.7, marginBottom: 18 }}>
        &ldquo;{t.quote}&rdquo;
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: t.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {t.initials}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#09090b" }}>{t.name}</div>
          <div style={{ fontSize: 12, color: "#a1a1aa" }}>{t.role} · {t.school}</div>
        </div>
      </div>
    </div>
  );

  return (
    <section style={{ padding: "100px 0", background: "transparent", overflow: "hidden" }}>
      <BlurFade delay={0.05}>
        <div style={{ textAlign: "center", padding: "0 24px", marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Testimonials
          </div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            Students who swear by it
          </h2>
          <p style={{ fontSize: 17, color: "#71717a", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
            From MS1 to fourth-year rotations, MedFlash AI meets students wherever they are.
          </p>
        </div>
      </BlurFade>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Marquee pauseOnHover className="[--duration:50s]">
          {row1.map((t) => <TestCard key={t.name} t={t} />)}
        </Marquee>
        <Marquee pauseOnHover reverse className="[--duration:45s]">
          {row2.map((t) => <TestCard key={t.name} t={t} />)}
        </Marquee>
      </div>
    </section>
  );
}

// ─── Section: Our Story ───────────────────────────────────────────────────────
function OurStorySection() {
  return (
    <section id="our-story" style={{ padding: "100px 24px", background: "transparent" }}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              Our Story
            </div>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Built by students, for students
            </h2>
          </div>
        </BlurFade>

        <BlurFade delay={0.1}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #e4e4e7",
              padding: "48px 56px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: 32, color: "#e4e4e7", fontWeight: 800, lineHeight: 1, marginBottom: 20 }}>&ldquo;</div>
            <p style={{ fontSize: 17, color: "#3f3f46", lineHeight: 1.85, marginBottom: 24 }}>
              We were both third-year medical students grinding through Step 1 prep when we realized something was deeply broken about the way we studied. We were spending three hours making flashcards for every one hour of actual learning. There had to be a better way.
            </p>
            <p style={{ fontSize: 17, color: "#3f3f46", lineHeight: 1.85, marginBottom: 24 }}>
              We built the first version of MedFlash AI in a single weekend: a rough script that took a PDF and spat out flashcards. We shared it with our study group of eight people. Within two weeks, it had spread to 400 students across three schools, none of whom we&apos;d ever met.
            </p>
            <p style={{ fontSize: 17, color: "#3f3f46", lineHeight: 1.85, marginBottom: 24 }}>
              That told us everything we needed to know. We took a leave of absence, joined a startup accelerator in San Francisco, and spent six months rebuilding MedFlash AI from scratch. We hired the best engineers we could find, brought on a board-certified physician to guide our medical accuracy standards, and obsessed over every detail of the user experience.
            </p>
            <p style={{ fontSize: 17, color: "#3f3f46", lineHeight: 1.85 }}>
              Today, MedFlash AI is used by over 50,000 students across the United States and growing internationally. We&apos;re still a small team with a big belief: that better tools lead to better doctors, and better doctors lead to better outcomes for patients. That&apos;s what we&apos;re building toward.
            </p>

            <div style={{ marginTop: 36, paddingTop: 32, borderTop: "1px solid #f4f4f5", display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[
                { label: "Founded", value: "2024" },
                { label: "Headquarters", value: "San Francisco, CA" },
                { label: "Team size", value: "12 people" },
                { label: "Backed by", value: "YC W25" },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#09090b" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

// ─── Section: Team ────────────────────────────────────────────────────────────
function TeamSection() {
  return (
    <section style={{ padding: "100px 24px", background: "transparent" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              The team
            </div>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              People who understand medicine
            </h2>
          </div>
        </BlurFade>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {teamMembers.map((member, i) => (
            <BlurFade key={i} delay={0.1 + i * 0.1}>
              <div
                style={{
                  padding: 32,
                  borderRadius: 16,
                  border: "none",
                  background: "#fff",
                  boxShadow: "0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: member.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: 20,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {member.initials}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#09090b", marginBottom: 4, letterSpacing: "-0.02em" }}>
                  {member.name}
                </h3>
                <div style={{ fontSize: 13, color: "#71717a", fontWeight: 500, marginBottom: 16 }}>
                  {member.role}
                </div>
                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.7 }}>
                  {member.bio}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Pricing ─────────────────────────────────────────────────────────
function PricingSection() {
  const router = useRouter();
  return (
    <section id="pricing" style={{ padding: "72px 24px", background: "transparent" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              Pricing
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: 15, color: "#71717a", maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>
              Start free and upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>
        </BlurFade>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {pricingTiers.map((tier, i) => (
            <BlurFade key={i} delay={0.1 + i * 0.1}>
              <div
                style={{
                  padding: 24,
                  borderRadius: 14,
                  border: tier.highlighted ? "2px solid #09090b" : "none",
                  background: tier.highlighted ? "#09090b" : "#fff",
                  boxShadow: tier.highlighted ? "0 8px 40px rgba(0,0,0,0.18)" : "0 8px 40px rgba(0,0,0,0.1)",
                  position: "relative",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {tier.highlighted && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#09090b",
                      border: "1px solid #3f3f46",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 14px",
                      borderRadius: 100,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Most popular
                  </div>
                )}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tier.highlighted ? "#fff" : "#09090b", marginBottom: 6 }}>
                    {tier.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: tier.highlighted ? "#fff" : "#09090b", letterSpacing: "-0.04em", lineHeight: 1 }}>
                      {tier.price}
                    </span>
                    <span style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 500 }}>
                      / {tier.period}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: tier.highlighted ? "#a1a1aa" : "#71717a", marginTop: 6, lineHeight: 1.5 }}>
                    {tier.description}
                  </p>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {tier.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle size={14} color={tier.highlighted ? "#71717a" : "#09090b"} />
                      <span style={{ fontSize: 12, color: tier.highlighted ? "#d4d4d8" : "#52525b" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push("/auth")}
                  style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 9,
                    background: tier.highlighted ? "#fff" : "#09090b",
                    color: tier.highlighted ? "#09090b" : "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {tier.cta}
                </button>
              </div>
            </BlurFade>
          ))}
        </div>

        <BlurFade delay={0.3}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: 13, color: "#a1a1aa" }}>
              All plans include a 7-day free trial. Cancel anytime. Questions?{" "}
              <a href="mailto:hello@medflashai.com" style={{ color: "#09090b", fontWeight: 600, textDecoration: "none" }}>
                Contact us
              </a>
            </p>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

// ─── Section: FAQ ─────────────────────────────────────────────────────────────
function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section style={{ padding: "100px 24px", background: "transparent" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              FAQ
            </div>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Common questions
            </h2>
          </div>
        </BlurFade>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {faqs.map((faq, i) => (
            <BlurFade key={i} delay={0.05 + i * 0.05}>
              <div
                style={{
                  borderRadius: 12,
                  border: "none",
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                  padding: "20px 24px",
                  marginBottom: 10,
                  cursor: "pointer",
                }}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#09090b", letterSpacing: "-0.01em" }}>
                    {faq.question}
                  </h3>
                  <ChevronDown
                    size={18}
                    color="#71717a"
                    style={{ flexShrink: 0, transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  />
                </div>
                {openIndex === i && (
                  <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.75, marginTop: 12 }}>
                    {faq.answer}
                  </p>
                )}
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: CTA ─────────────────────────────────────────────────────────────
function CtaSection({ user }: { user: User | null }) {
  const router = useRouter();
  return (
    <section style={{ padding: "100px 24px", background: "transparent" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 8px 48px rgba(0,0,0,0.12)",
          padding: "72px 80px",
        }}>
        <BlurFade delay={0.05}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#f4f4f5",
              border: "1px solid #e4e4e7",
              borderRadius: 100,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: "#71717a",
              marginBottom: 28,
            }}
          >
            <GraduationCap size={12} />
            Join 50,000+ medical students
          </div>
        </BlurFade>
        <BlurFade delay={0.1}>
          <h2
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 800,
              color: "#09090b",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: 20,
            }}
          >
            Study smarter.{" "}
            <span style={{ color: "#71717a" }}>Score higher.</span>
          </h2>
        </BlurFade>
        <BlurFade delay={0.15}>
          <p style={{ fontSize: 17, color: "#71717a", maxWidth: 440, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Start for free today. Upload your first PDF and have a complete study deck ready before your next lecture ends.
          </p>
        </BlurFade>
        <BlurFade delay={0.2}>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <ShimmerButton
              shimmerColor="#6366f1"
              background="#09090b"
              borderRadius="12px"
              onClick={() => router.push(user ? "/app" : "/auth")}
              className="gap-2 px-8 py-4 text-base font-bold tracking-tight"
            >
              Get started free <ArrowRight size={16} />
            </ShimmerButton>
          </div>
          <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 16 }}>
            No credit card required · Takes 30 seconds to sign up
          </p>
        </BlurFade>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const router = useRouter();
  const columns = [
    {
      title: "Product",
      links: ["Features", "How It Works", "Pricing", "Changelog", "Roadmap"],
    },
    {
      title: "Company",
      links: ["Our Story", "Team", "Blog", "Careers", "Press"],
    },
    {
      title: "Resources",
      links: ["Documentation", "Step 1 Guide", "Step 2 Guide", "Study Tips", "Anki vs MedFlash"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "HIPAA Compliance"],
    },
  ];

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
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#09090b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Stethoscope size={16} color="#fff" />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#09090b", letterSpacing: "-0.02em" }}>
                MedFlash AI
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.7, maxWidth: 220 }}>
              AI-powered study tools for medical students. Turn any document into a complete learning system.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {["X", "LinkedIn", "Instagram"].map((s) => (
                <div
                  key={s}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid #e4e4e7",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#71717a",
                  }}
                >
                  {s[0]}
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
                    key={link}
                    href="#"
                    style={{ fontSize: 13, color: "#71717a", textDecoration: "none", fontWeight: 500 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#09090b")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #e4e4e7", paddingTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "#a1a1aa" }}>
            © 2025 MedFlash AI, Inc. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: "#a1a1aa" }}>
            Made with care for medical students everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Section: Animated Stats ─────────────────────────────────────────────────
function AnimatedStatsSection() {
  return (
    <section style={{ padding: "80px 24px", background: "#09090b" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40 }}>
          {[
            { value: 50, suffix: "K+", label: "Medical students", decimals: 0 },
            { value: 2, suffix: "M+", label: "Flashcards generated", decimals: 0 },
            { value: 94, suffix: "%", label: "Board exam pass rate", decimals: 0 },
            { value: 4.9, suffix: "★", label: "Average rating", decimals: 1 },
          ].map((stat, i) => (
            <BlurFade key={i} delay={0.05 + i * 0.1}>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2 }}>
                  <NumberTicker
                    value={stat.value}
                    decimalPlaces={stat.decimals}
                    style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}
                  />
                  <span style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em" }}>{stat.suffix}</span>
                </div>
                <div style={{ fontSize: 14, color: "#71717a", marginTop: 10, fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Bento Features ──────────────────────────────────────────────────
function BentoFeaturesSection() {
  return (
    <section style={{ padding: "100px 24px", background: "transparent", position: "relative", overflow: "hidden" }}>
      <DotPattern glow={false} className="opacity-[0.25]" />
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
              Everything you need to ace your boards.
            </h2>
            <p style={{ fontSize: 17, color: "#71717a", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
              Six powerful tools. One upload. Zero setup.
            </p>
          </div>
        </BlurFade>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateAreas: `"c1 c1 c2" "c3 c4 c2" "c5 c6 c6"`,
          gap: 16,
        }}>
          {/* Card 1: AI Flashcard Generation — col-span 2 */}
          <div style={{ gridArea: "c1", borderRadius: 16, overflow: "hidden" }}>
            <MagicCard gradientColor="#6366f1" gradientOpacity={0.12} className="h-full">
              <div style={{ padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#6366f118", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Brain size={22} color="#6366f1" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#09090b", marginBottom: 8, letterSpacing: "-0.02em" }}>AI Flashcard Generation</h3>
                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.6, marginBottom: 16 }}>Upload any PDF and get high-yield cards synthesized in seconds.</p>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { q: "MOA of Metformin?", a: "Inhibits hepatic gluconeogenesis via AMPK activation" },
                    { q: "Virchow's Triad?", a: "Stasis · Endothelial injury · Hypercoagulability" },
                  ].map((card, i) => (
                    <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #e4e4e7", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>{card.q}</div>
                      <div style={{ fontSize: 11, color: "#71717a" }}>{card.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </MagicCard>
          </div>

          {/* Card 2: USMLE-Style Quizzes — row-span 2 */}
          <div style={{ gridArea: "c2", borderRadius: 16, overflow: "hidden" }}>
            <MagicCard gradientColor="#0ea5e9" gradientOpacity={0.12} className="h-full">
              <div style={{ padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#0ea5e918", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <BookOpen size={22} color="#0ea5e9" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#09090b", marginBottom: 8, letterSpacing: "-0.02em" }}>USMLE-Style Quizzes</h3>
                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.6, marginBottom: 16 }}>Board-format MCQs generated from your own material with detailed explanations.</p>
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#09090b", marginBottom: 12, lineHeight: 1.5 }}>Which finding is most consistent with right heart failure?</div>
                  {["A. Pulmonary edema", "B. JVD & peripheral edema", "C. S3 gallop", "D. Orthopnea"].map((opt, i) => (
                    <div key={i} style={{
                      padding: "8px 10px",
                      borderRadius: 7,
                      border: `1px solid ${i === 1 ? "#10b981" : "#e4e4e7"}`,
                      background: i === 1 ? "#f0fdf4" : "#fff",
                      marginBottom: 6,
                      fontSize: 12,
                      color: i === 1 ? "#15803d" : "#09090b",
                      fontWeight: i === 1 ? 600 : 400,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}>
                      {i === 1 && <CheckCircle size={12} color="#10b981" />}
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </MagicCard>
          </div>

          {/* Card 3: Spaced Repetition */}
          <div style={{ gridArea: "c3", borderRadius: 16, overflow: "hidden" }}>
            <MagicCard gradientColor="#10b981" gradientOpacity={0.12} className="h-full">
              <div style={{ padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#10b98118", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Target size={22} color="#10b981" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#09090b", marginBottom: 6, letterSpacing: "-0.02em" }}>Spaced Repetition</h3>
                <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6 }}>SM-2 scheduling shows you cards right before you forget them.</p>
              </div>
            </MagicCard>
          </div>

          {/* Card 4: Lightning Fast */}
          <div style={{ gridArea: "c4", borderRadius: 16, overflow: "hidden" }}>
            <MagicCard gradientColor="#f59e0b" gradientOpacity={0.12} className="h-full">
              <div style={{ padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f59e0b18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Zap size={22} color="#f59e0b" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#09090b", marginBottom: 6, letterSpacing: "-0.02em" }}>Lightning Fast</h3>
                <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6 }}>48 cards generated in 12 seconds. Even dense textbook chapters.</p>
              </div>
            </MagicCard>
          </div>

          {/* Card 5: Private & Secure */}
          <div style={{ gridArea: "c5", borderRadius: 16, overflow: "hidden" }}>
            <MagicCard gradientColor="#8b5cf6" gradientOpacity={0.12} className="h-full">
              <div style={{ padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#8b5cf618", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Shield size={22} color="#8b5cf6" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#09090b", marginBottom: 6, letterSpacing: "-0.02em" }}>Private & Secure</h3>
                <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6 }}>Encrypted at rest and in transit. Never trained on your documents.</p>
              </div>
            </MagicCard>
          </div>

          {/* Card 6: Progress Tracking — col-span 2 */}
          <div style={{ gridArea: "c6", borderRadius: 16, overflow: "hidden" }}>
            <MagicCard gradientColor="#ef4444" gradientOpacity={0.12} className="h-full">
              <div style={{ padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ef444418", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <BarChart3 size={22} color="#ef4444" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#09090b", marginBottom: 6, letterSpacing: "-0.02em" }}>Progress Tracking</h3>
                <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6, marginBottom: 14 }}>See mastered, learning, and due cards at a glance.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Mastered", pct: 62, color: "#10b981" },
                    { label: "Learning", pct: 28, color: "#f59e0b" },
                    { label: "New", pct: 10, color: "#a1a1aa" },
                  ].map((bar) => (
                    <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 10, color: "#a1a1aa", width: 52 }}>{bar.label}</div>
                      <div style={{ flex: 1, height: 6, background: "#f4f4f5", borderRadius: 100, overflow: "hidden" }}>
                        <div style={{ width: `${bar.pct}%`, height: "100%", background: bar.color, borderRadius: 100 }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#71717a", width: 28 }}>{bar.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </MagicCard>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Study Modes ─────────────────────────────────────────────────────
function StudyModesSection() {
  const [active, setActive] = useState<"flash" | "quiz" | "srs">("flash");
  const [flipped, setFlipped] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <section style={{ padding: "100px 24px", background: "transparent" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
              Three ways to study. One upload.
            </h2>
            <p style={{ fontSize: 17, color: "#71717a", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
              Switch between modes anytime — flashcards, board-style quizzes, or spaced repetition.
            </p>
          </div>
        </BlurFade>

        {/* Tab bar */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {[
            { key: "flash" as const, label: "Flashcards" },
            { key: "quiz" as const, label: "Quiz Mode" },
            { key: "srs" as const, label: "Spaced Repetition" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActive(tab.key); setFlipped(false); }}
              style={{
                padding: "9px 22px",
                borderRadius: 100,
                border: "1px solid",
                borderColor: active === tab.key ? "#09090b" : "#e4e4e7",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                transition: "all 0.2s",
                background: active === tab.key ? "#09090b" : "#fff",
                color: active === tab.key ? "#fff" : "#52525b",
                boxShadow: active === tab.key ? "0 2px 12px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preview panel */}
        <div style={{
          background: "#fff",
          borderRadius: 20,
          padding: 40,
          boxShadow: "0 8px 48px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.06)",
          minHeight: 340,
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}>
          {active === "flash" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Flashcard Mode</p>
              <div style={{ width: "100%", maxWidth: 480, perspective: 1000 }}>
                <div style={{
                  position: "relative",
                  width: "100%",
                  height: 180,
                  transformStyle: "preserve-3d",
                  WebkitTransformStyle: "preserve-3d",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    background: "#09090b",
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 28,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Question</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.4 }}>
                      What is the mechanism of action of Metformin?
                    </div>
                  </div>
                  <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "#f0fdf4",
                    border: "2px solid #10b981",
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 28,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Answer</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#09090b", textAlign: "center", lineHeight: 1.5 }}>
                      Inhibits hepatic gluconeogenesis via AMPK activation; decreases hepatic glucose output
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setFlipped(!flipped)}
                style={{
                  padding: "10px 24px",
                  borderRadius: 9,
                  border: "1px solid #e4e4e7",
                  background: "#fff",
                  color: "#09090b",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {flipped ? "↩ Show Question" : "Flip card →"}
              </button>
            </div>
          )}

          {active === "quiz" && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>Quiz Mode</p>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a1a1aa", marginBottom: 12 }}>Question 3 of 10</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#09090b", lineHeight: 1.6, marginBottom: 24, maxWidth: 560 }}>
                A 55-year-old man presents with crushing chest pain radiating to his left arm. ECG shows ST elevations in leads II, III, and aVF. Which coronary artery is most likely occluded?
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "A. Left anterior descending", correct: false },
                  { label: "B. Left circumflex", correct: false },
                  { label: "C. Right coronary artery", correct: true },
                  { label: "D. Left main coronary artery", correct: false },
                ].map((opt, i) => (
                  <div key={i} style={{
                    padding: "12px 16px",
                    borderRadius: 9,
                    border: `1px solid ${opt.correct ? "#10b981" : "#e4e4e7"}`,
                    background: opt.correct ? "#f0fdf4" : "#fff",
                    fontSize: 14,
                    color: opt.correct ? "#15803d" : "#52525b",
                    fontWeight: opt.correct ? 600 : 400,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    {opt.correct && <CheckCircle size={14} color="#10b981" />}
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "srs" && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>Spaced Repetition</p>
              <div style={{ marginBottom: 28 }}>
                {[
                  { label: "Mastered", count: 31, color: "#10b981", pct: 62 },
                  { label: "Learning", count: 14, color: "#f59e0b", pct: 28 },
                  { label: "New", count: 5, color: "#6366f1", pct: 10 },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 72, fontSize: 13, color: "#52525b", fontWeight: 500 }}>{item.label}</div>
                    <div style={{ flex: 1, height: 8, background: "#f4f4f5", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: 100 }} />
                    </div>
                    <div style={{ fontSize: 13, color: "#09090b", fontWeight: 700, width: 28 }}>{item.count}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "✓ Know it", color: "#10b981", bg: "#f0fdf4", border: "#10b981" },
                  { label: "≈ Hard", color: "#f59e0b", bg: "#fffbeb", border: "#f59e0b" },
                  { label: "↩ Again", color: "#ef4444", bg: "#fef2f2", border: "#ef4444" },
                ].map((btn) => (
                  <button key={btn.label} style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 9,
                    border: `1px solid ${btn.border}`,
                    background: btn.bg,
                    color: btn.color,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Mini How It Works ───────────────────────────────────────────────
function MiniHowItWorksSection() {
  const router = useRouter();
  const steps = [
    { number: "01", icon: Upload, title: "Upload your PDF", description: "Lecture slides, textbooks, clinical guidelines — anything up to 200 pages." },
    { number: "02", icon: Brain, title: "AI processes it", description: "Claude reads your document and extracts every high-yield concept." },
    { number: "03", icon: BookOpen, title: "Study your way", description: "Flashcards, board-style MCQs, spaced repetition — all from one upload." },
  ];
  return (
    <section style={{ padding: "80px 24px", background: "transparent" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>How it works</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
              From PDF to study deck in seconds
            </h2>
            <p style={{ fontSize: 16, color: "#71717a", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
              Three steps. No setup. No learning curve.
            </p>
          </div>
        </BlurFade>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 36 }}>
          {steps.map((step, i) => (
            <BlurFade key={i} delay={0.1 + i * 0.08}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "28px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", height: "100%" }}>
                <div style={{ fontSize: 52, fontWeight: 800, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 14 }}>
                  {step.number}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <step.icon size={21} color="#fff" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#09090b", marginBottom: 8, letterSpacing: "-0.02em" }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.65 }}>{step.description}</p>
              </div>
            </BlurFade>
          ))}
        </div>

        <BlurFade delay={0.35}>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => router.push("/how-it-works")}
              style={{ height: 40, padding: "0 22px", borderRadius: 9, background: "transparent", color: "#09090b", fontSize: 13, fontWeight: 600, border: "1px solid rgba(0,0,0,0.12)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
            >
              See the full walkthrough <ArrowRight size={14} />
            </button>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

// ─── Section: Mini Features ────────────────────────────────────────────────────
function MiniFeaturesSection() {
  const router = useRouter();
  const highlights = [
    {
      icon: Brain,
      color: "#6366f1",
      title: "AI-generated flashcards",
      description: "Not just copied sentences — synthesized, high-yield cards that mirror how boards questions are written.",
    },
    {
      icon: BookOpen,
      color: "#0ea5e9",
      title: "USMLE-style quizzes",
      description: "A/B/C/D MCQs with detailed explanations for every answer choice, generated from your own material.",
    },
    {
      icon: Target,
      color: "#10b981",
      title: "Spaced repetition built in",
      description: "SM-2 scheduling shows you cards right before you'd forget them. Study less. Remember more.",
    },
    {
      icon: BarChart3,
      color: "#f59e0b",
      title: "Progress tracking",
      description: "See which cards you've mastered, which need work, and how many are due today — all in one dashboard.",
    },
    {
      icon: Shield,
      color: "#8b5cf6",
      title: "Private and secure",
      description: "Your documents are encrypted and never used to train AI models. Your notes stay yours.",
    },
    {
      icon: Zap,
      color: "#ef4444",
      title: "Lightning fast",
      description: "A 20-page PDF becomes 40+ flashcards in under 30 seconds. Even dense textbook chapters.",
    },
  ];
  return (
    <section style={{ padding: "0 24px 80px", background: "transparent" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Features</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
              Everything you need to ace your exams
            </h2>
            <p style={{ fontSize: 16, color: "#71717a", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
              Built specifically for medical students. Not a generic study app.
            </p>
          </div>
        </BlurFade>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 36 }}>
          {highlights.map((h, i) => (
            <BlurFade key={i} delay={0.1 + i * 0.06}>
              <div style={{ background: "#fff", borderRadius: 14, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: h.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <h.icon size={18} color={h.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#09090b", marginBottom: 6, letterSpacing: "-0.01em" }}>{h.title}</h3>
                  <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.65 }}>{h.description}</p>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>

        <BlurFade delay={0.5}>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => router.push("/features")}
              style={{ height: 40, padding: "0 22px", borderRadius: 9, background: "transparent", color: "#09090b", fontSize: 13, fontWeight: 600, border: "1px solid rgba(0,0,0,0.12)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
            >
              See all features <ArrowRight size={14} />
            </button>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

// ─── Section: Mini Pricing ─────────────────────────────────────────────────────
function MiniPricingSection() {
  const router = useRouter();
  const tiers = [
    { name: "Free", price: "$0", period: "forever", tagline: "3 decks · 60 cards each · Basic quiz", cta: "Get started", highlighted: false },
    { name: "Pro", price: "$12", period: "/ mo", tagline: "Unlimited decks · All modes · Analytics", cta: "Start free trial", highlighted: true },
    { name: "Team", price: "$29", period: "/ mo", tagline: "10 seats · Shared library · Admin panel", cta: "Contact us", highlighted: false },
  ];
  return (
    <section style={{ padding: "0 24px 80px", background: "transparent" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: 16, color: "#71717a", maxWidth: 380, margin: "0 auto" }}>
              Start free. Upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>
        </BlurFade>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 28 }}>
          {tiers.map((tier, i) => (
            <BlurFade key={i} delay={0.1 + i * 0.08}>
              <div style={{
                padding: "24px",
                borderRadius: 14,
                background: tier.highlighted ? "#09090b" : "#fff",
                border: tier.highlighted ? "2px solid #09090b" : "none",
                boxShadow: tier.highlighted ? "0 8px 32px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.08)",
                position: "relative",
              }}>
                {tier.highlighted && (
                  <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    Most popular
                  </div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tier.highlighted ? "#fff" : "#09090b", marginBottom: 4 }}>{tier.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: tier.highlighted ? "#fff" : "#09090b", letterSpacing: "-0.04em", lineHeight: 1 }}>{tier.price}</span>
                    <span style={{ fontSize: 13, color: "#a1a1aa" }}>{tier.period}</span>
                  </div>
                  <p style={{ fontSize: 12, color: tier.highlighted ? "#71717a" : "#a1a1aa", marginTop: 8 }}>{tier.tagline}</p>
                </div>
                <button
                  onClick={() => router.push("/auth")}
                  style={{ width: "100%", height: 38, borderRadius: 9, background: tier.highlighted ? "#fff" : "#09090b", color: tier.highlighted ? "#09090b" : "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {tier.cta}
                </button>
              </div>
            </BlurFade>
          ))}
        </div>

        <BlurFade delay={0.35}>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => router.push("/pricing")}
              style={{ height: 40, padding: "0 22px", borderRadius: 9, background: "transparent", color: "#09090b", fontSize: 13, fontWeight: 600, border: "1px solid rgba(0,0,0,0.12)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
            >
              See full pricing & comparison <ArrowRight size={14} />
            </button>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div
      id="landing-scroll"
      style={{
        height: "100vh",
        overflowY: "auto",
        background: "linear-gradient(160deg, #eaecf5 0%, #e4e8f2 100%)",
        color: "#09090b",
        fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
      }}
    >
      <Navbar user={user} />
      <HeroSection user={user} />
      <TrustStrip />
      <AnimatedStatsSection />
      <BentoFeaturesSection />
      <StudyModesSection />
      <TestimonialsSection />
      <CtaSection user={user} />
      <SiteFooter />
    </div>
  );
}
