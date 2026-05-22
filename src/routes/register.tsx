import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Loader2, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OtpModal } from "@/components/OtpModal";
import { sendOtp } from "@/lib/auth.functions";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register Free — Chettiar Connect" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const sendOtpFn = useServerFn(sendOtp);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().email().safeParse(email.trim().toLowerCase());
    if (!parsed.success || name.trim().length < 2) {
      toast.error("Please enter your name and a valid email");
      return;
    }
    setSending(true);
    try {
      await sendOtpFn({ data: { email: parsed.data } });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("cc:pending_name", name.trim());
      }
      toast.success("Code sent — check your inbox");
      setOtpOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSending(false);
    }
  };

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

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onVerified={() => {
          setOtpOpen(false);
          navigate({ to: "/dashboard/profile" });
        }}
      />
    </div>
  );
}
