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
 */
let serverValidated = false;
const serverErrors: string[] = [];

export function validateServerEnv() {
  if (serverValidated) return;

  serverErrors.length = 0; // Clear previous errors

  // Supabase URL is required
  if (!envServer.supabaseUrl) {
    serverErrors.push(
      "SUPABASE_URL - Required for server-side operations. " +
      "Add to .env: SUPABASE_URL=https://your-project.supabase.co"
    );
  }

  // Brevo API key is required for email sending
  if (!envServer.brevoApiKey) {
    serverErrors.push(
      "BREVO_API_KEY - Required for sending OTP emails. " +
      "Add to .env: BREVO_API_KEY=your_brevo_api_key"
    );
  }

  if (serverErrors.length > 0) {
    console.error(
      "[Supabase Server] Environment validation failed:\n" +
      serverErrors.map(e => `  - ${e}`).join("\n")
    );
  }

  serverValidated = true;
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
