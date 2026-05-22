/**
 * Safe Supabase utility hooks and helpers
 * Provides SSR-safe and hydration-safe Supabase operations
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { isClientEnvValid } from '@/integrations/supabase/env';

/**
 * Hook for safely using Supabase on client
 * Prevents hydration mismatches and handles missing environment
 */
export function useSupabaseClient() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Supabase is properly configured
    if (!isClientEnvValid()) {
      setError('Supabase is not properly configured');
      console.warn('[useSupabaseClient] Supabase environment variables not set');
    } else {
      setError(null);
    }
    // Only set ready on client after hydration
    setIsReady(true);
  }, []);

  return {
    supabase: isReady && !error ? supabase : null,
    isReady,
    error,
    isConfigured: isClientEnvValid(),
  };
}

/**
 * Safe auth state getter
 * Handles cases where Supabase is not initialized
 */
export async function getSafeAuthState() {
  try {
    if (!isClientEnvValid()) {
      return { session: null, user: null, error: 'Supabase not configured' };
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('[getSafeAuthState] Error:', error.message);
      return { session: null, user: null, error: error.message };
    }

    return {
      session,
      user: session?.user || null,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[getSafeAuthState] Exception:', message);
    return { session: null, user: null, error: message };
  }
}

/**
 * Safe sign-in with email OTP
 * Handles environment configuration and error cases
 */
export async function safeSignInWithOtp(email: string) {
  try {
    if (!isClientEnvValid()) {
      throw new Error('Authentication service is not available');
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
    });

    if (error) {
      console.error('[safeSignInWithOtp] Error:', error.message);
      throw new Error(error.message || 'Failed to send verification code');
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[safeSignInWithOtp] Exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Safe verify OTP
 * Handles verification errors gracefully
 */
export async function safeVerifyOtp(email: string, token: string) {
  try {
    if (!isClientEnvValid()) {
      throw new Error('Authentication service is not available');
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token,
      type: 'email',
    });

    if (error) {
      console.error('[safeVerifyOtp] Error:', error.message);
      throw new Error(error.message || 'Invalid or expired code');
    }

    return { success: true, session: data.session, user: data.user, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[safeVerifyOtp] Exception:', message);
    return { success: false, session: null, user: null, error: message };
  }
}

/**
 * Safe sign out
 * Handles sign-out errors without crashing
 */
export async function safeSignOut() {
  try {
    if (!isClientEnvValid()) {
      return { success: true, error: null };
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[safeSignOut] Error:', error.message);
      // Don't throw, just log - sign out is best-effort
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[safeSignOut] Exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Hook for monitoring auth state changes
 * Safely handles Supabase listeners with cleanup
 */
export function useAuthStateListener(onStateChange?: (isSignedIn: boolean) => void) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isClientEnvValid()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Get initial state
    getSafeAuthState().then(({ session }) => {
      const signed = !!session;
      setIsSignedIn(signed);
      onStateChange?.(signed);
      setIsLoading(false);
    });

    // Listen for changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const signed = !!session;
      setIsSignedIn(signed);
      onStateChange?.(signed);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [onStateChange]);

  return { isSignedIn, isLoading };
}

/**
 * Hook for safe auth error handling
 * Prevents exposure of sensitive error details
 */
export function useAuthErrorHandler() {
  const handleAuthError = useCallback((error: unknown) => {
    if (!error) return null;

    let message = 'An authentication error occurred';

    if (error instanceof Error) {
      // Map Supabase errors to user-friendly messages
      if (error.message.includes('Invalid OTP')) {
        message = 'Invalid or expired code. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Please verify your email first.';
      } else if (error.message.includes('User not found')) {
        message = 'No account found with this email.';
      } else if (error.message.includes('Invalid credentials')) {
        message = 'Invalid email or password.';
      } else if (error.message.includes('user_already_exists')) {
        message = 'An account already exists with this email.';
      } else if (error.message.includes('network')) {
        message = 'Network error. Please check your connection.';
      }
    }

    console.error('[Auth Error]', error);
    return message;
  }, []);

  return { handleAuthError };
}
