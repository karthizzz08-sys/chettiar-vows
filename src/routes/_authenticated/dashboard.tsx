import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Eye, Heart, Pencil, Sparkles, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getMyProfile, listMatches } from "@/lib/profile.functions";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Chettiar Connect" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, signOut } = useAuth();
  const getProfile = useServerFn(getMyProfile);
  const getMatches = useServerFn(listMatches);

  const profileQ = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getProfile(),
    enabled: !!user,
  });
  const matchesQ = useQuery({
    queryKey: ["my-matches"],
    queryFn: () => getMatches(),
    enabled: !!user,
  });

  const profile = profileQ.data?.profile;
  const completion = profile?.profile_completion ?? 10;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-cream">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-gradient-royal text-cream p-8 shadow-maroon relative overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 h-40 w-40 bg-saffron/20 rounded-full blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-saffron">Vanakkam 🙏</p>
                <h1 className="font-display text-3xl mt-1">
                  {profile?.full_name || "Complete your profile"}
                </h1>
                <p className="text-cream/80 text-sm mt-1">{user?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-full bg-cream/10 border border-cream/30 text-sm hover:bg-cream/20"
              >
                Sign out
              </button>
            </div>
            <div className="relative mt-6">
              <div className="flex items-center justify-between text-xs text-cream/80 mb-2">
                <span>Profile completion</span>
                <span className="font-semibold text-saffron">{completion}%</span>
              </div>
              <div className="h-2 bg-cream/15 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-gold"
                />
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <StatCard icon={Users} label="Matches" value={matchesQ.data?.matches.length ?? "—"} />
            <StatCard icon={Heart} label="Interests" value="0" />
            <StatCard icon={Sparkles} label="Saved" value="0" />
            <StatCard icon={Eye} label="Visitors" value="0" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            <Link
              to="/dashboard/profile"
              className="lg:col-span-1 rounded-2xl border-2 border-gold/30 bg-cream p-6 hover:shadow-gold transition group"
            >
              <Pencil className="h-6 w-6 text-saffron mb-3" />
              <h3 className="font-display text-xl text-maroon-deep">Edit your profile</h3>
              <p className="text-sm text-maroon-deep/70 mt-1">
                Add horoscope, photos, family details & expectations.
              </p>
              <span className="inline-block mt-4 text-maroon font-semibold text-sm group-hover:underline">
                Open editor →
              </span>
            </Link>

            <div className="lg:col-span-2 rounded-2xl border border-gold/30 bg-cream p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-maroon-deep">Recommended matches</h3>
                <Link to="/matches" className="text-sm text-maroon hover:underline">View all</Link>
              </div>
              {matchesQ.isLoading ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
              ) : (matchesQ.data?.matches.length ?? 0) === 0 ? (
                <p className="text-sm text-maroon-deep/60 py-6 text-center">
                  Complete your profile to see compatible matches.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {matchesQ.data!.matches.slice(0, 6).map((m) => (
                    <div key={m.user_id} className="rounded-xl border border-gold/30 p-4 bg-white">
                      <p className="font-semibold text-maroon-deep">{m.full_name}</p>
                      <p className="text-xs text-maroon-deep/70 mt-0.5">
                        {[m.profession, m.city].filter(Boolean).join(" • ") || "Chettiar community"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-cream border border-gold/30 p-5 shadow-card">
      <Icon className="h-5 w-5 text-saffron" />
      <p className="mt-3 text-2xl font-display text-maroon-deep">{value}</p>
      <p className="text-xs uppercase tracking-wider text-maroon-deep/60 mt-0.5">{label}</p>
    </div>
  );
}
