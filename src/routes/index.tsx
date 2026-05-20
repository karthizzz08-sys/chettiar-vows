import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedProfiles } from "@/components/FeaturedProfiles";
import { SuccessStories } from "@/components/SuccessStories";
import { MembershipPlans } from "@/components/MembershipPlans";
import { SangamHighlight } from "@/components/SangamHighlight";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chettiar Connect — Trusted Tamil Chettiar Matrimony" },
      {
        name: "description",
        content:
          "Find your perfect life partner within the Tamil Chettiar community. 50,000+ verified profiles, traditional values, modern matchmaking. Free to join.",
      },
      { property: "og:title", content: "Chettiar Connect — Tamil Chettiar Matrimony" },
      { property: "og:description", content: "Sacred bonds, woven in gold. Trusted Chettiar matrimony platform." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedProfiles />
        <SuccessStories />
        <SangamHighlight />
        <MembershipPlans />
      </main>
      <Footer />
    </div>
  );
}
