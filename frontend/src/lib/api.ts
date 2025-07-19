import axios, { AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  TeamMember, 
  InviteRequest, 
  Invitation,
  ApiError
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken
            });
            
            const { access_token } = response.data;
            localStorage.setItem('access_token', access_token);
            
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.get('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken
    });
    return response.data;
  }
};

// Team API
export const teamApi = {
  async getMembers(teamId: number): Promise<any> {
    const response = await apiClient.get(`/team/members-with-invitations?team_id=${teamId}`);
    return response.data;
  },

  async inviteMember(inviteData: InviteRequest): Promise<Invitation> {
    const response: AxiosResponse<Invitation> = await apiClient.post('/team/invite', inviteData);
    return response.data;
  },

  async updateMemberRole(memberId: string, roleData: { role: 'admin' | 'member' }): Promise<TeamMember> {
    const response: AxiosResponse<TeamMember> = await apiClient.put(`/team/members/${memberId}/role`, roleData);
    return response.data;
  },

  async removeMember(memberId: string): Promise<void> {
    await apiClient.delete(`/team/members/${memberId}`);
  },

  async acceptInvitation(token: string, userData: { first_name: string; last_name: string; password: string }): Promise<{ message: string; user: User }> {
    const response: AxiosResponse<{ message: string; user: User }> = await apiClient.post(`/team/accept-invitation/${token}`, userData);
    return response.data;
  }
};

// Error handling utility
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      return {
        message: error.response.data.detail || error.response.data.message || 'An error occurred',
        details: error.response.data.details,
        field: error.response.data.field
      };
    }
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      return {
        message: 'Unable to connect to server. Please check if the backend is running on http://localhost:8000',
        details: 'Network connection failed'
      };
    }
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return { message: (error as { message: string }).message };
  }
  
  return { message: 'An unexpected error occurred' };
};

export default apiClient;