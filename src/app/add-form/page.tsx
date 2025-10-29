'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

function AddFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formType = (searchParams.get('type') || 'form').toUpperCase();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: formType as 'FORM' | 'SURVEY',
  });

  const [fields, setFields] = useState([
    {
      field: '',
      answerType: 'TEXT',
      answerSubtype: 'text field',
      required: false,
      placeholder: '',
      expectedAnswers: [] as string[],
    },
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (index: number, field: string, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [field]: value };
    setFields(newFields);
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        field: '',
        answerType: 'TEXT',
        answerSubtype: 'text field',
        required: false,
        placeholder: '',
        expectedAnswers: [],
      },
    ]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const addExpectedAnswer = (fieldIndex: number) => {
    const newFields = [...fields];
    newFields[fieldIndex].expectedAnswers.push('');
    setFields(newFields);
  };

  const removeExpectedAnswer = (fieldIndex: number, answerIndex: number) => {
    const newFields = [...fields];
    newFields[fieldIndex].expectedAnswers = newFields[
      fieldIndex
    ].expectedAnswers.filter((_, i) => i !== answerIndex);
    setFields(newFields);
  };

  const updateExpectedAnswer = (
    fieldIndex: number,
    answerIndex: number,
    value: string
  ) => {
    const newFields = [...fields];
    newFields[fieldIndex].expectedAnswers[answerIndex] = value;
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedFields = fields.map((field, index) => ({
        field: field.field,
        answerType: field.answerType,
        answerSubtype:
          field.answerType === 'TEXT' ? field.answerSubtype : null,
        required: field.required,
        placeholder: field.placeholder || null,
        order: index + 1,
        expectedAnswers:
          field.answerType !== 'TEXT'
            ? field.expectedAnswers
                .filter((a) => a.trim())
                .map((answer, i) => ({
                  answer,
                  order: i + 1,
                }))
            : undefined,
      }));

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fields: formattedFields,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create form');
      }

      toast.success('Form created successfully!');
      router.push('/manage-forms');
    } catch (error: any) {
      console.error('Form creation error:', error);
      toast.error(error.message || 'Failed to create form');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New {formType.charAt(0) + formType.slice(1).toLowerCase()}
          </h1>
          <p className="text-gray-600">
            Build your form by adding fields and configuring options
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Form Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter form title"
              />

              <Textarea
                label="Description (optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your form..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Form Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="FORM">Form</option>
                  <option value="SURVEY">Survey</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Fields */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Form Fields</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className="p-4 border border-gray-200 rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      Field {fieldIndex + 1}
                    </h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(fieldIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <Input
                    label="Field Label"
                    value={field.field}
                    onChange={(e) =>
                      handleFieldChange(fieldIndex, 'field', e.target.value)
                    }
                    required
                    placeholder="e.g., Email Address"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer Type
                      </label>
                      <select
                        value={field.answerType}
                        onChange={(e) =>
                          handleFieldChange(fieldIndex, 'answerType', e.target.value)
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="TEXT">Text</option>
                        <option value="SINGLE_ANSWER">Single Answer</option>
                        <option value="MULTIPLE_ANSWER">Multiple Answer</option>
                      </select>
                    </div>

                    {field.answerType === 'TEXT' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Input Type
                        </label>
                        <select
                          value={field.answerSubtype}
                          onChange={(e) =>
                            handleFieldChange(
                              fieldIndex,
                              'answerSubtype',
                              e.target.value
                            )
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="text field">Text Field</option>
                          <option value="textbox">Text Area</option>
                          <option value="date">Date</option>
                          <option value="number">Number</option>
                          <option value="phone">Phone</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`required-${fieldIndex}`}
                      checked={field.required}
                      onChange={(e) =>
                        handleFieldChange(fieldIndex, 'required', e.target.checked)
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`required-${fieldIndex}`}
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Required field
                    </label>
                  </div>

                  {field.answerType !== 'TEXT' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Answer Options
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addExpectedAnswer(fieldIndex)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {field.expectedAnswers.map((answer, answerIndex) => (
                          <div key={answerIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={answer}
                              onChange={(e) =>
                                updateExpectedAnswer(
                                  fieldIndex,
                                  answerIndex,
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${answerIndex + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeExpectedAnswer(fieldIndex, answerIndex)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
              Create Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddFormPage() {
  return (
    <Suspense fallback={<div className="bg-gray-50 min-h-screen py-8 flex items-center justify-center">Loading...</div>}>
      <AddFormContent />
    </Suspense>
  );
}
