// redux/reducers/activitySlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activities: [],
  stats: null,
  persona: null,
  taskPriorities: [],
  dashboardSummary: null,
  loading: false,
  error: null
};

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    // Activity list actions
    fetchActivitiesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchActivitiesSuccess(state, action) {
      state.activities = action.payload;
      state.loading = false;
    },
    fetchActivitiesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Activity stats actions
    fetchStatsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchStatsSuccess(state, action) {
      state.stats = action.payload;
      state.loading = false;
    },
    fetchStatsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Persona actions
    fetchPersonaStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPersonaSuccess(state, action) {
      state.persona = action.payload;
      state.loading = false;
    },
    fetchPersonaFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Task priorities actions
    fetchTaskPrioritiesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTaskPrioritiesSuccess(state, action) {
      state.taskPriorities = action.payload;
      state.loading = false;
    },
    fetchTaskPrioritiesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Dashboard summary actions
    fetchDashboardSummaryStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDashboardSummarySuccess(state, action) {
      state.dashboardSummary = action.payload;
      state.loading = false;
    },
    fetchDashboardSummaryFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchActivitiesStart,
  fetchActivitiesSuccess,
  fetchActivitiesFailure,
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  fetchPersonaStart,
  fetchPersonaSuccess,
  fetchPersonaFailure,
  fetchTaskPrioritiesStart,
  fetchTaskPrioritiesSuccess,
  fetchTaskPrioritiesFailure,
  fetchDashboardSummaryStart,
  fetchDashboardSummarySuccess,
  fetchDashboardSummaryFailure
} = activitySlice.actions;