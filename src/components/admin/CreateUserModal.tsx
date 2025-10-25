'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { UserRole } from '@/types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    names: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.USER,
    title: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          names: formData.names,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          title: formData.title || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User created successfully');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          names: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: UserRole.USER,
          title: '',
        });
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
      toast.error('An error occurred while creating user');
    } finally {
      setIsLoading(false);
    }
  };

  const availableRoles =
    session?.user?.role === 'ADMIN'
      ? [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER]
      : [UserRole.USER];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name *"
          name="names"
          value={formData.names}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />

        <Input
          label="Email Address *"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          required
        />

        <Input
          label="Job Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Data Manager"
        />

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
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
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

        <Input
          label="Password *"
          name="password"
          type="password"
          value={formData.password}
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
            Create User
          </Button>
        </div>
      </form>
    </Modal>
  );
}
