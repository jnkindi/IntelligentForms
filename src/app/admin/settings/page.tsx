'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Building2, Mail, Save } from 'lucide-react';

export default function OrganizationSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tagline: '',
    contactEmail: '',
    contactPhone: '',
    supportEmail: '',
    website: '',
    address: '',
  });

  const fetchOrganization = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/organization');
      const data = await response.json();

      if (response.ok) {
        setFormData({
          name: data.data.name || '',
          description: data.data.description || '',
          tagline: data.data.tagline || '',
          contactEmail: data.data.contactEmail || '',
          contactPhone: data.data.contactPhone || '',
          supportEmail: data.data.supportEmail || '',
          website: data.data.website || '',
          address: data.data.address || '',
        });
      } else {
        toast.error('Failed to fetch organization details');
      }
    } catch (error) {
      console.error('Fetch organization error:', error);
      toast.error('An error occurred while fetching organization details');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    // Check if user is ADMIN
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchOrganization();
  }, [session, router, fetchOrganization]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Organization settings updated successfully');
      } else {
        toast.error(data.error || 'Failed to update organization settings');
      }
    } catch (error) {
      console.error('Update organization error:', error);
      toast.error('An error occurred while updating organization settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading organization settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Organization Settings
          </h1>
          <p className="text-gray-600">
            Manage your organization's branding and contact information
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                rows={4}
                placeholder="Tell us about your organization..."
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
