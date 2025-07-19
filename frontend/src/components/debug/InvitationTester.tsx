'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useTeamStore } from '@/store/team';

export default function InvitationTester() {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testRole, setTestRole] = useState<'member' | 'admin'>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [lastInvitationLink, setLastInvitationLink] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const { inviteMember, error, clearError } = useTeamStore();

  const sendTestInvitation = async () => {
    if (!user?.team_id) {
      alert('No team ID available. Please make sure you are logged in as an admin.');
      return;
    }

    setIsLoading(true);
    clearError();
    
    try {
      await inviteMember({
        email: testEmail,
        role: testRole,
        team_id: user.team_id
      });
      
      // Generate the expected invitation link format
      // Note: In real implementation, this would come from the backend
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const invitationLink = `http://localhost:3001/auth/accept-invitation/${mockToken}`;
      setLastInvitationLink(invitationLink);
      
      alert('Test invitation sent! Check the backend logs for the actual invitation link.');
    } catch (err) {
      // Error handled by store
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="bg-gray-100 p-4 rounded-md">
        <p className="text-sm text-gray-600">
          Invitation testing is only available for admin users.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">🧪 Invitation Tester</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700">
            Test Email Address
          </label>
          <input
            id="testEmail"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
            placeholder="test@example.com"
          />
        </div>

        <div>
          <label htmlFor="testRole" className="block text-sm font-medium text-gray-700">
            Test Role
          </label>
          <select
            id="testRole"
            value={testRole}
            onChange={(e) => setTestRole(e.target.value as 'member' | 'admin')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <button
          onClick={sendTestInvitation}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Sending Test Invitation...' : '📧 Send Test Invitation'}
        </button>

        {lastInvitationLink && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-700 mb-2">Sample Invitation Link Format:</h4>
            <div className="text-sm font-mono text-blue-600 break-all">
              {lastInvitationLink}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              ⚠️ Use the actual link from backend logs for testing
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-md">
        <h4 className="text-sm font-medium text-yellow-700 mb-2">📋 Testing Instructions:</h4>
        <ol className="text-sm text-yellow-600 space-y-1 list-decimal list-inside">
          <li>Click "Send Test Invitation" above</li>
          <li>Check backend terminal for the invitation email output</li>
          <li>Copy the invitation link from the backend logs</li>
          <li>Open the link in a new incognito/private browser window</li>
          <li>Complete the invitation acceptance form</li>
          <li>Verify the new member appears in the team list</li>
        </ol>
      </div>
    </div>
  );
}