import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./reducers/auth";
import { commonSlice } from "./reducers/commons";
import { errorsSlice } from "./reducers/errors";
import { notificationSlice } from "./reducers/notifications";
import { tasksSlice } from "./reducers/tasks";
import { usersSlice } from "./reducers/users";
import rolesReducer from "./reducers/roles";
import projectsReducer from "./reducers/projects";
import { teamsSlice } from "./reducers/teams";
import { chatSlice } from './reducers/chatReducer';
import videoCallsReducer from "./reducers/VideoCalls";  // Changed to default import
import smartAssignReducer from "./reducers/smartAssign"; // Make sure this path is correct
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    users: usersSlice.reducer,
    tasks: tasksSlice.reducer,
    errors: errorsSlice.reducer,
    commons: commonSlice.reducer,
    notifications: notificationSlice.reducer,
    roles: rolesReducer,
    projects: projectsReducer,
    teams: teamsSlice.reducer,
    smartAssign: smartAssignReducer ,
    videoCalls: videoCallsReducer,  // Use the default export directly
    chat: chatSlice.reducer
  },
});