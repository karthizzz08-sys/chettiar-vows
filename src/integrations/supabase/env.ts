/**
 * Environment configuration validation
 * Safely loads and validates Supabase environment variables
 * Prevents frontend exposure of sensitive keys
 */

// Client-side environment variables (safe to expose)
export const envClient = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Validate client environment on first access
let clientValidated = false;

export function validateClientEnv() {
  if (clientValidated) return;
  
  if (!envClient.supabaseUrl) {
    console.error(
      '[Supabase] Missing VITE_SUPABASE_URL environment variable. ' +
      'Add it to your .env file: VITE_SUPABASE_URL=https://your-project.supabase.co'
    );
  }
  
  if (!envClient.supabaseAnonKey) {
    console.error(
      '[Supabase] Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable. ' +
      'Add it to your .env file with the anonymous role key from Supabase dashboard'
    );
  }
  
  clientValidated = true;
}

export function isClientEnvValid(): boolean {
  return !!(envClient.supabaseUrl && envClient.supabaseAnonKey);
}

export function getClientEnvErrors(): string[] {
  const errors: string[] = [];
  
  if (!envClient.supabaseUrl) {
    errors.push('VITE_SUPABASE_URL');
  }
  
  if (!envClient.supabaseAnonKey) {
    errors.push('VITE_SUPABASE_PUBLISHABLE_KEY');
  }
  
  return errors;
}

// Server-side environment variables (never exposed to client)
// This object is only available in server-side code
export const envServer = {
  supabaseUrl: typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined,
  supabaseServiceRoleKey: typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined,
};

// Validate server environment (only called on server)
let serverValidated = false;

export function validateServerEnv() {
  if (serverValidated) return;
  
  if (!envServer.supabaseUrl) {
    console.error(
      '[Supabase] Missing SUPABASE_URL environment variable on server. ' +
      'Add it to your server .env: SUPABASE_URL=https://your-project.supabase.co'
    );
  }
  
  if (!envServer.supabaseServiceRoleKey) {
    console.error(
      '[Supabase] Missing SUPABASE_SERVICE_ROLE_KEY environment variable on server. ' +
      'Add it to your server .env with the service role key from Supabase dashboard'
    );
  }
  
  serverValidated = true;
}

export function isServerEnvValid(): boolean {
  return !!(envServer.supabaseUrl && envServer.supabaseServiceRoleKey);
}

export function getServerEnvErrors(): string[] {
  const errors: string[] = [];
  
  if (!envServer.supabaseUrl) {
    errors.push('SUPABASE_URL');
  }
  
  if (!envServer.supabaseServiceRoleKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return errors;
}

/**
 * Error handler for environment configuration
 * Returns graceful error UI or fallback instead of crashing
 */
export function handleEnvError(context: 'client' | 'server', operation: string): never {
  const errors = context === 'client' ? getClientEnvErrors() : getServerEnvErrors();
  
  const message = 
    `[Supabase ${context}] Cannot perform "${operation}" ` +
    `- missing environment variable(s): ${errors.join(', ')}`;
  
  console.error(message);
  throw new Error(message);
}

/**
 * Safe environment access for Supabase operations
 * Returns null/false instead of throwing if env is invalid
 */
export function canInitializeSupabase(context: 'client' | 'server' = 'client'): boolean {
  if (context === 'client') {
    return isClientEnvValid();
  } else {
    return isServerEnvValid();
  }
}

/**
 * Get environment status for debugging
 */
export function getEnvStatus() {
  return {
    client: {
      valid: isClientEnvValid(),
      errors: getClientEnvErrors(),
      url: envClient.supabaseUrl ? 'configured' : 'missing',
      anonKey: envClient.supabaseAnonKey ? 'configured' : 'missing',
    },
    server: {
      valid: isServerEnvValid(),
      errors: getServerEnvErrors(),
      url: envServer.supabaseUrl ? 'configured' : 'missing',
      serviceRoleKey: envServer.supabaseServiceRoleKey ? 'configured' : 'missing',
    },
  };
}
