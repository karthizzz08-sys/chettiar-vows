import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { validateServerEnv, isServerEnvValid } from "@/integrations/supabase/env.server";

// Log environment status when server routes are accessed
// (not on startup, to allow Vite time to load .env)
const envLoggingMiddleware = createMiddleware().server(async ({ next }) => {
  // Check environment once per request (cached internally)
  if (!isServerEnvValid()) {
    console.warn(
      "[App] ⚠️  Some required environment variables are missing. " +
      "API routes may fail. Run 'npm run dev' again after adding env vars to .env"
    );
  }
  return await next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [envLoggingMiddleware, errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
