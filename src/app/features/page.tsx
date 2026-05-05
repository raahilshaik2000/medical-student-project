"use client";
import { useRouter } from "next/navigation";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import {
  CheckCircle,
  Star,
  Users,
  Zap,
  Target,
  ArrowRight,
  GraduationCap,
  Brain,
  BookOpen,
  LayoutGrid,
} from "lucide-react";

const testimonials = [
  { quote: "I uploaded my entire Robbins pathology notes and had 200 high-yield cards in under 3 minutes. I've never studied this efficiently before Step 1.", name: "Priya Nair", role: "MS2", school: "Johns Hopkins SOM", initials: "PN", color: "#6366f1" },
  { quote: "The quiz mode is exactly like board questions. It pulls from my own lecture PDFs and quizzes me on things I actually need to know for my shelf exams.", name: "Marcus Webb", role: "MS3", school: "University of Michigan", initials: "MW", color: "#0ea5e9" },
  { quote: "I went from a 220 to a 247 on Step 1. MedFlash AI was my secret weapon. The way it extracts key concepts from dense material is genuinely incredible.", name: "Anika Sharma", role: "MS3", school: "Stanford School of Medicine", initials: "AS", color: "#10b981" },
  { quote: "My study group uses this together. We upload the same PDFs and quiz each other with the generated questions. It's replaced our old Anki workflow completely.", name: "David Kim", role: "MS2", school: "UCSF School of Medicine", initials: "DK", color: "#f59e0b" },
  { quote: "As a DO student balancing two curriculums, I needed something that could keep up with my material. MedFlash processes anything, including hand-written notes scanned to PDF.", name: "Jess Ramirez", role: "OMS2", school: "Touro College of Osteopathic Medicine", initials: "JR", color: "#ec4899" },
  { quote: "I'm a visual learner and the flashcard format is perfect. The AI actually understands clinical context. It doesn't just copy sentences, it synthesizes concepts.", name: "Ethan Park", role: "MS1", school: "Mayo Clinic Alix SOM", initials: "EP", color: "#8b5cf6" },
  { quote: "Every clerkship I rotate through, I upload the department's handout PDFs and generate a study deck on day one. It's become a non-negotiable part of my routine.", name: "Lauren Osei", role: "MS4", school: "Harvard Medical School", initials: "LO", color: "#ef4444" },
  { quote: "The explanations on quiz answers are what make this different. It doesn't just tell you what's wrong. It explains the physiology. That's what sticks for boards.", name: "Ryan Torres", role: "MS2", school: "Icahn School of Medicine", initials: "RT", color: "#14b8a6" },
];

const features = [
  {
    eyebrow: "Intelligent flashcard generation",
    icon: Brain,
    title: "AI cards that capture what actually matters",
    description: "MedFlash AI doesn't just copy sentences from your PDFs. It synthesizes concepts, identifies clinical correlations, and generates cards that mirror the way high-yield exam questions are written. Every card is optimized for retention.",
    bullets: [
      "Extracts key definitions, mechanisms, and clinical presentations",
      "Generates front and back pairs with clear, concise language",
      "Compatible with spaced repetition study schedules",
      "Anki export coming in Q1 2025",
    ],
    visual: (
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 28 }}>
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
    icon: BookOpen,
    title: "Quizzes that prepare you for the real thing",
    description: "Our quiz engine generates USMLE-style MCQs directly from your source material. Each question comes with detailed explanations that reinforce the underlying physiology, not just the right answer.",
    bullets: [
      "A/B/C/D format matching Step 1, Step 2, and shelf exam styles",
      "Explanations for both correct and incorrect answers",
      "Adaptive difficulty based on your performance",
      "Topic tagging so you can focus on your weak areas",
    ],
    visual: (
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Question 4 of 12</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#09090b", marginBottom: 20, lineHeight: 1.6 }}>
          A 55-year-old man presents with crushing chest pain radiating to his left arm. ECG shows ST elevations in leads II, III, and aVF. Which coronary artery is most likely occluded?
        </div>
        {["A. Left anterior descending", "B. Left circumflex", "C. Right coronary artery", "D. Left main coronary artery"].map((opt, i) => (
          <div key={i} style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${i === 2 ? "#10b981" : "#e4e4e7"}`, background: i === 2 ? "#f0fdf4" : "#fff", marginBottom: 8, fontSize: 13, color: i === 2 ? "#15803d" : "#09090b", fontWeight: i === 2 ? 600 : 400, display: "flex", alignItems: "center", gap: 8 }}>
            {i === 2 && <CheckCircle size={14} color="#10b981" />}
            {opt}
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "Organized study workspace",
    icon: LayoutGrid,
    title: "Everything in one place, always accessible",
    description: "Keep your study materials organized by subject, rotation, or exam date. Your decks are stored securely in the cloud and accessible from any device, any time, whether you're on call or cramming the night before.",
    bullets: [
      "Unlimited decks with search and tagging",
      "Cloud sync across all your devices",
      "Secure and private — your documents are never shared",
      "Built for the pace of medical school",
    ],
    visual: (
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { name: "Cardiology Essentials", cards: 48, color: "#ef4444" },
            { name: "Pharm: Antibiotics", cards: 62, color: "#f59e0b" },
            { name: "Neurology High-Yield", cards: 35, color: "#6366f1" },
            { name: "IM Shelf Prep", cards: 91, color: "#10b981" },
            { name: "Step 1 Pathology", cards: 84, color: "#0ea5e9" },
            { name: "Biochemistry", cards: 57, color: "#8b5cf6" },
          ].map((deck, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 10, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
              <div style={{ width: 28, height: 4, borderRadius: 100, background: deck.color, marginBottom: 10 }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: "#09090b", marginBottom: 4, lineHeight: 1.3 }}>{deck.name}</div>
              <div style={{ fontSize: 11, color: "#a1a1aa", fontWeight: 500 }}>{deck.cards} cards</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Spaced repetition system",
    icon: Target,
    title: "Study smarter with science-backed scheduling",
    description: "Our built-in spaced repetition algorithm (SM-2) automatically schedules your reviews so you see cards right before you'd forget them. No more over-studying what you know or forgetting what you don't.",
    bullets: [
      "SM-2 algorithm tracks your ease factor per card",
      "Know it / Hard / Still Learning buttons after each flip",
      "Daily due cards surfaced automatically",
      "Progress dashboard shows mastered vs. learning",
    ],
    visual: (
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Today's review queue</div>
          {[
            { label: "Due today", count: 24, color: "#6366f1", pct: 60 },
            { label: "Mastered", count: 118, color: "#10b981", pct: 85 },
            { label: "Learning", count: 31, color: "#f59e0b", pct: 40 },
          ].map((row, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#52525b" }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#09090b" }}>{row.count}</span>
              </div>
              <div style={{ height: 6, borderRadius: 100, background: "#f4f4f5" }}>
                <div style={{ height: "100%", borderRadius: 100, background: row.color, width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "✓ Know it", bg: "#f0fdf4", color: "#15803d" },
            { label: "≈ Hard", bg: "#fffbeb", color: "#b45309" },
            { label: "↩ Again", bg: "#fef2f2", color: "#dc2626" },
          ].map((btn, i) => (
            <div key={i} style={{ flex: 1, padding: "8px 0", borderRadius: 8, background: btn.bg, textAlign: "center", fontSize: 12, fontWeight: 600, color: btn.color }}>
              {btn.label}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const stats = [
  { display: "50,000+", label: "Students enrolled", icon: Users },
  { display: "2M+", label: "Flashcards generated", icon: Zap },
  { display: "94%", label: "Board exam pass rate", icon: Target },
  { display: "4.9 / 5", label: "Average user rating", icon: Star },
];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div style={{ minWidth: 300, maxWidth: 340, padding: 24, margin: "0 8px", borderRadius: 14, background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#facc15" color="#facc15" />)}
      </div>
      <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.7, marginBottom: 18 }}>&ldquo;{t.quote}&rdquo;</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{t.initials}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#09090b" }}>{t.name}</div>
          <div style={{ fontSize: 12, color: "#a1a1aa" }}>{t.role} · {t.school}</div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  const router = useRouter();
  const half = Math.ceil(testimonials.length / 2);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #eaecf5 0%, #e4e8f2 100%)", color: "#09090b", fontFamily: "var(--font-dm-sans), DM Sans, sans-serif" }}>
      <SiteNavbar />

      {/* Hero */}
      <section style={{ padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <BlurFade delay={0.05}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 100, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#71717a", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <Zap size={12} /> Everything you get with MedFlash AI
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20 }}>
              Every study tool you need.{" "}
              <span style={{ color: "#71717a" }}>One platform.</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.15}>
            <p style={{ fontSize: 18, color: "#71717a", lineHeight: 1.7, marginBottom: 36 }}>
              Built for the way medical students actually study: fast, focused, and built around your own material.
            </p>
          </BlurFade>
          <BlurFade delay={0.2}>
            <button
              onClick={() => router.push("/auth")}
              style={{ height: 50, padding: "0 32px", borderRadius: 12, background: "#09090b", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.2)", letterSpacing: "-0.01em" }}
            >
              Start for free <ArrowRight size={16} />
            </button>
          </BlurFade>
        </div>
      </section>

      {/* Feature sections */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 100 }}>
          {features.map((feature, i) => (
            <BlurFade key={i} delay={0.1}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 60, alignItems: "center" }}>
                <div style={{ order: i % 2 === 1 ? 2 : 1 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <feature.icon size={14} color="#52525b" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.1em" }}>{feature.eyebrow}</span>
                  </div>
                  <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.15 }}>
                    {feature.title}
                  </h2>
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
      </section>

      {/* Stats */}
      <section style={{ padding: "80px 24px", background: "#09090b" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 40 }}>
          {stats.map((stat, i) => (
            <BlurFade key={i} delay={0.05 + i * 0.1}>
              <div style={{ textAlign: "center" }}>
                <stat.icon size={20} color="#52525b" style={{ marginBottom: 16 }} />
                <div style={{ fontSize: "clamp(40px, 5vw, 56px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>{stat.display}</div>
                <div style={{ fontSize: 14, color: "#71717a", marginTop: 10, fontWeight: 500 }}>{stat.label}</div>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "100px 0", overflow: "hidden" }}>
        <BlurFade delay={0.05}>
          <div style={{ textAlign: "center", padding: "0 24px", marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Testimonials</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
              Students who swear by it
            </h2>
            <p style={{ fontSize: 16, color: "#71717a", maxWidth: 440, margin: "0 auto" }}>
              From MS1 to fourth-year rotations, MedFlash AI meets students wherever they are.
            </p>
          </div>
        </BlurFade>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Marquee pauseOnHover className="[--duration:50s]">
            {testimonials.slice(0, half).map((t) => <TestimonialCard key={t.name} t={t} />)}
          </Marquee>
          <Marquee pauseOnHover reverse className="[--duration:45s]">
            {testimonials.slice(half).map((t) => <TestimonialCard key={t.name} t={t} />)}
          </Marquee>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px 120px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 48px rgba(0,0,0,0.12)", padding: "56px 48px" }}>
            <BlurFade delay={0.05}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f4f4f5", border: "1px solid #e4e4e7", borderRadius: 100, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#71717a", marginBottom: 24 }}>
                <GraduationCap size={12} /> Join 50,000+ medical students
              </div>
            </BlurFade>
            <BlurFade delay={0.1}>
              <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>
                Ready to study smarter?
              </h2>
            </BlurFade>
            <BlurFade delay={0.15}>
              <p style={{ fontSize: 16, color: "#71717a", marginBottom: 32, lineHeight: 1.7 }}>
                Start for free today. Upload your first PDF and have a complete study deck ready before your next lecture ends.
              </p>
            </BlurFade>
            <BlurFade delay={0.2}>
              <button
                onClick={() => router.push("/auth")}
                style={{ height: 50, padding: "0 32px", borderRadius: 12, background: "#09090b", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
              >
                Get started free <ArrowRight size={16} />
              </button>
              <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 14 }}>No credit card required · Takes 30 seconds</p>
            </BlurFade>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
