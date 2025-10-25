'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

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

export default function EmbedFormPage() {
  const params = useParams();
  const hash = params.hash as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    async function fetchForm() {
      try {
        const response = await fetch(`/api/public/forms/${hash}`);
        if (!response.ok) {
          throw new Error('Form not found');
        }
        const data = await response.json();
        setForm(data.data);
      } catch (error) {
        console.error('Error fetching form:', error);
        setError('Form not found or is inactive');
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
    setError(null);

    try {
      // Validate required fields
      const missingFields = form?.fields.filter(
        (field) => field.required && !formData[field.id]
      );

      if (missingFields && missingFields.length > 0) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

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
    } catch (error: any) {
      console.error('Form submission error:', error);
      setError(error.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading form...</p>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Form not found</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="p-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600">Your response has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600">{form.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

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
                      rows={3}
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
                    {field.required && <span className="text-red-500 ml-1">*</span>}
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
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{answer.answer}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {field.answerType === 'MULTIPLE_ANSWER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.field}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
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
                            formData[field.id]?.includes(answer.answer) || false
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
                        <span className="text-sm text-gray-700">{answer.answer}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
          >
            Submit
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500">
          Powered by <span className="font-medium">IntelligentForms</span>
        </div>
      </div>
    </div>
  );
}
