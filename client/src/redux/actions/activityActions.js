// redux/actions/activityActions.js
import axios from "axios";
import { activitySlice } from "../reducers/activitySlice";
import { errorsSlice } from "../reducers/errors";

// Destructure actions from the slice
const {
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

// Destructure setErrors from errorsSlice
const { setErrors } = errorsSlice.actions;

// Fetch user activities with optional filtering
export const fetchUserActivities = (userId, filter = 'all', limit = 50, skip = 0) => async (dispatch) => {
  dispatch(fetchActivitiesStart());
  
  try {
    const endpoint = userId 
      ? `/api/activities/${userId}?filter=${filter}&limit=${limit}&skip=${skip}` 
      : `/api/activities?filter=${filter}&limit=${limit}&skip=${skip}`;
    
    const response = await axios.get(endpoint);
    
    if (response.data.success) {
      dispatch(fetchActivitiesSuccess(response.data.data));
    } else {
      dispatch(fetchActivitiesFailure("Failed to fetch activities"));
      dispatch(setErrors({ activity: "Failed to fetch activities" }));
    }
  } catch (error) {
    dispatch(fetchActivitiesFailure(error.message));
    dispatch(setErrors(error?.response?.data || { activity: error.message }));
  }
};

// Fetch activity statistics for charts and visualizations
export const fetchActivityStats = (userId, timeFrame = 'week') => async (dispatch) => {
  dispatch(fetchStatsStart());
  
  try {
    const endpoint = userId 
      ? `/api/activities/stats/${userId}?timeFrame=${timeFrame}` 
      : `/api/activities/stats?timeFrame=${timeFrame}`;
    
    const response = await axios.get(endpoint);
    
    if (response.data.success) {
      dispatch(fetchStatsSuccess(response.data.data));
    } else {
      dispatch(fetchStatsFailure("Failed to fetch activity statistics"));
      dispatch(setErrors({ activity: "Failed to fetch activity statistics" }));
    }
  } catch (error) {
    dispatch(fetchStatsFailure(error.message));
    dispatch(setErrors(error?.response?.data || { activity: error.message }));
  }
};

// Fetch user's technical persona
export const fetchUserPersona = (userId) => async (dispatch) => {
  dispatch(fetchPersonaStart());
  
  try {
    const endpoint = userId 
      ? `/api/activities/persona/${userId}` 
      : '/api/activities/persona';
    
    const response = await axios.get(endpoint);
    
    if (response.data.success) {
      dispatch(fetchPersonaSuccess(response.data.data));
    } else {
      dispatch(fetchPersonaFailure("Failed to generate user persona"));
      dispatch(setErrors({ activity: "Failed to generate user persona" }));
    }
  } catch (error) {
    dispatch(fetchPersonaFailure(error.message));
    dispatch(setErrors(error?.response?.data || { activity: error.message }));
  }
};

// Fetch task priority recommendations
export const fetchTaskPriorities = (userId) => async (dispatch) => {
  dispatch(fetchTaskPrioritiesStart());
  
  try {
    const endpoint = userId 
      ? `/api/activities/task-priorities/${userId}` 
      : '/api/activities/task-priorities';
    
    const response = await axios.get(endpoint);
    
    if (response.data.success) {
      dispatch(fetchTaskPrioritiesSuccess(response.data.data.priorities));
    } else {
      dispatch(fetchTaskPrioritiesFailure("Failed to fetch task priorities"));
      dispatch(setErrors({ activity: "Failed to fetch task priorities" }));
    }
  } catch (error) {
    dispatch(fetchTaskPrioritiesFailure(error.message));
    dispatch(setErrors(error?.response?.data || { activity: error.message }));
  }
};

// Fetch dashboard summary metrics
export const fetchDashboardSummary = (userId) => async (dispatch) => {
  dispatch(fetchDashboardSummaryStart());
  
  try {
    const endpoint = userId 
      ? `/api/activities/dashboard/${userId}` 
      : '/api/activities/dashboard';
    
    const response = await axios.get(endpoint);
    
    if (response.data.success) {
      dispatch(fetchDashboardSummarySuccess(response.data.data));
    } else {
      dispatch(fetchDashboardSummaryFailure("Failed to fetch dashboard summary"));
      dispatch(setErrors({ activity: "Failed to fetch dashboard summary" }));
    }
  } catch (error) {
    dispatch(fetchDashboardSummaryFailure(error.message));
    dispatch(setErrors(error?.response?.data || { activity: error.message }));
  }
};