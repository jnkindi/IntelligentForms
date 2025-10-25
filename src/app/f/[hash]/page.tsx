'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { CheckCircle, Download } from 'lucide-react';
import { offlineQueue } from '@/lib/offline/queue';
import { registerServiceWorker } from '@/lib/offline/register-sw';
import { useFormCache } from '@/hooks/useOffline';
import OfflineIndicator from '@/components/offline/OfflineIndicator';

interface FormField {
  id: number;
  field: string;
  answerType: string;
  answerSubtype: string | null;
  required: boolean;
  placeholder: string | null;
  expectedAnswers: Array<{
    id: number;
    answer: string;
  }>;
}

interface FormData {
  id: number;
  title: string;
  description: string | null;
  type: string;
  status: string;
  fields: FormField[];
}

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const hash = params.hash as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { isCached, cacheForm, loadFromCache } = useFormCache(hash);

  // Register service worker
  useEffect(() => {
    registerServiceWorker().catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchForm() {
      try {
        // Try to load from cache first if offline
        if (!navigator.onLine) {
          const cached = await loadFromCache();
          if (cached) {
            setForm({
              id: 0,
              title: cached.title,
              description: cached.description,
              type: 'FORM',
              status: 'ACTIVE',
              fields: cached.fields,
            });
            toast.success('Loaded from offline cache');
            setIsLoading(false);
            return;
          }
        }

        const response = await fetch(`/api/public/forms/${hash}`);
        if (!response.ok) {
          throw new Error('Form not found');
        }
        const data = await response.json();
        setForm(data.data);

        // Cache form for offline use
        if (data.data && navigator.onLine) {
          await cacheForm(data.data).catch(console.error);
        }
      } catch (error) {
        console.error('Error fetching form:', error);

        // Try cache as fallback
        const cached = await loadFromCache();
        if (cached) {
          setForm({
            id: 0,
            title: cached.title,
            description: cached.description,
            type: 'FORM',
            status: 'ACTIVE',
            fields: cached.fields,
          });
          toast('Loaded from offline cache');
        } else {
          toast.error('Form not found or is inactive');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchForm();
  }, [hash]);

  const handleChange = (fieldId: number, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: number, value: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, value] };
      } else {
        return { ...prev, [fieldId]: current.filter((v: string) => v !== value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      const missingFields = form?.fields.filter(
        (field) => field.required && !formData[field.id]
      );

      if (missingFields && missingFields.length > 0) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Try online submission first
      if (navigator.onLine) {
        try {
          const response = await fetch(`/api/public/forms/${hash}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: formData }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to submit form');
          }

          setIsSubmitted(true);
          toast.success('Form submitted successfully!');
          return;
        } catch (networkError) {
          console.warn('Online submission failed, using offline queue:', networkError);
          // Fall through to offline queue
        }
      }

      // Use offline queue
      await offlineQueue.enqueue(hash, formData);
      setIsSubmitted(true);

      if (navigator.onLine) {
        toast.success('Form submitted! (Syncing in background)');
      } else {
        toast.success('Saved offline! Will sync when you\'re back online');
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Form Not Found
            </h2>
            <p className="text-gray-600">
              This form is either inactive or doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600">
              Your response has been submitted successfully.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{form.title}</CardTitle>
            {form.description && (
              <p className="text-gray-600 mt-2">{form.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map((field) => (
                <div key={field.id}>
                  {field.answerType === 'TEXT' && (
                    <>
                      {field.answerSubtype === 'textbox' ? (
                        <Textarea
                          label={field.field}
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          rows={4}
                        />
                      ) : (
                        <Input
                          label={field.field}
                          type={
                            field.answerSubtype === 'date'
                              ? 'date'
                              : field.answerSubtype === 'number'
                              ? 'number'
                              : field.answerSubtype === 'phone'
                              ? 'tel'
                              : 'text'
                          }
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                        />
                      )}
                    </>
                  )}

                  {field.answerType === 'SINGLE_ANSWER' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.field}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <div className="space-y-2">
                        {field.expectedAnswers.map((answer) => (
                          <label
                            key={answer.id}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`field-${field.id}`}
                              value={answer.answer}
                              checked={formData[field.id] === answer.answer}
                              onChange={(e) =>
                                handleChange(field.id, e.target.value)
                              }
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-gray-700">{answer.answer}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {field.answerType === 'MULTIPLE_ANSWER' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.field}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <div className="space-y-2">
                        {field.expectedAnswers.map((answer) => (
                          <label
                            key={answer.id}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              value={answer.answer}
                              checked={
                                formData[field.id]?.includes(answer.answer) ||
                                false
                              }
                              onChange={(e) =>
                                handleCheckboxChange(
                                  field.id,
                                  answer.answer,
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                            />
                            <span className="text-gray-700">{answer.answer}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  Submit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          Powered by IntelligentForms
        </div>
      </div>

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
