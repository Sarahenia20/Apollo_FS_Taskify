import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./reducers/auth";
import { commonSlice } from "./reducers/commons";
import { errorsSlice } from "./reducers/errors";
import { notificationSlice } from "./reducers/notifications";
import { tasksSlice } from "./reducers/tasks";
import { usersSlice } from "./reducers/users";
import { teamsSlice } from "./reducers/teams";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    users: usersSlice.reducer,
    tasks: tasksSlice.reducer,
    errors: errorsSlice.reducer,
    commons: commonSlice.reducer,
    notifications: notificationSlice.reducer,
    teams: teamsSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disables the serializability check
    }),
});
