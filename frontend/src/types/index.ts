export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'member';
  team_id?: number;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface Team {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
  is_active: boolean;
}

export interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'member';
  status: 'active' | 'invited' | 'inactive';
  joined_at?: string;
  last_active?: string;
}

export interface Invitation {
  id: number;
  email: string;
  role: 'admin' | 'member';
  team_id: number;
  token: string;
  expires_at: string;
  is_used: boolean;
  invited_by: number;
  accepted_at?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface InviteRequest {
  email: string;
  role: 'admin' | 'member';
  team_id: number;
}

export interface ApiError {
  message: string;
  details?: string;
  field?: string;
}