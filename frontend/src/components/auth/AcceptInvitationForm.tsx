'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { teamApi, handleApiError } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface AcceptInvitationFormData {
  first_name: string;
  last_name: string;
  password: string;
  confirmPassword: string;
}

interface AcceptInvitationFormProps {
  token: string;
}

export default function AcceptInvitationForm({ token }: AcceptInvitationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();
  
  // Debug logging (remove in production)
  // console.log('AcceptInvitationForm - Token received:', token?.substring(0, 20) + '...');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AcceptInvitationFormData>();

  const password = watch('password');

  useEffect(() => {
    // Validate token exists and has reasonable length
    if (!token) {
      setError('Invalid invitation link. Please check the URL and try again.');
    } else if (token.length < 10) {
      setError('Invalid invitation token format. Please check the complete URL.');
    }
    
    // Clear any existing errors when token changes
    setError(null);
  }, [token]);

  const onSubmit = async (data: AcceptInvitationFormData) => {
    if (!token) {
      setError('Invalid invitation token');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Accept the invitation
      const result = await teamApi.acceptInvitation(token, {
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password
      });

      setSuccess(true);
      
      // Auto-login after successful acceptance
      // We need to get the email from somewhere or have the backend return login credentials
      // For now, redirect to login page
      setTimeout(() => {
        router.push('/auth/login?message=Account created successfully. Please log in.');
      }, 2000);
      
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Invalid Invitation</h2>
            <p className="mt-2 text-sm text-gray-600">
              This invitation link is invalid or has expired.
            </p>
            <a
              href="/auth/login"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome to the Team!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your account has been created successfully. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Accept Team Invitation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete your registration to join the team
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="sr-only">
                  First Name
                </label>
                <input
                  {...register('first_name', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                  type="text"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="First name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="last_name" className="sr-only">
                  Last Name
                </label>
                <input
                  {...register('last_name', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                  type="text"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                type="password"
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
                type="password"
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Accept Invitation & Create Account'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}