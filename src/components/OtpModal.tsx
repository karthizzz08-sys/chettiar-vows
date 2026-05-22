import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { sendOtp, verifyOtpAndSignIn } from "@/lib/auth.functions";

interface Props {
  email: string;
  open: boolean;
  onClose: () => void;
  onVerified: (user: any, session: any) => void;
}

const OTP_LENGTH = 6;

export function OtpModal({ email, open, onClose, onVerified }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [expiresIn, setExpiresIn] = useState(600); // 10 minutes
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const sendOtpFn = useServerFn(sendOtp);
  const verifyOtpFn = useServerFn(verifyOtpAndSignIn);

  useEffect(() => {
    if (!open) return;
    setDigits(Array(OTP_LENGTH).fill(""));
    setCooldown(30);
    setExpiresIn(600);
    setTimeout(() => inputs.current[0]?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
      setExpiresIn((e) => (e > 0 ? e - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [open]);

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < OTP_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const arr = Array(OTP_LENGTH).fill("");
    text.split("").forEach((d, i) => (arr[i] = d));
    setDigits(arr);
    inputs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const verify = async () => {
    const token = digits.join("");
    if (token.length !== OTP_LENGTH) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setVerifying(true);
    try {
      const result = await verifyOtpFn({
        email,
        otp: token,
      });

      if (result.success && result.session) {
        toast.success(result.message || "Welcome to Chettiar Connect");
        onVerified(result.user, result.session);
      } else {
        throw new Error(result.message || "Verification failed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verification failed";
      toast.error(message);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await sendOtpFn({ email });
      toast.success("New code sent");
      setCooldown(30);
      setExpiresIn(600);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-maroon-deep/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
            className="relative w-full max-w-md rounded-2xl bg-cream border border-gold/40 shadow-gold p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-maroon/60 hover:text-maroon"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex justify-center mb-5">
              <div className="h-14 w-14 rounded-full bg-gradient-royal flex items-center justify-center shadow-maroon">
                <Mail className="h-7 w-7 text-saffron" />
              </div>
            </div>
            <h2 className="font-display text-2xl text-center text-maroon-deep">
              Verify your email
            </h2>
            <p className="mt-2 text-center text-sm text-maroon-deep/70">
              We sent a 6-digit code to <br />
              <span className="font-medium text-maroon">{email}</span>
            </p>

            <div className="mt-6 flex justify-center gap-2" onPaste={onPaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digits[i] && i > 0) {
                      inputs.current[i - 1]?.focus();
                    }
                  }}
                  className="h-12 w-10 sm:h-14 sm:w-12 text-center text-2xl font-semibold rounded-lg border-2 border-gold/40 bg-white text-maroon-deep focus:border-saffron focus:ring-2 focus:ring-saffron/30 outline-none transition"
                />
              ))}
            </div>

            <p className="mt-3 text-center text-xs text-maroon-deep/60">
              {expiresIn > 0 ? <>Code expires in <span className="font-semibold text-maroon">{fmt(expiresIn)}</span></> : "Code expired — please resend"}
            </p>

            <button
              onClick={verify}
              disabled={verifying || digits.join("").length !== OTP_LENGTH}
              className="mt-6 w-full py-3.5 rounded-full bg-gradient-royal text-cream font-semibold shadow-maroon disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
              {verifying ? "Verifying..." : "Verify & Continue"}
            </button>

            <div className="mt-4 text-center text-sm text-maroon-deep/70">
              Didn't receive it?{" "}
              <button
                onClick={resend}
                disabled={cooldown > 0 || resending}
                className="font-semibold text-maroon hover:underline disabled:no-underline disabled:opacity-50"
              >
                {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
