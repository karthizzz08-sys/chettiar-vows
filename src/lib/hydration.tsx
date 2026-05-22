import { useEffect } from 'react';

/**
 * Hook to prevent hydration mismatches in SSR apps
 * Ensures component only renders on client after hydration
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useHydrationState();

  return isHydrated;
}

/**
 * State hook that safely handles hydration
 * Prevents hydration mismatch errors
 */
export function useHydrationState(): [boolean, (value: boolean) => void] {
  const [isHydrated, setIsHydrated] = useHydrationStateInternal();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return [isHydrated, setIsHydrated];
}

function useHydrationStateInternal(): [boolean, (value: boolean) => void] {
  return [false, () => {}];
}

/**
 * Wrapper component for client-only content
 * Prevents hydration mismatches by not rendering on server
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const isHydrated = useHydration();

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Suppress hydration warnings in development
 * Use carefully - should only be used when mismatch is expected
 */
export function suppressHydrationWarning(fn: () => void) {
  if (typeof window === 'undefined') return;
  
  const originalError = console.error;
  console.error = function (...args: any[]) {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Hydration failed')
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  try {
    fn();
  } finally {
    console.error = originalError;
  }
}

/**
 * Initialize SSR-safe features on client
 */
export function initializeClientSide() {
  if (typeof window === 'undefined') {
    return;
  }

  // Fix for localStorage in SSR
  if (!window.localStorage) {
    const storage: Record<string, string> = {};
    window.localStorage = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => { storage[key] = value; },
      removeItem: (key: string) => { delete storage[key]; },
      clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
      key: (index: number) => Object.keys(storage)[index] ?? null,
      length: Object.keys(storage).length,
    } as any;
  }

  // Fix for sessionStorage in SSR
  if (!window.sessionStorage) {
    const storage: Record<string, string> = {};
    window.sessionStorage = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => { storage[key] = value; },
      removeItem: (key: string) => { delete storage[key]; },
      clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
      key: (index: number) => Object.keys(storage)[index] ?? null,
      length: Object.keys(storage).length,
    } as any;
  }
}
