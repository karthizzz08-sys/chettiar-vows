/**
 * Environment configuration debugging component
 * Shows the status of Supabase environment variables
 * Only visible in development mode
 */

import { useState } from 'react';
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import { getEnvStatus } from '@/integrations/supabase/env';

export function EnvConfigDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const status = getEnvStatus();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-white text-xs font-mono hover:bg-gray-700 transition"
      >
        <span>Env Config</span>
        <ChevronDown
          className="h-4 w-4"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 p-4 rounded-lg bg-gray-900 text-gray-100 text-xs font-mono w-80 max-h-96 overflow-auto border border-gray-700">
          <div className="space-y-4">
            {/* Client Environment */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {status.client.valid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-semibold">Client Environment</span>
              </div>
              <div className="pl-6 space-y-1 text-gray-400">
                <div>
                  <span className="text-gray-500">Supabase URL:</span> {status.client.url}
                </div>
                <div>
                  <span className="text-gray-500">Anon Key:</span> {status.client.anonKey}
                </div>
                {status.client.errors.length > 0 && (
                  <div className="text-red-400 mt-2">
                    Missing: {status.client.errors.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Server Environment */}
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center gap-2 mb-2">
                {status.server.valid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="font-semibold">Server Environment</span>
              </div>
              <div className="pl-6 space-y-1 text-gray-400">
                <div>
                  <span className="text-gray-500">Supabase URL:</span> {status.server.url}
                </div>
                <div>
                  <span className="text-gray-500">Service Role Key:</span> {status.server.serviceRoleKey}
                </div>
                {status.server.errors.length > 0 && (
                  <div className="text-yellow-400 mt-2">
                    Missing: {status.server.errors.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Overall Status */}
            <div className="border-t border-gray-700 pt-4">
              <div className="font-semibold mb-2">Overall Status</div>
              <div className="pl-2 space-y-1 text-sm">
                {status.client.valid && status.server.valid ? (
                  <div className="text-green-400">✓ All environment variables configured</div>
                ) : (
                  <div className="space-y-1">
                    {!status.client.valid && (
                      <div className="text-red-400">✗ Client environment incomplete</div>
                    )}
                    {!status.server.valid && (
                      <div className="text-yellow-400">⚠ Server environment incomplete</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
