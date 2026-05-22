/**
 * Server-side Environment Configuration
 * Loads and validates server-only environment variables
 * Use process.env for server-side operations
 */

/**
 * Get server-side environment variables
 * These should NEVER be exposed to the frontend
 */
export const envServer = {
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  brevoApiKey: process.env.BREVO_API_KEY,
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || "noreply@chettiarconnect.com",
  brevoSenderName: process.env.BREVO_SENDER_NAME || "Chettiar Connect",
};

/**
 * Validate server environment on first access
 * Uses lazy initialization to ensure env vars are loaded
 */
let serverValidated = false;
const serverErrors: string[] = [];
const serverWarnings: string[] = [];

function validateServerEnvOnce() {
  if (serverValidated) return;

  serverErrors.length = 0; // Clear previous errors
  serverWarnings.length = 0; // Clear previous warnings

  // Re-read environment variables fresh (lazy evaluation)
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const roleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const brevoKey = process.env.BREVO_API_KEY;

  // Supabase URL is required
  if (!url) {
    serverErrors.push(
      "SUPABASE_URL - Required for server-side operations. " +
      "Add to .env: SUPABASE_URL=https://your-project.supabase.co"
    );
  }

  // Supabase Service Role Key is CRITICAL for OTP verification and user creation
  if (!roleKey) {
    serverErrors.push(
      "SUPABASE_SERVICE_ROLE_KEY - REQUIRED for OTP verification and user creation. " +
      "Get it from Supabase dashboard: Project Settings → API → service_role key. " +
      "Add to .env: SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi..."
    );
  }

  // Brevo API key is required for email sending
  if (!brevoKey) {
    serverErrors.push(
      "BREVO_API_KEY - Required for sending OTP emails. " +
      "Add to .env: BREVO_API_KEY=xkeysib-..."
    );
  }

  if (!process.env.BREVO_SENDER_EMAIL) {
    serverWarnings.push(
      "BREVO_SENDER_EMAIL - Using default noreply@chettiarconnect.com. " +
      "Set in .env for custom sender email."
    );
  }

  if (serverErrors.length > 0) {
    console.error(
      "[Supabase Server] ❌ Environment validation FAILED:\n" +
      serverErrors.map(e => `  ✗ ${e}`).join("\n")
    );
  }

  if (serverWarnings.length > 0) {
    console.warn(
      "[Supabase Server] ⚠️  Warnings:\n" +
      serverWarnings.map(w => `  ⚠️  ${w}`).join("\n")
    );
  }

  if (serverErrors.length === 0) {
    console.log("[Supabase Server] ✅ All required environment variables configured");
  }

  serverValidated = true;
}

export function validateServerEnv() {
  validateServerEnvOnce();
}

/**
 * Check if server environment is valid
 */
export function isServerEnvValid(): boolean {
  validateServerEnv();
  return serverErrors.length === 0;
}

/**
 * Get server environment errors
 */
export function getServerEnvErrors(): string[] {
  validateServerEnv();
  return [...serverErrors];
}

/**
 * Get a specific server env variable with fallback
 */
export function getServerEnv(key: keyof typeof envServer, fallback?: string): string | undefined {
  const value = envServer[key];
  return value || fallback;
}

/**
 * Assert server env is valid or throw error
 */
export function assertServerEnvValid(message?: string) {
  if (!isServerEnvValid()) {
    const errors = getServerEnvErrors();
    throw new Error(
      message ||
      `Server environment is not properly configured:\n${errors.join("\n")}`
    );
  }
}

/**
 * Check if specific server env variables are available
 */
export function hasServerEnv(...keys: (keyof typeof envServer)[]): boolean {
  return keys.every(key => envServer[key]);
}
