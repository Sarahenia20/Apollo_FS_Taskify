const express = require("express");
const Router = express();
const Controllers = require("../controllers/comments");
const passport = require("passport");

// Fix route path - add 'tasks/' prefix to match other routes
Router.post(
  "/tasks/:id/comments",
  passport.authenticate("jwt", { session: false }),
  Controllers.AddComment
);

// Fix route path - add 'tasks/' prefix to match other routes
Router.get(
  "/tasks/:id/comments", 
  passport.authenticate("jwt", { session: false }), 
  Controllers.GetComments
);

Router.delete(
  "/tasks/:id/comments/:c_id",
  passport.authenticate("jwt", { session: false }),
  Controllers.DeleteComment
);

module.exports = Router;