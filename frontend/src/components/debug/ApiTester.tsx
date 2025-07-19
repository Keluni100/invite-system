'use client';

import { useState } from 'react';
import { authApi, teamApi, handleApiError } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function ApiTester() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Basic connection
      addResult('Testing API connection...');
      const response = await fetch('http://localhost:8000/docs');
      if (response.ok) {
        addResult('✅ Backend is running on http://localhost:8000');
      } else {
        addResult('❌ Backend connection failed');
      }
    } catch (error) {
      addResult('❌ Cannot connect to backend - make sure it\'s running on http://localhost:8000');
    }

    // Test 2: Check current user if authenticated
    if (user) {
      try {
        const currentUser = await authApi.getCurrentUser();
        addResult(`✅ Current user: ${currentUser.email} (${currentUser.role})`);
      } catch (error) {
        const apiError = handleApiError(error);
        addResult(`❌ Get current user failed: ${apiError.message}`);
      }

      // Test 3: Test team API if user has a team
      if (user.team_id) {
        try {
          const teamData = await teamApi.getMembers(user.team_id);
          addResult(`✅ Team data loaded: ${teamData.total_members || 0} total members`);
        } catch (error) {
          const apiError = handleApiError(error);
          addResult(`❌ Get team members failed: ${apiError.message}`);
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">API Connection Tester</h3>
      
      <button
        onClick={testApiConnection}
        disabled={isLoading}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test API Connection'}
      </button>

      {testResults.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Test Results:</h4>
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono text-gray-600">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {user && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Current User Info:</h4>
          <div className="text-sm text-blue-600">
            <div>Email: {user.email}</div>
            <div>Role: {user.role}</div>
            <div>Team ID: {user.team_id || 'No team'}</div>
            <div>Active: {user.is_active ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}
    </div>
  );
}