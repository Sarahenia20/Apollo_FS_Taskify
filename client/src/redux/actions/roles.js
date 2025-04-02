// src/redux/actions/roles.js
/*import axios from "axios";
import {
  FETCH_ROLES_SUCCESS,
  FETCH_ROLES_FAIL,
  CREATE_ROLE_SUCCESS,
  CREATE_ROLE_FAIL,
  UPDATE_ROLE_SUCCESS,
  UPDATE_ROLE_FAIL,
  DELETE_ROLE_SUCCESS,
  DELETE_ROLE_FAIL,
  GENERATE_DESCRIPTION_SUCCESS,
  GENERATE_DESCRIPTION_FAIL
} from "../types";

// Base URL from .env file
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function to get auth headers
const getConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    }
  };
};

// Fetch all roles
export const fetchRolesAction = () => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/roles`);
    
    dispatch({
      type: FETCH_ROLES_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    
    dispatch({
      type: FETCH_ROLES_FAIL,
      payload: error.response?.data?.error || "Failed to fetch roles"
    });
    
    // Fall back to local roles from data file if API fails
    const { ROLES } = require("../../data/roles");
    
    dispatch({
      type: FETCH_ROLES_SUCCESS,
      payload: ROLES
    });
    
    return ROLES;
  }
};

// Create new role
export const createRoleAction = (roleData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/roles`, roleData, getConfig());
    
    dispatch({
      type: CREATE_ROLE_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (error) {
    console.error("Error creating role:", error);
    
    dispatch({
      type: CREATE_ROLE_FAIL,
      payload: error.response?.data?.error || "Failed to create role"
    });
    
    // If API fails, simulate a successful creation with local data
    // This ensures the UI still works even if the backend is not available
    const newRole = {
      ...roleData,
      _id: "local_" + Date.now(), // Generate a temporary ID
      isDefault: false
    };
    
    dispatch({
      type: CREATE_ROLE_SUCCESS,
      payload: newRole
    });
    
    return newRole;
  }
};

// Update role
export const updateRoleAction = (id, roleData) => async (dispatch) => {
  try {
    const res = await axios.put(`${API_URL}/roles/${id}`, roleData, getConfig());
    
    dispatch({
      type: UPDATE_ROLE_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (error) {
    console.error("Error updating role:", error);
    
    dispatch({
      type: UPDATE_ROLE_FAIL,
      payload: error.response?.data?.error || "Failed to update role"
    });
    
    throw error;
  }
};

// Delete role
export const deleteRoleAction = (id) => async (dispatch) => {
  try {
    await axios.delete(`${API_URL}/roles/${id}`, getConfig());
    
    dispatch({
      type: DELETE_ROLE_SUCCESS,
      payload: id
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    
    dispatch({
      type: DELETE_ROLE_FAIL,
      payload: error.response?.data?.error || "Failed to delete role"
    });
    
    throw error;
  }
};

// Generate role description
export const generateDescriptionAction = (roleName) => async (dispatch) => {
  try {
    const res = await axios.post(
      `${API_URL}/roles/generate-description`, 
      { roleName },
      getConfig()
    );
    
    dispatch({
      type: GENERATE_DESCRIPTION_SUCCESS,
      payload: res.data.description
    });
    
    return res.data.description;
  } catch (error) {
    console.error("Error generating description:", error);
    
    dispatch({
      type: GENERATE_DESCRIPTION_FAIL,
      payload: error.response?.data?.error || "Failed to generate description"
    });
    
    // Fallback to local generation if API fails
    const roleDescriptions = {
      "project manager": "Responsible for planning, executing, and closing projects. Oversees team members, manages schedules, and ensures projects are completed on time and within budget.",
      "product manager": "Responsible for the product throughout its lifecycle. Defines the product vision, gathers requirements, and works with development teams to deliver user value.",
      "developer": "Responsible for writing, testing, and maintaining code. Works on software features and fixes bugs.",
      "admin": "Has full system access and manages system settings, user accounts, and overall platform configuration.",
      "team lead": "Manages a team of developers or other staff members. Provides technical guidance and ensures team productivity.",
      "qa tester": "Responsible for testing software, identifying bugs, and ensuring quality standards are met.",
      "product owner": "Represents stakeholders and is responsible for maximizing the value of the product by creating and managing the product backlog.",
      "scrum master": "Facilitates Scrum processes and removes impediments for the development team."
    };
    
    const lowercaseName = roleName.toLowerCase();
    const description = roleDescriptions[lowercaseName] 
      ? roleDescriptions[lowercaseName]
      : `Responsible for ${lowercaseName} related activities in the system.`;
    
    dispatch({
      type: GENERATE_DESCRIPTION_SUCCESS,
      payload: description
    });
    
    return description;
  }
};*/