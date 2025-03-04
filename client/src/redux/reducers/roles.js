import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _ALL: [],
  _ONE: {},
};

export const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    _AddRole: (state, action) => {
      state._ALL = [...state._ALL, action.payload];
    },
    _FindRoles: (state, action) => {
      state._ALL = action.payload;
    },
    _FindOneRole: (state, action) => {
      state._ONE = action.payload;
    },
    _FilterRole: (state, action) => {
      state._ALL = state._ALL.filter((item) => item._id !== action.payload);
    },
  },
});

// Export actions
export const { _AddRole, _FindRoles, _FindOneRole, _FilterRole } = rolesSlice.actions;

// Export reducer
export default rolesSlice.reducer;
