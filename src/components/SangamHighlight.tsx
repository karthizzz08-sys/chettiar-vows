import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Users, MapPin, Phone } from "lucide-react";
import templeBorder from "@/assets/temple-border.png";

export function SangamHighlight() {
  const { t } = useTranslation();
  return (
    <section className="relative py-20 lg:py-28 bg-cream overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-6 opacity-50"
        style={{ backgroundImage: `url(${templeBorder})`, backgroundRepeat: "repeat-x", backgroundSize: "auto 100%" }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-6 opacity-50 scale-y-[-1]"
        style={{ backgroundImage: `url(${templeBorder})`, backgroundRepeat: "repeat-x", backgroundSize: "auto 100%" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-saffron mb-3">✦ Community ✦</p>
        <h2 className="font-display text-4xl lg:text-5xl text-maroon-deep">{t("sangam.title")}</h2>
        <p className="mt-4 max-w-2xl mx-auto text-maroon-deep/70">{t("sangam.subtitle")}</p>

        <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { Icon: Users, label: "5,000+ Members" },
            { Icon: MapPin, label: "120+ Cities" },
            { Icon: Phone, label: "Direct Contact" },
          ].map(({ Icon, label }) => (
            <div key={label} className="p-5 rounded-2xl bg-card border border-gold/30 shadow-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center">
                <Icon className="h-5 w-5 text-maroon-deep" />
              </div>
              <span className="font-medium text-maroon-deep">{label}</span>
            </div>
          ))}
        </div>

        <Link
          to="/sangam"
          className="mt-10 inline-flex px-8 py-3.5 rounded-full bg-gradient-royal text-cream font-semibold shadow-maroon hover:shadow-gold hover:-translate-y-0.5 transition"
        >
          {t("sangam.cta")} →
        </Link>
      </div>
    </section>
  );
}
