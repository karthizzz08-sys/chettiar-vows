import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Heart, Loader2, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OtpModal } from "@/components/OtpModal";
import { RegistrationForm } from "@/components/RegistrationForm";
import { Skeleton } from "@/components/ui/skeleton";

// Import server functions
import { registerUser as registerUserFn } from "@/lib/registration.server";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register Free — Chettiar Connect" }] }),
  component: RegisterPageWrapper,
});

function RegisterPageWrapper() {
  return (
    <Suspense fallback={<RegisterPageSkeleton />}>
      <RegisterPage />
    </Suspense>
  );
}

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verifiedName, setVerifiedName] = useState("");

  const registerUserServerFn = useServerFn(registerUserFn);
  const navigate = useNavigate();

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().email().safeParse(email.trim().toLowerCase());
    if (!parsed.success || name.trim().length < 2) {
      toast.error("Please enter your name and a valid email");
      return;
    }
    setSending(true);
    try {
      // Send OTP via fetch API
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: parsed.data,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("cc:pending_name", name.trim());
      }
      toast.success("Code sent — check your inbox");
      setOtpOpen(true);
    } catch (err) {
      console.error("[register] OTP send error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSending(false);
    }
  };

  const handleOtpVerified = (user: any, session: any) => {
    // Session might be null if OTP was verified but user account is being created
    if (user && user.email) {
      setOtpVerified(true);
      setVerifiedEmail(user.email);
      setVerifiedName(name.trim());
      setOtpOpen(false);
      toast.success("Email verified! Now complete your profile.");
    } else {
      toast.error("Verification failed: No user data returned");
    }
  };

  const handleRegistrationSubmit = async (data: any) => {
    try {
      const result = await registerUserServerFn(data);
      if (result.success) {
        toast.success(result.message);
        navigate({ to: "/dashboard" });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to complete registration";
      toast.error(message);
      throw error;
    }
  };

  // Show registration form after OTP verification
  if (otpVerified) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-cream">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl rounded-3xl bg-cream/90 backdrop-blur border border-gold/40 shadow-card p-8"
          >
            <RegistrationForm
              onSuccess={() => {
                navigate({ to: "/dashboard" });
              }}
              onSubmit={handleRegistrationSubmit}
              language="en"
            />
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show initial email/name form
  return (
    <div className="min-h-screen flex flex-col bg-gradient-cream">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl bg-cream/90 backdrop-blur border border-gold/40 shadow-card p-8"
        >
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-gradient-royal flex items-center justify-center shadow-gold">
              <Heart className="h-7 w-7 text-saffron" fill="currentColor" />
            </div>
          </div>
          <h1 className="font-display text-3xl text-center text-maroon-deep">Begin your journey</h1>
          <p className="mt-2 text-center text-sm text-maroon-deep/70">
            Free to join. Complete your profile after verification.
          </p>

          <form onSubmit={handleInitialSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-maroon mb-1.5">
                Full name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-maroon/50" />
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gold/30 bg-white text-maroon-deep placeholder:text-maroon/40 focus:border-saffron focus:ring-2 focus:ring-saffron/30 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-maroon mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-maroon/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gold/30 bg-white text-maroon-deep placeholder:text-maroon/40 focus:border-saffron focus:ring-2 focus:ring-saffron/30 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 rounded-full bg-gradient-royal text-cream font-semibold shadow-maroon hover:shadow-gold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {sending ? "Sending code..." : "Send Verification Code"}
            </button>
            <p className="text-[11px] text-center text-maroon-deep/60">
              By continuing you agree to our community guidelines.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-maroon-deep/70">
            Already a member?{" "}
            <Link to="/login" className="font-semibold text-maroon hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </main>
      <Footer />
      <OtpModal
        email={email.trim().toLowerCase()}
        name={name.trim()}
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onVerified={handleOtpVerified}
      />
    </div>
  );
}

function RegisterPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-cream">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-md rounded-3xl bg-cream/90 backdrop-blur border border-gold/40 shadow-card p-8 space-y-4">
          <Skeleton className="h-14 w-14 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
