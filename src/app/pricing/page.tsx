"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BlurFade } from "@/components/ui/blur-fade";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckCircle, ChevronDown, GraduationCap, ArrowRight, Zap } from "lucide-react";

const pricingTiers = [
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

const faqs = [
  {
    question: "What file types can I upload?",
    answer: "MedFlash AI supports PDF files, which covers lecture slides, textbook chapters, research papers, clinical guidelines, and scanned handwritten notes. Support for Word documents and plain text is coming soon.",
  },
  {
    question: "How many flashcards are generated per document?",
    answer: "It depends on the length and density of your source material. Typically, a 20-page lecture PDF generates 30 to 60 high-yield flashcards. Longer documents are automatically chunked so no content is missed.",
  },
  {
    question: "Can I export my flashcards to Anki?",
    answer: "Anki export (.apkg) is on our roadmap and will be available in the next major release. For now, you can study directly in MedFlash AI using our built-in flashcard and quiz modes.",
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes. Your documents and study data are encrypted at rest and in transit. We never use your personal documents to train AI models. Each user's data is fully isolated via row-level security in our database.",
  },
  {
    question: "How accurate are the AI-generated cards?",
    answer: "Our AI is fine-tuned for medical content and achieves over 94% factual accuracy on benchmarks. We recommend reviewing generated cards before your exam, since the review process itself is a great study technique.",
  },
  {
    question: "Does MedFlash AI work for non-medical subjects?",
    answer: "Absolutely. While we've optimized for medical education (boards, shelf exams, rotations), the platform works well for nursing, pharmacy, dentistry, PA school, and other graduate health science programs.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes, you can cancel anytime from your account settings. You'll retain Pro access until the end of your billing period, and your data is preserved if you choose to come back.",
  },
  {
    question: "Is there a student discount?",
    answer: "We offer a 20% discount for students with a valid .edu email address. Reach out to hello@medflashai.com with your student email and we'll set you up.",
  },
];

const comparisonRows = [
  { feature: "Decks", free: "3", pro: "Unlimited", team: "Unlimited" },
  { feature: "Cards per deck", free: "60", pro: "Unlimited", team: "Unlimited" },
  { feature: "PDF page limit", free: "20 pages", pro: "200 pages", team: "200 pages" },
  { feature: "Flashcard mode", free: true, pro: true, team: true },
  { feature: "Quiz mode", free: "Basic", pro: "Full", team: "Full" },
  { feature: "Spaced repetition", free: false, pro: true, team: true },
  { feature: "Progress analytics", free: false, pro: true, team: true },
  { feature: "Anki export", free: false, pro: "Coming soon", team: "Coming soon" },
  { feature: "Team seats", free: "1", pro: "1", team: "Up to 10" },
  { feature: "Shared deck library", free: false, pro: false, team: true },
  { feature: "Priority support", free: false, pro: false, team: true },
];

function CheckOrX({ val }: { val: boolean | string }) {
  if (typeof val === "string") return <span style={{ fontSize: 13, color: "#52525b", fontWeight: 500 }}>{val}</span>;
  return val
    ? <CheckCircle size={16} color="#09090b" />
    : <div style={{ width: 16, height: 2, background: "#e4e4e7", borderRadius: 1 }} />;
}

export default function PricingPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #eaecf5 0%, #e4e8f2 100%)", color: "#09090b", fontFamily: "var(--font-dm-sans), DM Sans, sans-serif" }}>
      <SiteNavbar />

      {/* Hero */}
      <section style={{ padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <BlurFade delay={0.05}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 100, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#71717a", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <Zap size={12} /> Simple, transparent pricing
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20 }}>
              Start free.{" "}
              <span style={{ color: "#71717a" }}>Upgrade when you're ready.</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.15}>
            <p style={{ fontSize: 18, color: "#71717a", lineHeight: 1.7 }}>
              No hidden fees, no credit card required to start. Cancel anytime.
            </p>
          </BlurFade>
        </div>
      </section>

      {/* Pricing cards */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {pricingTiers.map((tier, i) => (
              <BlurFade key={i} delay={0.1 + i * 0.08}>
                <div
                  style={{
                    padding: 28,
                    borderRadius: 16,
                    border: tier.highlighted ? "2px solid #09090b" : "none",
                    background: tier.highlighted ? "#09090b" : "#fff",
                    boxShadow: tier.highlighted ? "0 8px 40px rgba(0,0,0,0.2)" : "0 4px 24px rgba(0,0,0,0.08)",
                    position: "relative",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {tier.highlighted && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#09090b", border: "1px solid #3f3f46", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 100, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      Most popular
                    </div>
                  )}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: tier.highlighted ? "#fff" : "#09090b", marginBottom: 6 }}>{tier.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 40, fontWeight: 800, color: tier.highlighted ? "#fff" : "#09090b", letterSpacing: "-0.04em", lineHeight: 1 }}>{tier.price}</span>
                      <span style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 500 }}>/ {tier.period}</span>
                    </div>
                    <p style={{ fontSize: 12, color: tier.highlighted ? "#a1a1aa" : "#71717a", marginTop: 8, lineHeight: 1.5 }}>{tier.description}</p>
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {tier.features.map((f, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle size={14} color={tier.highlighted ? "#71717a" : "#09090b"} />
                        <span style={{ fontSize: 13, color: tier.highlighted ? "#d4d4d8" : "#52525b" }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push(tier.name === "Team" ? "mailto:hello@medflashai.com" : "/auth")}
                    style={{ width: "100%", height: 42, borderRadius: 10, background: tier.highlighted ? "#fff" : "#09090b", color: tier.highlighted ? "#09090b" : "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", letterSpacing: "-0.01em" }}
                  >
                    {tier.cta}
                  </button>
                </div>
              </BlurFade>
            ))}
          </div>

          <BlurFade delay={0.4}>
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <p style={{ fontSize: 13, color: "#a1a1aa" }}>
                All paid plans include a 7-day free trial. Cancel anytime. Questions?{" "}
                <a href="mailto:hello@medflashai.com" style={{ color: "#09090b", fontWeight: 600, textDecoration: "none" }}>Contact us</a>
              </p>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <BlurFade delay={0.05}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Compare plans</div>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Full feature breakdown
              </h2>
            </div>
          </BlurFade>

          <BlurFade delay={0.1}>
            <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "16px 24px", borderBottom: "1px solid #f4f4f5" }}>
                <div />
                {["Free", "Pro", "Team"].map((name, i) => (
                  <div key={name} style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: i === 1 ? "#6366f1" : "#09090b" }}>{name}</div>
                ))}
              </div>

              {comparisonRows.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    padding: "14px 24px",
                    borderBottom: i < comparisonRows.length - 1 ? "1px solid #f4f4f5" : "none",
                    background: i % 2 === 0 ? "#fff" : "#fafafa",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#52525b", fontWeight: 500 }}>{row.feature}</span>
                  <div style={{ textAlign: "center", display: "flex", justifyContent: "center" }}><CheckOrX val={row.free} /></div>
                  <div style={{ textAlign: "center", display: "flex", justifyContent: "center" }}><CheckOrX val={row.pro} /></div>
                  <div style={{ textAlign: "center", display: "flex", justifyContent: "center" }}><CheckOrX val={row.team} /></div>
                </div>
              ))}
            </div>
          </BlurFade>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <BlurFade delay={0.05}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>FAQ</div>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Common questions
              </h2>
            </div>
          </BlurFade>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faqs.map((faq, i) => (
              <BlurFade key={i} delay={0.05 + i * 0.04}>
                <div
                  style={{ borderRadius: 12, background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", padding: "20px 24px", cursor: "pointer" }}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "#09090b", letterSpacing: "-0.01em" }}>{faq.question}</h3>
                    <ChevronDown size={18} color="#71717a" style={{ flexShrink: 0, transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </div>
                  {openIndex === i && (
                    <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.75, marginTop: 12 }}>{faq.answer}</p>
                  )}
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
                <GraduationCap size={12} /> No credit card required
              </div>
            </BlurFade>
            <BlurFade delay={0.1}>
              <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>
                Start studying smarter today
              </h2>
            </BlurFade>
            <BlurFade delay={0.15}>
              <p style={{ fontSize: 16, color: "#71717a", marginBottom: 32, lineHeight: 1.7 }}>
                Join over 50,000 medical students who&apos;ve already made the switch.
              </p>
            </BlurFade>
            <BlurFade delay={0.2}>
              <button
                onClick={() => router.push("/auth")}
                style={{ height: 50, padding: "0 32px", borderRadius: 12, background: "#09090b", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
              >
                Get started free <ArrowRight size={16} />
              </button>
            </BlurFade>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
