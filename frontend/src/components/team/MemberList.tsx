'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useTeamStore } from '@/store/team';
import { TeamMember } from '@/types';

interface MemberListProps {
  onMemberUpdate?: (member: TeamMember) => void;
}

export default function MemberList({ onMemberUpdate }: MemberListProps) {
  const { user } = useAuthStore();
  const { 
    members, 
    pendingInvitations,
    isLoading, 
    error, 
    loadMembersWithInvitations, 
    updateMemberRole, 
    removeMember,
    clearError 
  } = useTeamStore();
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  useEffect(() => {
    if (user?.team_id) {
      loadMembersWithInvitations(user.team_id);
    }
  }, [user?.team_id, loadMembersWithInvitations]);

  const handleRoleUpdate = async (memberId: string, newRole: 'admin' | 'member') => {
    setUpdatingMember(memberId);
    clearError();
    
    try {
      await updateMemberRole(memberId, { role: newRole });
      onMemberUpdate?.(members.find(m => m.id === memberId)!);
    } catch {
      // Error handled by store
    } finally {
      setUpdatingMember(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }
    
    setRemovingMember(memberId);
    clearError();
    
    try {
      await removeMember(memberId);
    } catch {
      // Error handled by store
    } finally {
      setRemovingMember(null);
    }
  };

  const canManageMembers = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
        <p className="mt-1 text-sm text-gray-500">
          {members.length} active member{members.length !== 1 ? 's' : ''}
          {pendingInvitations.length > 0 && (
            <span className="ml-2 text-yellow-600">
              • {pendingInvitations.length} pending invitation{pendingInvitations.length !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {/* Active Members */}
        {members.map((member) => (
          <div key={member.id} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {member.first_name?.[0]}{member.last_name?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900">
                    {member.first_name} {member.last_name}
                  </p>
                  {member.id === user?.id && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      You
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{member.email}</p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                  {member.joined_at && (
                    <span className="ml-2 text-xs text-gray-500">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {canManageMembers && member.id !== user?.id && (
                <>
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleUpdate(member.id, e.target.value as 'admin' | 'member')}
                    disabled={updatingMember === member.id}
                    className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={removingMember === member.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 text-sm px-2 py-1"
                    title="Remove member"
                  >
                    Remove
                  </button>
                </>
              )}
              
              {(!canManageMembers || member.id === user?.id) && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {member.role}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Pending Invitations */}
        {pendingInvitations.map((invitation) => (
          <div key={`invitation-${invitation.id}`} className="px-6 py-4 flex items-center justify-between bg-yellow-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-yellow-700">?</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900">
                    Invitation Pending
                  </p>
                </div>
                <p className="text-sm text-gray-500">{invitation.email}</p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                  {invitation.created_at && (
                    <span className="ml-2 text-xs text-gray-500">
                      Invited {new Date(invitation.created_at).toLocaleDateString()}
                    </span>
                  )}
                  {invitation.expires_at && (
                    <span className="ml-2 text-xs text-gray-500">
                      Expires {new Date(invitation.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                invitation.role === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {invitation.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && pendingInvitations.length === 0 && !isLoading && (
        <div className="px-6 py-8 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
          <p className="mt-1 text-sm text-gray-500">
            {canManageMembers ? 'Get started by inviting team members.' : 'No members to display.'}
          </p>
        </div>
      )}
    </div>
  );
}