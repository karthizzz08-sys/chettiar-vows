import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Menu, X, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLang = () => {
    const next = i18n.language?.startsWith("ta") ? "en" : "ta";
    i18n.changeLanguage(next);
    document.documentElement.lang = next;
  };

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/matches", label: t("nav.matches") },
    { to: "/sangam", label: t("nav.sangam") },
    { to: "/stories", label: t("nav.stories") },
    { to: "/plans", label: t("nav.plans") },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/85 backdrop-blur-xl border-b border-gold/30 shadow-card"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-gold rounded-full blur-md opacity-50 group-hover:opacity-80 transition" />
              <div className="relative h-10 w-10 rounded-full bg-gradient-royal flex items-center justify-center shadow-gold">
                <Heart className="h-5 w-5 text-saffron" fill="currentColor" />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl md:text-2xl font-semibold text-maroon-deep">
                {t("brand")}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-saffron font-medium hidden sm:block">
                Est. Tradition
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-4 py-2 text-sm font-medium text-maroon-deep/80 hover:text-maroon rounded-md hover:bg-gold/10 transition"
                activeProps={{ className: "text-maroon bg-gold/15" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gold/50 text-maroon hover:bg-gold/10 transition"
              aria-label="Toggle language"
            >
              {i18n.language?.startsWith("ta") ? "EN" : "தமிழ்"}
            </button>
            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-maroon hover:text-maroon-deep"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-royal text-cream shadow-maroon hover:shadow-gold transition"
            >
              {t("nav.register")}
            </Link>
            <button
              className="lg:hidden p-2 text-maroon"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden bg-cream/95 backdrop-blur-xl border-t border-gold/30"
          >
            <div className="px-4 py-4 space-y-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-maroon-deep hover:bg-gold/10"
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 rounded-full border border-maroon/30 text-maroon"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 rounded-full bg-gradient-royal text-cream font-semibold"
                >
                  {t("nav.register")}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
