import { create } from 'zustand';
import { TeamMember, Invitation, InviteRequest } from '@/types';
import { teamApi, handleApiError } from '@/lib/api';

interface TeamState {
  members: TeamMember[];
  pendingInvitations: Invitation[];
  isLoading: boolean;
  error: string | null;
}

interface TeamActions {
  loadMembersWithInvitations: (teamId: number) => Promise<void>;
  inviteMember: (inviteData: InviteRequest) => Promise<void>;
  updateMemberRole: (memberId: string, roleData: { role: 'admin' | 'member' }) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

type TeamStore = TeamState & TeamActions;

const initialState: TeamState = {
  members: [],
  pendingInvitations: [],
  isLoading: false,
  error: null
};

export const useTeamStore = create<TeamStore>((set, get) => ({
  ...initialState,

  loadMembersWithInvitations: async (teamId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await teamApi.getMembers(teamId);
      
      // Process the response data
      const activeMembers = response.members_and_invitations
        ?.filter((item: any) => item.type === 'member')
        .map((member: any) => ({
          id: member.id.toString(),
          email: member.email,
          first_name: member.first_name,
          last_name: member.last_name,
          role: member.role,
          status: member.status || 'active',
          joined_at: member.joined_at,
          last_active: member.last_active
        })) || [];
      
      const pendingInvitations = response.members_and_invitations
        ?.filter((item: any) => item.type === 'invitation')
        .map((inv: any) => ({
          id: inv.invitation_id,
          email: inv.email,
          role: inv.role,
          team_id: inv.team_id,
          token: inv.token || '',
          expires_at: inv.expires_at,
          is_used: false,
          invited_by: inv.invited_by || 0,
          created_at: inv.invited_at
        })) || [];
      
      set({
        members: activeMembers,
        pendingInvitations: pendingInvitations,
        isLoading: false,
        error: null
      });
    } catch (error) {
      const apiError = handleApiError(error);
      set({
        isLoading: false,
        error: apiError.message
      });
      throw error;
    }
  },

  inviteMember: async (inviteData: InviteRequest) => {
    set({ isLoading: true, error: null });
    try {
      const invitation = await teamApi.inviteMember(inviteData);
      
      // Add to pending invitations
      set((state) => ({
        pendingInvitations: [invitation, ...state.pendingInvitations],
        isLoading: false,
        error: null
      }));
    } catch (error) {
      const apiError = handleApiError(error);
      set({
        isLoading: false,
        error: apiError.message
      });
      throw error;
    }
  },

  updateMemberRole: async (memberId: string, roleData: { role: 'admin' | 'member' }) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMember = await teamApi.updateMemberRole(memberId, roleData);
      
      // Update member in the list
      set((state) => ({
        members: state.members.map(member =>
          member.id === memberId ? { ...member, role: roleData.role } : member
        ),
        isLoading: false,
        error: null
      }));
    } catch (error) {
      const apiError = handleApiError(error);
      set({
        isLoading: false,
        error: apiError.message
      });
      throw error;
    }
  },

  removeMember: async (memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      await teamApi.removeMember(memberId);
      
      // Remove member from the list
      set((state) => ({
        members: state.members.filter(member => member.id !== memberId),
        isLoading: false,
        error: null
      }));
    } catch (error) {
      const apiError = handleApiError(error);
      set({
        isLoading: false,
        error: apiError.message
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  reset: () => {
    set(initialState);
  }
}));