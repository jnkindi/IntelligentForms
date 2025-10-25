'use client';

import { useOffline } from '@/hooks/useOffline';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useState } from 'react';

export default function OfflineIndicator() {
  const { isOnline, queueStats, isSyncing, syncNow, retryFailed } = useOffline();
  const [showDetails, setShowDetails] = useState(false);

  const hasPending = queueStats.pending > 0 || queueStats.failed > 0;

  if (isOnline && !hasPending && !isSyncing) {
    return null; // Don't show when online and no pending items
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-sm">
        {/* Header */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-orange-600" />
            )}
            <div className="text-left">
              <div className="font-medium text-sm text-gray-900">
                {isOnline ? 'Online' : 'Offline Mode'}
              </div>
              {hasPending && (
                <div className="text-xs text-gray-600">
                  {queueStats.pending} pending
                  {queueStats.failed > 0 && `, ${queueStats.failed} failed`}
                </div>
              )}
            </div>
          </div>

          {isSyncing && (
            <RefreshCw className="h-4 w-4 text-gray-600 animate-spin" />
          )}
        </button>

        {/* Details */}
        {showDetails && (
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
            <div className="space-y-3">
              {/* Stats */}
              <div className="space-y-2">
                {queueStats.pending > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                      Pending sync
                    </span>
                    <span className="font-medium text-gray-900">
                      {queueStats.pending}
                    </span>
                  </div>
                )}

                {queueStats.failed > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                      Failed
                    </span>
                    <span className="font-medium text-gray-900">
                      {queueStats.failed}
                    </span>
                  </div>
                )}

                {queueStats.synced > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Synced
                    </span>
                    <span className="font-medium text-gray-900">
                      {queueStats.synced}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isOnline && queueStats.pending > 0 && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={syncNow}
                    isLoading={isSyncing}
                    className="flex-1"
                  >
                    <RefreshCw className="h-3 w-3 mr-1.5" />
                    Sync Now
                  </Button>
                )}

                {queueStats.failed > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={retryFailed}
                    isLoading={isSyncing}
                    className="flex-1"
                  >
                    Retry Failed
                  </Button>
                )}
              </div>

              {/* Info */}
              {!isOnline && (
                <div className="text-xs text-gray-600 bg-orange-50 border border-orange-200 rounded p-2">
                  Responses will be saved locally and synced when you're back online.
                </div>
              )}

              {isOnline && hasPending && (
                <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
                  Auto-sync in progress. Your responses are being uploaded.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
