"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Stethoscope, ArrowLeft } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: "#e4e4e7" }} />
      <span style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 500 }}>or</span>
      <div style={{ flex: 1, height: 1, background: "#e4e4e7" }} />
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        setMessage("Password reset link sent. Check your email.");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/app");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Account created! Check your email to confirm.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 44,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #e4e4e7",
    background: "#fafafa",
    color: "#09090b",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #eaecf5 0%, #e4e8f2 100%)", display: "flex", flexDirection: "column", fontFamily: "var(--font-dm-sans), DM Sans, sans-serif" }}>
      {/* Navbar */}
      <div style={{ height: 64, borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => router.push("/")}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stethoscope size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#09090b", letterSpacing: "-0.02em" }}>MedFlash AI</span>
        </div>
        <button onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#71717a", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          <ArrowLeft size={14} /> Back to home
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", marginBottom: 8 }}>
              {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
            </h1>
            <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.6 }}>
              {mode === "signin" ? "Sign in to access your flashcard decks" : mode === "signup" ? "Start building your medical study library" : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {/* Card */}
          <div style={{ background: "#fff", borderRadius: 20, border: "none", padding: "32px", boxShadow: "0 8px 48px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#09090b", display: "block", marginBottom: 6 }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#09090b")}
                  onBlur={(e) => (e.target.style.borderColor = "#e4e4e7")}
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#09090b" }}>Password</label>
                    {mode === "signin" && (
                      <button type="button" onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} style={{ fontSize: 12, color: "#71717a", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                    required
                    minLength={6}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#09090b")}
                    onBlur={(e) => (e.target.style.borderColor = "#e4e4e7")}
                  />
                </div>
              )}

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13, color: "#dc2626" }}>
                  {error}
                </div>
              )}
              {message && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, color: "#16a34a" }}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", height: 44, borderRadius: 10, background: loading ? "#a1a1aa" : "#09090b", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", letterSpacing: "-0.01em", marginTop: 2 }}
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
              </button>
            </form>

            {/* Google — only on signin/signup */}
            {mode !== "forgot" && (
              <>
                <Divider />
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  style={{ width: "100%", height: 44, borderRadius: 10, border: "1px solid #e4e4e7", background: "#fff", color: "#09090b", fontSize: 14, fontWeight: 500, cursor: googleLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit", opacity: googleLoading ? 0.6 : 1 }}
                  onMouseEnter={(e) => { if (!googleLoading) e.currentTarget.style.background = "#fafafa"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                >
                  {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                  Continue with Google
                </button>
              </>
            )}
          </div>

          {/* Footer toggles */}
          <div style={{ textAlign: "center", marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {mode === "signin" && (
              <p style={{ fontSize: 13, color: "#71717a" }}>
                Don&apos;t have an account?{" "}
                <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "#09090b", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Sign up for free
                </button>
              </p>
            )}
            {mode === "signup" && (
              <p style={{ fontSize: 13, color: "#71717a" }}>
                Already have an account?{" "}
                <button onClick={() => { setMode("signin"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "#09090b", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Sign in
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <button onClick={() => { setMode("signin"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "#71717a", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <ArrowLeft size={13} /> Back to sign in
              </button>
            )}
            <p style={{ fontSize: 12, color: "#a1a1aa" }}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
