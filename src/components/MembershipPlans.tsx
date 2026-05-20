import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";

export function MembershipPlans() {
  const { t } = useTranslation();
  const plans = [
    {
      key: "free",
      name: t("plans.free"),
      price: "₹0",
      features: [t("plans.f1"), t("plans.f2"), t("plans.f3")],
      featured: false,
    },
    {
      key: "classic",
      name: t("plans.classic"),
      price: "₹2,499",
      features: [t("plans.c1"), t("plans.c2"), t("plans.c3"), t("plans.c4")],
      featured: true,
    },
    {
      key: "royal",
      name: t("plans.royal"),
      price: "₹5,999",
      features: [t("plans.r1"), t("plans.r2"), t("plans.r3"), t("plans.r4"), t("plans.r5")],
      featured: false,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-saffron mb-3">✦ {t("plans.title")} ✦</p>
          <h2 className="font-display text-4xl lg:text-5xl text-maroon-deep">{t("plans.title")}</h2>
          <p className="mt-3 text-maroon-deep/70">{t("plans.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 border-2 transition-all ${
                p.featured
                  ? "bg-gradient-royal text-cream border-saffron shadow-maroon scale-105"
                  : "bg-card border-gold/30 text-maroon-deep hover:border-gold shadow-card"
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-gold text-maroon-deep text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Crown className="h-3 w-3" /> {t("plans.popular")}
                </div>
              )}
              <h3 className={`font-display text-2xl mb-2 ${p.featured ? "text-saffron" : "text-maroon"}`}>{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-5xl font-bold">{p.price}</span>
                <span className={p.featured ? "text-cream/60 text-sm" : "text-maroon-deep/60 text-sm"}>
                  {t("plans.perMonth")}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${p.featured ? "text-saffron" : "text-maroon"}`} />
                    <span className={p.featured ? "text-cream/90" : "text-maroon-deep/80"}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-full font-semibold transition ${
                  p.featured
                    ? "bg-gradient-gold text-maroon-deep hover:shadow-gold"
                    : "border-2 border-maroon/30 text-maroon hover:bg-maroon hover:text-cream"
                }`}
              >
                {t("plans.select")}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
