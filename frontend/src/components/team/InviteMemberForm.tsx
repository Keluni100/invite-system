'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth';
import { useTeamStore } from '@/store/team';
import { InviteRequest } from '@/types';

interface InviteFormData {
  email: string;
  role: 'admin' | 'member';
}

export default function InviteMemberForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { inviteMember, error, clearError, loadMembersWithInvitations } = useTeamStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>({
    defaultValues: {
      role: 'member'
    }
  });

  const onSubmit = async (data: InviteFormData) => {
    if (!user?.team_id) {
      alert('No team ID available');
      return;
    }

    setIsSubmitting(true);
    clearError();
    
    try {
      const inviteData: InviteRequest = {
        email: data.email,
        role: data.role,
        team_id: user.team_id
      };

      await inviteMember(inviteData);
      
      // Refresh the member list
      await loadMembersWithInvitations(user.team_id);
      
      // Reset form
      reset();
      
      alert('Invitation sent successfully!');
    } catch (err) {
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Team Member</h3>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            type="email"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            {...register('role', { required: 'Role is required' })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
        </button>
      </form>
    </div>
  );
}