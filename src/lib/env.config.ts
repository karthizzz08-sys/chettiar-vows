/**
 * Environment Variable Configuration & Validation
 * 
 * Handles loading, validating, and logging environment variables
 * for both frontend (VITE_*) and backend (process.env) contexts
 */

/**
 * Server-side environment variables
 * These MUST be set for API routes to work correctly
 */
export const serverEnv = {
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Brevo Email Service
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME,
};

/**
 * Frontend-safe environment variables
 * These are injected by Vite and safe to expose
 */
export const clientEnv = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

/**
 * Validate server environment variables
 * Returns { isValid, errors, missingVars }
 */
export function validateServerEnv() {
  const errors: string[] = [];
  const missingVars: string[] = [];

  // Required Supabase variables
  if (!serverEnv.SUPABASE_URL) {
    missingVars.push("SUPABASE_URL");
    errors.push("Missing SUPABASE_URL environment variable");
  }

  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
    errors.push(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
        "Get it from Supabase dashboard: Project Settings → API → service_role key"
    );
  }

  // Required Brevo variables
  if (!serverEnv.BREVO_API_KEY) {
    missingVars.push("BREVO_API_KEY");
    errors.push("Missing BREVO_API_KEY environment variable");
  }

  if (!serverEnv.BREVO_SENDER_EMAIL) {
    missingVars.push("BREVO_SENDER_EMAIL");
    errors.push("Missing BREVO_SENDER_EMAIL environment variable");
  }

  if (!serverEnv.BREVO_SENDER_NAME) {
    missingVars.push("BREVO_SENDER_NAME");
    errors.push("Missing BREVO_SENDER_NAME environment variable");
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    missingVars,
  };
}

/**
 * Log environment status for debugging
 * Safely logs which env vars are set (without exposing values)
 */
export function logEnvStatus(context: string = "App Startup") {
  console.log(`\n[ENV] ${context} - Environment Status:`);
  console.log("[ENV] ✓ Client-side variables:");
  console.log(`[ENV]   - VITE_SUPABASE_URL: ${serverEnv.SUPABASE_URL ? "✓" : "✗"}`);
  console.log(
    `[ENV]   - VITE_SUPABASE_ANON_KEY: ${serverEnv.SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗"}`
  );

  console.log("[ENV] ✓ Server-side variables:");
  console.log(`[ENV]   - SUPABASE_URL: ${serverEnv.SUPABASE_URL ? "✓" : "✗"}`);
  console.log(
    `[ENV]   - SUPABASE_SERVICE_ROLE_KEY: ${serverEnv.SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗"}`
  );
  console.log(`[ENV]   - BREVO_API_KEY: ${serverEnv.BREVO_API_KEY ? "✓" : "✗"}`);
  console.log(`[ENV]   - BREVO_SENDER_EMAIL: ${serverEnv.BREVO_SENDER_EMAIL ? "✓" : "✗"}`);
  console.log(`[ENV]   - BREVO_SENDER_NAME: ${serverEnv.BREVO_SENDER_NAME ? "✓" : "✗"}`);

  const validation = validateServerEnv();
  if (!validation.isValid) {
    console.log("\n[ENV] ⚠️  Missing environment variables:");
    validation.errors.forEach((error) => {
      console.log(`[ENV]   ✗ ${error}`);
    });
    console.log("\n[ENV] ⚠️  To fix, add these to .env:");
    console.log(`[ENV]   SUPABASE_SERVICE_ROLE_KEY=<your_key_from_supabase>`);
  } else {
    console.log("\n[ENV] ✅ All environment variables configured correctly!");
  }
  console.log("");
}

/**
 * Get a specific server environment variable with fallback
 */
export function getServerEnvVar(key: keyof typeof serverEnv, fallback?: string): string | undefined {
  const value = serverEnv[key];
  if (!value && !fallback) {
    console.warn(`[ENV] Missing environment variable: ${key}`);
  }
  return value || fallback;
}

/**
 * Assert that all required server env vars are set
 * Throws an error if any are missing (useful for API routes)
 */
export function assertServerEnv() {
  const validation = validateServerEnv();
  if (!validation.isValid) {
    const missingList = validation.missingVars.join(", ");
    const error = new Error(`Missing required environment variables: ${missingList}`);
    console.error("[ENV] ✗ Environment validation failed:", error.message);
    throw error;
  }
}

/**
 * Check if running in development mode
 */
export const isDev = import.meta.env.DEV;

/**
 * Check if running in production mode
 */
export const isProd = import.meta.env.PROD;
