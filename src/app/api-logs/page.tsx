'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, XCircle, Clock, RefreshCw, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ApiLog {
  id: number;
  requestPayload: string | null;
  responseStatus: number | null;
  responseBody: string | null;
  errorMessage: string | null;
  executedAt: string;
  replier: {
    id: number;
    date: string;
    ipAddress: string | null;
  } | null;
}

interface ExternalApiInfo {
  id: number;
  url: string;
  method: string;
  enabled: boolean;
}

export default function ApiLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get('id') ? parseInt(searchParams.get('id')!) : null;

  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [apiInfo, setApiInfo] = useState<ExternalApiInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);

  const fetchLogs = async () => {
    if (!formId) {
      router.push('/manage-forms');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/forms/${formId}/external-api/logs`);

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(data.data.logs);
      setApiInfo(data.data.externalApi);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load API logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [formId]);

  const getStatusColor = (status: number | null) => {
    if (status === null || status === 0) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (log: ApiLog) => {
    if (log.errorMessage) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    if (log.responseStatus && log.responseStatus >= 200 && log.responseStatus < 300) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Calculate statistics
  const totalCalls = logs.length;
  const successfulCalls = logs.filter(
    (log) => log.responseStatus && log.responseStatus >= 200 && log.responseStatus < 300
  ).length;
  const failedCalls = logs.filter(
    (log) => log.errorMessage || !log.responseStatus || log.responseStatus >= 400
  ).length;
  const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/manage-forms">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                External API Logs
              </h1>
              {apiInfo && (
                <div className="text-sm text-gray-600">
                  <p>Endpoint: <span className="font-mono">{apiInfo.url}</span></p>
                  <p>Method: <span className="font-semibold">{apiInfo.method}</span></p>
                  <p>Status: <span className={apiInfo.enabled ? 'text-green-600' : 'text-red-600'}>
                    {apiInfo.enabled ? 'Enabled' : 'Disabled'}
                  </span></p>
                </div>
              )}
            </div>
            <Button onClick={fetchLogs} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {logs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total API Calls</p>
                    <p className="text-3xl font-bold text-gray-900">{totalCalls}</p>
                    <p className="text-xs text-gray-500 mt-1">All time requests</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Successful Calls</p>
                    <p className="text-3xl font-bold text-gray-900">{successfulCalls}</p>
                    <p className="text-xs text-gray-500 mt-1">HTTP 200-299 responses</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Failed Calls</p>
                    <p className="text-3xl font-bold text-gray-900">{failedCalls}</p>
                    <p className="text-xs text-gray-500 mt-1">Errors and 4xx/5xx codes</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{successRate.toFixed(0)}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {successfulCalls}/{totalCalls} successful
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!apiInfo && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <p className="text-yellow-800">
                No external API configured for this form.{' '}
                <Link
                  href={`/save-data-externally?id=${formId}`}
                  className="text-yellow-900 underline hover:no-underline"
                >
                  Configure now
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {apiInfo && logs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                No API calls logged yet. Logs will appear here when users submit the form.
              </p>
            </CardContent>
          </Card>
        )}

        {logs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logs List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent API Calls ({logs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedLog?.id === log.id
                          ? 'bg-primary-50 border-primary-300'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getStatusIcon(log)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(log.executedAt)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Submission #{log.replier?.id || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${getStatusColor(log.responseStatus)}`}>
                          {log.responseStatus || 'Failed'}
                        </span>
                      </div>
                      {log.errorMessage && (
                        <p className="mt-2 text-xs text-red-600 truncate">
                          {log.errorMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Log Details */}
            <Card>
              <CardHeader>
                <CardTitle>Log Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedLog ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedLog)}
                        <span className={`font-semibold ${getStatusColor(selectedLog.responseStatus)}`}>
                          {selectedLog.responseStatus
                            ? `HTTP ${selectedLog.responseStatus}`
                            : 'Request Failed'
                          }
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Executed At</h3>
                      <p className="text-sm text-gray-900">{formatDate(selectedLog.executedAt)}</p>
                    </div>

                    {selectedLog.requestPayload && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Request Payload</h3>
                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(JSON.parse(selectedLog.requestPayload), null, 2)}
                        </pre>
                      </div>
                    )}

                    {selectedLog.responseBody && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Response Body</h3>
                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-48">
                          {selectedLog.responseBody}
                        </pre>
                      </div>
                    )}

                    {selectedLog.errorMessage && (
                      <div>
                        <h3 className="text-sm font-semibold text-red-700 mb-2">Error Message</h3>
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                          {selectedLog.errorMessage}
                        </p>
                      </div>
                    )}

                    {selectedLog.replier && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Submission Info</h3>
                        <div className="text-sm text-gray-900 space-y-1">
                          <p>Submission ID: #{selectedLog.replier.id}</p>
                          <p>Date: {formatDate(selectedLog.replier.date)}</p>
                          {selectedLog.replier.ipAddress && (
                            <p>IP: {selectedLog.replier.ipAddress}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Select a log to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
