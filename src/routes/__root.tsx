import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "sonner";

import "@/i18n";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  const { t, i18n } = useTranslation();
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-cream px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-saffron/30 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-maroon/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-saffron/40 animate-float"
            style={{
              top: `${(i * 43) % 100}%`,
              left: `${(i * 31) % 100}%`,
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
              animationDelay: `${(i % 6) * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-md text-center" lang={i18n.language?.startsWith("ta") ? "ta" : "en"}>
        <div className="font-display text-[10rem] leading-none font-bold text-gradient-gold drop-shadow-lg">
          404
        </div>
        <h1 className="mt-2 font-display text-3xl text-maroon-deep">{t("notFound.title")}</h1>
        <p className="mt-3 text-maroon-deep/70">{t("notFound.message")}</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-royal text-cream font-semibold shadow-maroon hover:shadow-gold hover:-translate-y-0.5 transition"
        >
          {t("notFound.home")} →
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-maroon-deep">Something went wrong</h1>
        <p className="mt-2 text-sm text-maroon-deep/70">
          We couldn't load this page. Please try again or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="px-5 py-2.5 rounded-full bg-gradient-royal text-cream font-semibold shadow-maroon"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-full border-2 border-maroon/30 text-maroon font-semibold"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Chettiar Connect — Tamil Chettiar Matrimony" },
      { name: "description", content: "Trusted Tamil Chettiar matrimony with verified profiles, traditional values, and modern matchmaking." },
      { name: "author", content: "Chettiar Connect" },
      { property: "og:title", content: "Chettiar Connect" },
      { property: "og:description", content: "Sacred bonds, woven in gold." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#8b1a1a" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Serif+Tamil:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthInvalidator() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = i18n.language?.startsWith("ta") ? "ta" : "en";
    }
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthInvalidator />
        <Outlet />
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
