"use client";
import { useRouter } from "next/navigation";
import { BlurFade } from "@/components/ui/blur-fade";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowRight, GraduationCap, Heart, Lightbulb, Rocket } from "lucide-react";

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
  {
    name: "Sofia Reyes",
    role: "Head of Design",
    bio: "Previously at Figma and Linear. Believes that the best learning tools are the ones students actually want to use. Passionate about educational UX.",
    initials: "SR",
    color: "#ec4899",
  },
  {
    name: "Dr. Kenji Tanaka",
    role: "Medical Accuracy Lead",
    bio: "Neurologist and former board exam question writer for the USMLE. Oversees the quality and clinical relevance of all AI-generated content.",
    initials: "KT",
    color: "#f59e0b",
  },
  {
    name: "Liam O'Brien",
    role: "Head of Growth",
    bio: "Grew Notion's education vertical from 0 to 2M users. Now bringing that same energy to MedFlash AI — helping students find a better way to study.",
    initials: "LO",
    color: "#8b5cf6",
  },
];

const milestones = [
  {
    year: "2023",
    icon: Lightbulb,
    title: "The idea",
    description: "Two third-year medical students, frustrated by hours wasted making flashcards, write a Python script that turns a PDF into study cards. They share it with their study group.",
  },
  {
    year: "Early 2024",
    icon: Rocket,
    title: "Launch",
    description: "The script spreads to 400 students across three schools in two weeks — none of whom they'd met. The founders take a leave of absence and move to San Francisco.",
  },
  {
    year: "Mid 2024",
    icon: Heart,
    title: "YC W25",
    description: "MedFlash AI is accepted into Y Combinator's W25 batch. They spend six months rebuilding from scratch with a team of engineers and medical advisors.",
  },
  {
    year: "2025",
    icon: GraduationCap,
    title: "50,000 students",
    description: "MedFlash AI reaches 50,000 active users across the United States and begins expanding internationally. The mission: better tools lead to better doctors.",
  },
];

export default function OurStoryPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #eaecf5 0%, #e4e8f2 100%)", color: "#09090b", fontFamily: "var(--font-dm-sans), DM Sans, sans-serif" }}>
      <SiteNavbar />

      {/* Hero */}
      <section style={{ padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <BlurFade delay={0.05}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 100, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#71717a", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <Heart size={12} /> Built by students, for students
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20 }}>
              We started with a problem.{" "}
              <span style={{ color: "#71717a" }}>We built the solution.</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.15}>
            <p style={{ fontSize: 18, color: "#71717a", lineHeight: 1.7 }}>
              MedFlash AI began in a dorm room during Step 1 prep. Today it&apos;s used by over 50,000 students across the country.
            </p>
          </BlurFade>
        </div>
      </section>

      {/* Fact strip */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <BlurFade delay={0.1}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              {[
                { label: "Founded", value: "2024" },
                { label: "Headquarters", value: "San Francisco, CA" },
                { label: "Team size", value: "12 people" },
                { label: "Backed by", value: "YC W25" },
                { label: "Students", value: "50,000+" },
              ].map((item) => (
                <div key={item.label} style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", marginBottom: 4 }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </BlurFade>
        </div>
      </section>

      {/* The story */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <BlurFade delay={0.05}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Our story</div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                The moment everything clicked
              </h2>
            </div>
          </BlurFade>

          <BlurFade delay={0.1}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "48px 56px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 40, color: "#e4e4e7", fontWeight: 800, lineHeight: 1, marginBottom: 20 }}>&ldquo;</div>
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
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <BlurFade delay={0.05}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Timeline</div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                How we got here
              </h2>
            </div>
          </BlurFade>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {milestones.map((m, i) => (
              <BlurFade key={i} delay={0.1 + i * 0.1}>
                <div style={{ background: "#fff", borderRadius: 16, padding: "28px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <m.icon size={18} color="#fff" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#a1a1aa" }}>{m.year}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#09090b", marginBottom: 10, letterSpacing: "-0.02em" }}>{m.title}</h3>
                  <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.7 }}>{m.description}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <BlurFade delay={0.05}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>The team</div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                People who understand medicine
              </h2>
              <p style={{ fontSize: 16, color: "#71717a", maxWidth: 480, margin: "16px auto 0", lineHeight: 1.65 }}>
                Our team combines deep medical expertise with world-class engineering and design.
              </p>
            </div>
          </BlurFade>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {teamMembers.map((member, i) => (
              <BlurFade key={i} delay={0.1 + i * 0.08}>
                <div style={{ background: "#fff", borderRadius: 16, padding: "28px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", height: "100%" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 13, background: member.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 18, letterSpacing: "-0.02em" }}>
                    {member.initials}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#09090b", marginBottom: 3, letterSpacing: "-0.02em" }}>{member.name}</h3>
                  <div style={{ fontSize: 12, color: "#71717a", fontWeight: 600, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>{member.role}</div>
                  <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.7 }}>{member.bio}</p>
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
              <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>
                Be part of the mission
              </h2>
            </BlurFade>
            <BlurFade delay={0.1}>
              <p style={{ fontSize: 16, color: "#71717a", marginBottom: 32, lineHeight: 1.7 }}>
                Join 50,000+ students already studying smarter. Start for free today.
              </p>
            </BlurFade>
            <BlurFade delay={0.15}>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => router.push("/auth")}
                  style={{ height: 48, padding: "0 28px", borderRadius: 12, background: "#09090b", color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                >
                  Get started free <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => router.push("mailto:hello@medflashai.com")}
                  style={{ height: 48, padding: "0 28px", borderRadius: 12, background: "transparent", color: "#52525b", fontSize: 14, fontWeight: 500, border: "1px solid rgba(0,0,0,0.1)", cursor: "pointer" }}
                >
                  Reach out
                </button>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
