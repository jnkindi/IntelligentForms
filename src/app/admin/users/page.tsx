'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UserRole } from '@/types';
import CreateUserModal from '@/components/admin/CreateUserModal';
import EditUserModal from '@/components/admin/EditUserModal';

interface User {
  id: number;
  names: string;
  email: string;
  title: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  formAccess: any[];
  address: string | null;
  twitter: string | null;
  facebook: string | null;
  linkedin: string | null;
  about: string | null;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is ADMIN or MANAGER
    if (
      session?.user?.role !== 'ADMIN' &&
      session?.user?.role !== 'MANAGER'
    ) {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [session, includeInactive]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/users?includeInactive=${includeInactive}`
      );
      const data = await response.json();

      if (response.ok) {
        setUsers(data.data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('An error occurred while fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('An error occurred while deleting user');
    }
  };

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`
        );
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Toggle user status error:', error);
      toast.error('An error occurred while updating user status');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                User Management
              </h1>
              <p className="text-gray-600">
                Manage users and their access permissions
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  Show inactive users
                </span>
              </label>
              <div className="text-sm text-gray-500">
                Total: {users.length} users
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Form Access
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <React.Fragment key={user.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.names}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              {user.title && (
                                <div className="text-xs text-gray-400">
                                  {user.title}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isActive ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                <UserX className="h-3 w-3 mr-1" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() =>
                                setExpandedUserId(
                                  expandedUserId === user.id ? null : user.id
                                )
                              }
                              className="text-sm text-primary-600 hover:text-primary-900 flex items-center"
                            >
                              {user.formAccess.length} forms
                              {expandedUserId === user.id ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setEditingUser(user)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit user"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleActive(user.id, user.isActive)
                                }
                                className={`${
                                  user.isActive
                                    ? 'text-yellow-600 hover:text-yellow-900'
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                title={
                                  user.isActive
                                    ? 'Deactivate user'
                                    : 'Activate user'
                                }
                              >
                                {user.isActive ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </button>
                              {session?.user?.role === 'ADMIN' && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedUserId === user.id && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                              <div className="text-sm">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Form Access:
                                </h4>
                                {user.formAccess.length === 0 ? (
                                  <p className="text-gray-500 text-sm">
                                    No form access assigned
                                  </p>
                                ) : (
                                  <ul className="space-y-1">
                                    {user.formAccess.map((access: any) => (
                                      <li
                                        key={access.id}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <span>
                                          {access.form ? (
                                            <>
                                              <strong>{access.form.title}</strong> (
                                              {access.form.type})
                                            </>
                                          ) : (
                                            <strong>All Forms</strong>
                                          )}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 text-xs rounded ${
                                            access.access === 'FULL'
                                              ? 'bg-green-100 text-green-800'
                                              : access.access === 'EDIT'
                                              ? 'bg-blue-100 text-blue-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}
                                        >
                                          {access.access}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchUsers}
        />

        {/* Edit User Modal */}
        {editingUser && (
          <EditUserModal
            isOpen={!!editingUser}
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSuccess={fetchUsers}
          />
        )}
      </div>
    </div>
  );
}
