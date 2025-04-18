import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _ALL: [],          // All teams in the system
  _USER: {           // Teams specific to the current user
    created: [],     // Teams created by the user
    joined: [],      // Teams the user has joined
    all: []          // Combined list of created and joined teams
  },
  _CURRENT: {},      // Currently selected team (for viewing/editing)
  _ONE: null,        // Single team details (changed from {} to null for easier checking)
  _MEMBERS: []       // Members of the current team
};

export const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    _AddTeam: (state, action) => {
      state._ALL = [...state._ALL, action.payload];
      state._USER.created = [...state._USER.created, action.payload];
      state._USER.all = [...state._USER.all, action.payload];
    },
    _FindTeams: (state, action) => {
      state._ALL = action.payload; // This should match your API response structure
    },
    _DeleteTeam: (state, action) => {
      state._ALL = state._ALL.filter((team) => team._id !== action.payload);
      state._USER.created = state._USER.created.filter((team) => team._id !== action.payload);
      state._USER.joined = state._USER.joined.filter((team) => team._id !== action.payload);
      state._USER.all = state._USER.all.filter((team) => team._id !== action.payload);
    },
    _FindOneTeam: (state, action) => {
      state._ONE = action.payload;
      state._MEMBERS = action.payload.members || [];
    },
    _ResetCurrentTeam: (state) => {
      // Add this action to reset the current team being edited
      state._ONE = null;
      state._MEMBERS = [];
    },
    _SetCurrentTeam: (state, action) => {
      state._CURRENT = action.payload;
    },
    _SetUserTeams: (state, action) => {
      state._USER = {
        created: action.payload.createdTeams || [],
        joined: action.payload.joinedTeams || [],
        all: action.payload.allTeams || []
      };
    },
    _UpdateTeam: (state, action) => {
      const { id, updates } = action.payload;
      
      // Handle members array properly in the updates
      const updatedTeam = { ...updates };
      
      // Update in all collections
      state._ALL = state._ALL.map(team => 
        team._id === id ? { ...team, ...updatedTeam } : team
      );
      
      state._USER.created = state._USER.created.map(team => 
        team._id === id ? { ...team, ...updatedTeam } : team
      );
      
      state._USER.joined = state._USER.joined.map(team => 
        team._id === id ? { ...team, ...updatedTeam } : team
      );
      
      state._USER.all = state._USER.all.map(team => 
        team._id === id ? { ...team, ...updatedTeam } : team
      );
      
      // Update current team if it's the one being edited
      if (state._ONE && state._ONE._id === id) {
        state._ONE = { ...state._ONE, ...updatedTeam };
        state._MEMBERS = updatedTeam.members || state._MEMBERS;
      }
      
      if (state._CURRENT._id === id) {
        state._CURRENT = { ...state._CURRENT, ...updatedTeam };
      }
    },
    _AddTeamMember: (state, action) => {
      const { teamId, member } = action.payload;
      
      // Update in main teams collection
      state._ALL = state._ALL.map(team => {
        if (team._id === teamId) {
          // Ensure members array exists
          const members = Array.isArray(team.members) ? [...team.members] : [];
          return {
            ...team,
            members: [...members, member]
          };
        }
        return team;
      });
      
      // Update in user teams if exists
      state._USER.all = state._USER.all.map(team => {
        if (team._id === teamId) {
          // Ensure members array exists
          const members = Array.isArray(team.members) ? [...team.members] : [];
          return {
            ...team,
            members: [...members, member]
          };
        }
        return team;
      });
      
      // Update current team if it's the one being modified
      if (state._ONE && state._ONE._id === teamId) {
        // Ensure members array exists
        const members = Array.isArray(state._ONE.members) ? [...state._ONE.members] : [];
        state._ONE.members = [...members, member];
        state._MEMBERS = [...state._MEMBERS, member];
      }
    },
    _AddMultipleTeamMembers: (state, action) => {
      const { teamId, members } = action.payload;
      
      if (!Array.isArray(members) || members.length === 0) return;
      
      // Update in main teams collection
      state._ALL = state._ALL.map(team => {
        if (team._id === teamId) {
          // Ensure team.members is an array
          const currentMembers = Array.isArray(team.members) ? [...team.members] : [];
          return {
            ...team,
            members: [...currentMembers, ...members]
          };
        }
        return team;
      });
      
      // Update in user teams if exists
      state._USER.all = state._USER.all.map(team => {
        if (team._id === teamId) {
          // Ensure team.members is an array
          const currentMembers = Array.isArray(team.members) ? [...team.members] : [];
          return {
            ...team,
            members: [...currentMembers, ...members]
          };
        }
        return team;
      });
      
      // Update current team if it's the one being modified
      if (state._ONE && state._ONE._id === teamId) {
        // Ensure state._ONE.members is an array
        const currentMembers = Array.isArray(state._ONE.members) ? [...state._ONE.members] : [];
        state._ONE.members = [...currentMembers, ...members];
        state._MEMBERS = [...state._MEMBERS, ...members];
      }
    },
    _RemoveTeamMember: (state, action) => {
      const { teamId, userId } = action.payload;
      
      // Update in main teams collection
      state._ALL = state._ALL.map(team => {
        if (team._id === teamId && Array.isArray(team.members)) {
          return {
            ...team,
            members: team.members.filter(m => m.user._id !== userId)
          };
        }
        return team;
      });
      
      // Update in user teams if exists
      state._USER.all = state._USER.all.map(team => {
        if (team._id === teamId && Array.isArray(team.members)) {
          return {
            ...team,
            members: team.members.filter(m => m.user._id !== userId)
          };
        }
        return team;
      });
      
      // Update current team if it's the one being modified
      if (state._ONE && state._ONE._id === teamId) {
        if (Array.isArray(state._ONE.members)) {
          state._ONE.members = state._ONE.members.filter(m => m.user._id !== userId);
        }
        if (Array.isArray(state._MEMBERS)) {
          state._MEMBERS = state._MEMBERS.filter(m => m.user._id !== userId);
        }
      }
    },
    _UpdateMemberRole: (state, action) => {
      const { teamId, userId, role } = action.payload;
      
      // Update in main teams collection
      state._ALL = state._ALL.map(team => {
        if (team._id === teamId && Array.isArray(team.members)) {
          return {
            ...team,
            members: team.members.map(m => 
              m.user._id === userId ? { ...m, role } : m
            )
          };
        }
        return team;
      });
      
      // Update in user teams if exists
      state._USER.all = state._USER.all.map(team => {
        if (team._id === teamId && Array.isArray(team.members)) {
          return {
            ...team,
            members: team.members.map(m => 
              m.user._id === userId ? { ...m, role } : m
            )
          };
        }
        return team;
      });
      
      // Update current team if it's the one being modified
      if (state._ONE && state._ONE._id === teamId) {
        if (Array.isArray(state._ONE.members)) {
          state._ONE.members = state._ONE.members.map(m => 
            m.user._id === userId ? { ...m, role } : m
          );
        }
        if (Array.isArray(state._MEMBERS)) {
          state._MEMBERS = state._MEMBERS.map(m => 
            m.user._id === userId ? { ...m, role } : m
          );
        }
      }
    }
  }
});

export const {
  _AddTeam,
  _FindTeams,
  _FindOneTeam,
  _SetCurrentTeam,
  _DeleteTeam,
  _SetUserTeams,
  _UpdateTeam,
  _AddTeamMember,
  _AddMultipleTeamMembers,
  _RemoveTeamMember,
  _UpdateMemberRole,
  _ResetCurrentTeam
} = teamsSlice.actions;

export default teamsSlice.reducer;