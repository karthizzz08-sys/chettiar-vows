import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";
import heroCouple from "@/assets/hero-couple.jpg";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden bg-gradient-cream">
      {/* Floating gold particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-saffron/40 animate-float"
            style={{
              top: `${(i * 53) % 100}%`,
              left: `${(i * 37) % 100}%`,
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
              animationDelay: `${(i % 6) * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-xs font-semibold text-maroon uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            {t("hero.eyebrow")}
          </div>

          <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-maroon-deep leading-[1.05]">
            {t("hero.title").split(",").map((part, i, arr) => (
              <span key={i} className="block">
                {part}{i < arr.length - 1 ? "," : ""}
                {i === arr.length - 1 && (
                  <span className="text-gradient-gold italic"> ✦</span>
                )}
              </span>
            ))}
          </h1>

          <p className="mt-6 text-lg text-maroon-deep/75 max-w-xl leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="px-7 py-3.5 rounded-full bg-gradient-royal text-cream font-semibold shadow-maroon hover:shadow-gold hover:-translate-y-0.5 transition"
            >
              {t("hero.ctaPrimary")} →
            </Link>
            <Link
              to="/matches"
              className="px-7 py-3.5 rounded-full border-2 border-maroon/30 text-maroon font-semibold hover:bg-maroon hover:text-cream transition"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            {[
              { n: "50K+", l: t("hero.stat1") },
              { n: "12K+", l: t("hero.stat2") },
              { n: "15+", l: t("hero.stat3") },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl font-bold text-gradient-gold">{s.n}</div>
                <div className="text-xs text-maroon-deep/60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-gold rounded-[2.5rem] blur-2xl opacity-40" />
          <div className="relative rounded-[2rem] overflow-hidden shadow-maroon border-4 border-saffron/40">
            <img
              src={heroCouple}
              alt="Tamil Chettiar bride in traditional silk saree"
              width={1536}
              height={1024}
              className="w-full h-[520px] lg:h-[640px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/40 via-transparent to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute -left-4 lg:-left-10 bottom-10 glass-gold rounded-2xl p-4 shadow-card max-w-[230px]"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-maroon mb-1">
              <ShieldCheck className="h-4 w-4 text-saffron" />
              100% Verified
            </div>
            <p className="text-xs text-maroon-deep/70">
              Every profile manually verified by our community team.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
