import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./reducers/auth";
import { commonSlice } from "./reducers/commons";
import { errorsSlice } from "./reducers/errors";
import { notificationSlice } from "./reducers/notifications";
import { tasksSlice } from "./reducers/tasks";
import { usersSlice } from "./reducers/users";
<<<<<<< HEAD
import { rolesSlice } from "./reducers/roles";
=======
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    users: usersSlice.reducer,
<<<<<<< HEAD
    roles: rolesSlice.reducer, 
=======
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
    tasks: tasksSlice.reducer,
    errors: errorsSlice.reducer,
    commons: commonSlice.reducer,
    notifications: notificationSlice.reducer
  },
});
