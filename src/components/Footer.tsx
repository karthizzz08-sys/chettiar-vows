import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Heart, Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import templeBorder from "@/assets/temple-border.png";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-gradient-royal text-cream/90 overflow-hidden">
      <div
        className="h-6 w-full opacity-60"
        style={{
          backgroundImage: `url(${templeBorder})`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center">
                <Heart className="h-5 w-5 text-maroon-deep" fill="currentColor" />
              </div>
              <span className="font-display text-2xl text-cream">{t("brand")}</span>
            </div>
            <p className="text-sm text-cream/70 leading-relaxed">{t("footer.aboutText")}</p>
          </div>

          <div>
            <h4 className="font-display text-lg text-saffron mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-saffron transition">{t("nav.home")}</Link></li>
              <li><Link to="/matches" className="hover:text-saffron transition">{t("nav.matches")}</Link></li>
              <li><Link to="/sangam" className="hover:text-saffron transition">{t("nav.sangam")}</Link></li>
              <li><Link to="/plans" className="hover:text-saffron transition">{t("nav.plans")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-saffron mb-4">{t("footer.contact")}</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li>care@chettiarconnect.com</li>
              <li>+91 98000 00000</li>
              <li>Chennai · Karaikudi · Madurai</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-saffron mb-4">Follow</h4>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Facebook, label: "Facebook" },
                { Icon: Youtube, label: "YouTube" },
                { Icon: MessageCircle, label: "WhatsApp" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="h-10 w-10 rounded-full border border-saffron/40 flex items-center justify-center hover:bg-saffron hover:text-maroon-deep transition"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-saffron/20 flex flex-col md:flex-row gap-3 justify-between items-center text-xs text-cream/60">
          <p>© {year} {t("brand")}. {t("footer.rights")}</p>
          <p className="italic">{t("footer.madeWith")} ✦</p>
        </div>
      </div>

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/919800000000"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-6 w-6" fill="currentColor" />
      </a>
    </footer>
  );
}
