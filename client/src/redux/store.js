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
import { adminChatSlice } from './reducers/adminChatReducer';
import { activitySlice } from "./reducers/activitySlice"; // Add this import

import predictionsReducer from "./reducers/predictions";
import videoCallsReducer from "./reducers/VideoCalls";
import smartAssignReducer from "./reducers/smartAssign";

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
    smartAssign: smartAssignReducer,
    videoCalls: videoCallsReducer,
    chat: chatSlice.reducer,
    admin: adminChatSlice.reducer,
    predictions: predictionsReducer,
    activity: activitySlice.reducer  // Add this line
  },
});