// src/redux/reducers/rolesReducer.js
/*import {
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
  
  // Import default roles for fallback
  import { ROLES } from "../../data/roles";
  
  const initialState = {
    roles: [],
    loadedRoles: false,
    error: null,
    generatedDescription: "",
    loading: false
  };
  
  const rolesReducer = (state = initialState, action) => {
    const { type, payload } = action;
    
    switch (type) {
      case FETCH_ROLES_SUCCESS:
        return {
          ...state,
          roles: payload,
          loadedRoles: true,
          error: null
        };
      
      case FETCH_ROLES_FAIL:
        return {
          ...state,
          roles: ROLES, // Fallback to local data
          loadedRoles: true,
          error: payload
        };
      
      case CREATE_ROLE_SUCCESS:
        return {
          ...state,
          roles: [...state.roles, payload],
          error: null
        };
      
      case CREATE_ROLE_FAIL:
        return {
          ...state,
          error: payload
        };
      
      case UPDATE_ROLE_SUCCESS:
        return {
          ...state,
          roles: state.roles.map(role => 
            role._id === payload._id ? payload : role
          ),
          error: null
        };
      
      case UPDATE_ROLE_FAIL:
        return {
          ...state,
          error: payload
        };
      
      case DELETE_ROLE_SUCCESS:
        return {
          ...state,
          roles: state.roles.filter(role => role._id !== payload),
          error: null
        };
      
      case DELETE_ROLE_FAIL:
        return {
          ...state,
          error: payload
        };
      
      case GENERATE_DESCRIPTION_SUCCESS:
        return {
          ...state,
          generatedDescription: payload,
          error: null
        };
      
      case GENERATE_DESCRIPTION_FAIL:
        return {
          ...state,
          error: payload
        };
      
      default:
        return state;
    }
  };
  
  export default rolesReducer;*/