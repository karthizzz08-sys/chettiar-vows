import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
        <div className="text-center max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-xs font-semibold text-maroon uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Phase 2 — Coming Soon
          </div>
          <h1 className="font-display text-5xl text-maroon-deep">{title}</h1>
          <p className="mt-4 text-maroon-deep/70">{subtitle}</p>
          <Link
            to="/"
            className="mt-8 inline-flex px-6 py-3 rounded-full bg-gradient-royal text-cream font-semibold shadow-maroon"
          >
            ← Back home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "Find Matches — Chettiar Connect" }] }),
  component: () => (
    <ComingSoon
      title="Find Matches"
      subtitle="AI compatibility scoring, filters, and verified profiles are coming in our next update."
    />
  ),
});

export { ComingSoon };
