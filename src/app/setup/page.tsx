'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Building2, User } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Organization details
    name: '',
    description: '',
    tagline: '',
    contactEmail: '',
    contactPhone: '',
    supportEmail: '',
    website: '',
    address: '',
    // Admin details
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/organization/setup');
      const data = await response.json();

      if (data.data?.setupCompleted) {
        // Setup already completed, redirect to login
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Setup check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.name) {
        toast.error('Organization name is required');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.adminName || !formData.adminEmail || !formData.adminPassword) {
        toast.error('All admin fields are required');
        return;
      }
      if (formData.adminPassword !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.adminPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/organization/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed');
      }

      toast.success('Organization setup completed successfully!');
      router.push('/login');
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking setup status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Intelligent Forms
          </h1>
          <p className="text-lg text-gray-600">
            Let's set up your organization and create your admin account
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      currentStep > step ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-24">
            <span className="text-sm text-gray-600">Organization</span>
            <span className="text-sm text-gray-600">Admin</span>
            <span className="text-sm text-gray-600">Review</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Organization Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Building2 className="h-6 w-6 text-primary-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Organization Details
                    </h2>
                  </div>

                  <Input
                    label="Organization Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    required
                  />

                  <Input
                    label="Tagline"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    placeholder="Empowering data collection with privacy"
                  />

                  <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about your organization..."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Contact Email"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="contact@acme.com"
                    />
                    <Input
                      label="Contact Phone"
                      name="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <Input
                    label="Support Email"
                    name="supportEmail"
                    type="email"
                    value={formData.supportEmail}
                    onChange={handleChange}
                    placeholder="support@acme.com"
                  />

                  <Input
                    label="Website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://acme.com"
                  />

                  <Textarea
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              )}

              {/* Step 2: Admin Account */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <User className="h-6 w-6 text-primary-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Create Admin Account
                    </h2>
                  </div>

                  <Input
                    label="Full Name *"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />

                  <Input
                    label="Email Address *"
                    name="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@acme.com"
                    required
                  />

                  <Input
                    label="Password *"
                    name="adminPassword"
                    type="password"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    required
                  />

                  <Input
                    label="Confirm Password *"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This will be the main administrator
                      account with full access to manage users, forms, and
                      organization settings.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Review & Confirm
                  </h2>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Organization Details
                      </h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Name</dt>
                          <dd className="text-base text-gray-900">{formData.name}</dd>
                        </div>
                        {formData.tagline && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              Tagline
                            </dt>
                            <dd className="text-base text-gray-900">
                              {formData.tagline}
                            </dd>
                          </div>
                        )}
                        {formData.contactEmail && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              Contact Email
                            </dt>
                            <dd className="text-base text-gray-900">
                              {formData.contactEmail}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Administrator
                      </h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Name</dt>
                          <dd className="text-base text-gray-900">
                            {formData.adminName}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="text-base text-gray-900">
                            {formData.adminEmail}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      By completing this setup, you'll be able to start creating
                      forms and managing your organization's data collection.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isLoading}
                >
                  Back
                </Button>

                {currentStep < 3 ? (
                  <Button type="button" variant="primary" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Complete Setup
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
