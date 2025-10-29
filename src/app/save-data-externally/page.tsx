'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface FormField {
  id: number;
  field: string;
}

interface FormData {
  id: number;
  title: string;
  fields: FormField[];
}

interface ExternalApiData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers: string;
  enabled: boolean;
  fieldMappings: Array<{
    fieldId: number;
    externalFieldName: string;
  }>;
}

function SaveDataExternallyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get('id') ? parseInt(searchParams.get('id')!) : null;

  const [form, setForm] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiData, setApiData] = useState<ExternalApiData>({
    url: '',
    method: 'POST',
    headers: '{}',
    enabled: true,
    fieldMappings: [],
  });

  useEffect(() => {
    async function fetchFormAndApi() {
      if (!formId) {
        router.push('/manage-forms');
        return;
      }

      try {
        // Fetch form details
        const formResponse = await fetch(`/api/forms/${formId}`);
        if (!formResponse.ok) {
          throw new Error('Form not found');
        }
        const formData = await formResponse.json();
        setForm(formData.data);

        // Fetch existing external API config
        const apiResponse = await fetch(`/api/forms/${formId}/external-api`);
        if (apiResponse.ok) {
          const apiConfigData = await apiResponse.json();
          if (apiConfigData.data) {
            setApiData({
              url: apiConfigData.data.url,
              method: apiConfigData.data.method,
              headers: apiConfigData.data.headers || '{}',
              enabled: apiConfigData.data.enabled,
              fieldMappings: apiConfigData.data.fields.map((f: any) => ({
                fieldId: f.fieldId,
                externalFieldName: f.externalFieldName,
              })),
            });
          } else {
            // Initialize with empty mappings for each field
            setApiData(prev => ({
              ...prev,
              fieldMappings: formData.data.fields.map((field: FormField) => ({
                fieldId: field.id,
                externalFieldName: '',
              })),
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching form:', error);
        toast.error('Failed to load form');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFormAndApi();
  }, [formId, router]);

  const handleMappingChange = (fieldId: number, externalFieldName: string) => {
    setApiData(prev => {
      const existingIndex = prev.fieldMappings.findIndex(m => m.fieldId === fieldId);

      if (existingIndex >= 0) {
        const newMappings = [...prev.fieldMappings];
        newMappings[existingIndex] = { fieldId, externalFieldName };
        return { ...prev, fieldMappings: newMappings };
      } else {
        return {
          ...prev,
          fieldMappings: [...prev.fieldMappings, { fieldId, externalFieldName }],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate headers JSON
      let headersString = apiData.headers.trim();
      let parsed: any;

      try {
        // First, try to parse as-is
        parsed = JSON.parse(headersString);
      } catch (firstError) {
        // If parsing fails, try to auto-fix common issues (single quotes to double quotes)
        try {
          const fixedJson = headersString.replace(/'/g, '"');
          parsed = JSON.parse(fixedJson);
          // If auto-fix worked, update the headers string
          headersString = fixedJson;
        } catch (secondError) {
          // Both attempts failed, show error
          const errorMessage = (secondError as Error).message || 'Invalid JSON format';
          toast.error(
            `Invalid JSON format in headers: ${errorMessage}. JSON requires double quotes for keys and string values. Example: {"accept": "json"}`
          );
          setIsSaving(false);
          return;
        }
      }

      // Ensure it's an object
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        toast.error('Headers must be a JSON object (not an array). Example: {"accept": "json"}');
        setIsSaving(false);
        return;
      }

      // Update with valid JSON string (normalized)
      apiData.headers = JSON.stringify(parsed);

      // Filter out empty mappings
      const validMappings = apiData.fieldMappings.filter(m => m.externalFieldName.trim() !== '');

      if (validMappings.length === 0) {
        toast.error('Please map at least one field');
        setIsSaving(false);
        return;
      }

      const response = await fetch(`/api/forms/${formId}/external-api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...apiData,
          fieldMappings: validMappings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save configuration');
      }

      toast.success('External API configuration saved successfully!');
      router.push('/manage-forms');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/manage-forms">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">External API Integration</h1>
          <p className="text-gray-600">
            Configure webhook to send form submissions to an external API
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="API URL"
                type="url"
                value={apiData.url}
                onChange={e => setApiData(prev => ({ ...prev, url: e.target.value }))}
                required
                placeholder="https://api.example.com/webhook"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTTP Method</label>
                <select
                  value={apiData.method}
                  onChange={e =>
                    setApiData(prev => ({
                      ...prev,
                      method: e.target.value as any,
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="GET">GET</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Headers (JSON)
                </label>
                <textarea
                  value={apiData.headers}
                  onChange={e => setApiData(prev => ({ ...prev, headers: e.target.value }))}
                  rows={4}
                  placeholder='{"Authorization": "Bearer token", "X-Custom-Header": "value"}'
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Add custom HTTP headers as JSON. Leave as {'{}'} if no custom headers needed.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={apiData.enabled}
                  onChange={e => setApiData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                  Enable webhook
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Field Mappings */}
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Map your form fields to the external API field names
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.fields.map(field => {
                const mapping = apiData.fieldMappings.find(m => m.fieldId === field.id);
                return (
                  <div key={field.id} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Form Field
                      </label>
                      <input
                        type="text"
                        value={field.field}
                        disabled
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                      />
                    </div>
                    <Input
                      label="External Field Name"
                      value={mapping?.externalFieldName || ''}
                      onChange={e => handleMappingChange(field.id, e.target.value)}
                      placeholder="e.g., email_address"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>
                  When a user submits your form, the data will be automatically sent to your
                  external API
                </li>
                <li>Only fields with mapped external names will be included in the request</li>
                <li>The data is sent as JSON in the request body</li>
                <li>Form submissions are saved even if the external API fails</li>
              </ul>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="lg" isLoading={isSaving}>
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SaveDataExternallyPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50 min-h-screen py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <SaveDataExternallyContent />
    </Suspense>
  );
}
