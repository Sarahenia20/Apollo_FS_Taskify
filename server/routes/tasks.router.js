const express = require("express");
const Router = express.Router();
const Controllers = require("../controllers/tasks");
const passport = require("passport");
const upload = require('../middlewares/fileUpload');

// Middleware to log route access (for debugging)
const logRouteAccess = (req, res, next) => {
  console.log(`Accessing route: ${req.method} ${req.path}`);
  console.log('Request Body:', req.body);
  next();
};

// Create task with file upload
Router.post(
  "/tasks", 
  passport.authenticate("jwt", { session: false }),
  logRouteAccess,
  upload.single('attachment'),
  Controllers.Add
);

// Add task from suggestion
Router.post(
  "/tasks/addFromSuggestion",
  passport.authenticate("jwt", { session: false }),
  logRouteAccess,
  Controllers.AddFromSuggestion
);

// Get all tasks
Router.get(
  "/tasks",
  passport.authenticate("jwt", { session: false }),
  Controllers.GetAll
);

// Get single task
Router.get(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  Controllers.GetOne
);

// Update task with file upload
Router.put(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  logRouteAccess,
  upload.single('attachment'),
  Controllers.UpdateOne
);

// Delete task
Router.delete(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  Controllers.DeleteOne
);

// Download attachment
Router.get(
  "/tasks/:id/attachment",
  passport.authenticate("jwt", { session: false }),
  Controllers.DownloadAttachment
);

// Delete attachment
Router.delete(
  "/tasks/:id/attachment",
  passport.authenticate("jwt", { session: false }),
  Controllers.DeleteAttachment
);

module.exports = Router;