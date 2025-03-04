import { createSlice } from "@reduxjs/toolkit";
import isEmpty from "../../validation/isEmpty";
import { setAuthToken } from "../../lib/setAuthToken";

const initialState = {
  isAuthenticated: false,
  user: {},
  loading: true,
  emailVerificationRequired: false,
  emailForVerification: ""
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
        setAuthToken(action.payload.token);
      }
      state.isAuthenticated = !isEmpty(action.payload);
      state.user = action.payload;
      state.loading = false;
    },
    setEmailVerificationRequired: (state, action) => {
      state.emailVerificationRequired = true;
      state.emailForVerification = action.payload.email;
    },
    clearEmailVerificationRequired: (state) => {
      state.emailVerificationRequired = false;
      state.emailForVerification = "";
    },
    logoutUser: (state) => {
      localStorage.removeItem("token");
      setAuthToken(false);
      state.isAuthenticated = false;
      state.user = {};
      state.loading = false;
    }
  },
});

// Export actions
export const { 
  setUser, 
  setEmailVerificationRequired, 
  clearEmailVerificationRequired,
  logoutUser
} = authSlice.actions;

export default authSlice.reducer;
