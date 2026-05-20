import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const stories = [
  {
    couple: "Priya & Senthil",
    location: "Married in Karaikudi, 2024",
    quote:
      "Our families found each other on Chettiar Connect. The verification process gave my parents complete peace of mind. Truly traditional values, modern experience.",
  },
  {
    couple: "Divya & Murugan",
    location: "Married in Chennai, 2023",
    quote:
      "We connected over our shared love of Carnatic music. Within three months, our parents met, and within a year, we were married. Forever grateful.",
  },
  {
    couple: "Kavya & Ramesh",
    location: "Married in Madurai, 2024",
    quote:
      "The horoscope matching and family details section made it so easy to find someone aligned with our values. A blessed beginning.",
  },
];

export function SuccessStories() {
  const { t } = useTranslation();
  return (
    <section className="py-20 lg:py-28 bg-gradient-royal text-cream relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 20% 30%, oklch(0.78 0.16 70 / 0.4), transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.78 0.16 70 / 0.3), transparent 40%)",
      }} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-saffron mb-3">✦ Sacred Stories ✦</p>
          <h2 className="font-display text-4xl lg:text-5xl">{t("stories.title")}</h2>
          <p className="mt-3 text-cream/70">{t("stories.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((s, i) => (
            <motion.blockquote
              key={s.couple}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative p-8 rounded-2xl bg-cream/5 border border-saffron/20 backdrop-blur-sm hover:border-saffron/60 transition"
            >
              <Quote className="h-8 w-8 text-saffron/60 mb-4" />
              <p className="text-cream/90 leading-relaxed italic">"{s.quote}"</p>
              <footer className="mt-6 pt-4 border-t border-saffron/20">
                <div className="font-display text-xl text-saffron">{s.couple}</div>
                <div className="text-xs text-cream/60 mt-1">{s.location}</div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
