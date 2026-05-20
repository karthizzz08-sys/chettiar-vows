import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin, GraduationCap, Briefcase, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import bride1 from "@/assets/profile-bride-1.jpg";
import bride2 from "@/assets/profile-bride-2.jpg";
import groom1 from "@/assets/profile-groom-1.jpg";
import groom2 from "@/assets/profile-groom-2.jpg";

const profiles = [
  { img: bride1, name: "Lakshmi P.", age: 26, city: "Karaikudi", edu: "M.Sc Finance", job: "Bank Manager", type: "bride" as const },
  { img: groom1, name: "Karthik S.", age: 29, city: "Chennai", edu: "B.Tech IIT", job: "Software Engineer", type: "groom" as const },
  { img: bride2, name: "Meenakshi R.", age: 24, city: "Madurai", edu: "MBBS", job: "Doctor", type: "bride" as const },
  { img: groom2, name: "Aravind M.", age: 31, city: "Coimbatore", edu: "CA", job: "Chartered Accountant", type: "groom" as const },
];

export function FeaturedProfiles() {
  const { t } = useTranslation();
  return (
    <section className="py-20 lg:py-28 bg-cream relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="divider-gold text-xs uppercase tracking-[0.3em] font-semibold mb-4">
            ✦ ஜோடி ✦
          </p>
          <h2 className="font-display text-4xl lg:text-5xl text-maroon-deep">
            {t("featured.title")}
          </h2>
          <p className="mt-3 text-maroon-deep/70">{t("featured.subtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl overflow-hidden bg-card shadow-card hover:shadow-maroon transition-all duration-500 border border-gold/20 hover:border-gold/60 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  width={768}
                  height={960}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/95 via-maroon-deep/30 to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gradient-gold text-maroon-deep">
                  {p.type === "bride" ? t("featured.bride") : t("featured.groom")}
                </span>
                <button
                  className="absolute top-3 right-3 h-9 w-9 rounded-full glass-gold flex items-center justify-center hover:bg-saffron transition"
                  aria-label="Save"
                >
                  <Heart className="h-4 w-4 text-maroon" />
                </button>
                <div className="absolute bottom-0 inset-x-0 p-4 text-cream">
                  <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                  <p className="text-sm text-saffron/90">{p.age} {t("featured.years")}</p>
                </div>
              </div>
              <div className="p-4 space-y-2 text-sm text-maroon-deep/80">
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-saffron" />{p.city}</div>
                <div className="flex items-center gap-2"><GraduationCap className="h-3.5 w-3.5 text-saffron" />{p.edu}</div>
                <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-saffron" />{p.job}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/matches"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-maroon/30 text-maroon font-semibold hover:bg-maroon hover:text-cream transition"
          >
            {t("featured.viewAll")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
