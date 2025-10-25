'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { UserRole } from '@/types';

interface User {
  id: number;
  names: string;
  email: string;
  title: string | null;
  role: UserRole;
  isActive: boolean;
  address: string | null;
  twitter: string | null;
  facebook: string | null;
  linkedin: string | null;
  about: string | null;
}

interface EditUserModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    names: user.names,
    title: user.title || '',
    role: user.role,
    address: user.address || '',
    twitter: user.twitter || '',
    facebook: user.facebook || '',
    linkedin: user.linkedin || '',
    about: user.about || '',
  });

  useEffect(() => {
    setFormData({
      names: user.names,
      title: user.title || '',
      role: user.role,
      address: user.address || '',
      twitter: user.twitter || '',
      facebook: user.facebook || '',
      linkedin: user.linkedin || '',
      about: user.about || '',
    });
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          names: formData.names,
          title: formData.title || null,
          role: formData.role,
          address: formData.address || null,
          twitter: formData.twitter || null,
          facebook: formData.facebook || null,
          linkedin: formData.linkedin || null,
          about: formData.about || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User updated successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('An error occurred while updating user');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = session?.user?.role === 'ADMIN';
  const isSelf = parseInt(session?.user?.id || '0') === user.id;
  const canChangeRole = isAdmin && !isSelf;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        <Input
          label="Full Name *"
          name="names"
          value={formData.names}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />

        <Input
          label="Job Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Data Manager"
        />

        {canChangeRole && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
              required
            >
              <option value={UserRole.ADMIN}>ADMIN</option>
              <option value={UserRole.MANAGER}>MANAGER</option>
              <option value={UserRole.USER}>USER</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.role === UserRole.ADMIN &&
                'Full system access, can manage users and organization'}
              {formData.role === UserRole.MANAGER &&
                'Can create forms and manage assigned users'}
              {formData.role === UserRole.USER &&
                'Can view and manage assigned forms'}
            </p>
          </div>
        )}

        <Textarea
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          placeholder="123 Main St, City, Country"
        />

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Social Links
          </h3>
          <div className="space-y-4">
            <Input
              label="Twitter"
              name="twitter"
              type="url"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/username"
            />
            <Input
              label="Facebook"
              name="facebook"
              type="url"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/username"
            />
            <Input
              label="LinkedIn"
              name="linkedin"
              type="url"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        <Textarea
          label="About"
          name="about"
          value={formData.about}
          onChange={handleChange}
          rows={5}
          placeholder="Tell us about this user..."
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
