const express = require("express");
const Router = express.Router();
const Controllers = require("../controllers/teams");
const passport = require("passport");

// Create a new team
Router.post(
  "/teams",
  passport.authenticate("jwt", { session: false }),
  Controllers.CreateTeam
);

// Get all teams
Router.get(
  "/teams",
  passport.authenticate("jwt", { session: false }),
  Controllers.GetAllTeams
);

// Get a single team by ID
Router.get(
  "/teams/:id",
  passport.authenticate("jwt", { session: false }),
  Controllers.GetTeam
);

// Get all teams for the current user
Router.get(
  "/teams/user",
  passport.authenticate("jwt", { session: false }),
  Controllers.GetUserTeams
);

// Update a team
Router.put(
  "/teams/:id",
  passport.authenticate("jwt", { session: false }),
  Controllers.UpdateTeam
);

// Delete a team
Router.delete(
  "/teams/:id",
  passport.authenticate("jwt", { session: false }),
  Controllers.DeleteTeam
);

// Add a member to a team
Router.post(
  "/teams/:id/members",
  passport.authenticate("jwt", { session: false }),
  Controllers.AddMember
);

// Remove a member from a team
Router.delete(
  "/teams/:id/members",
  passport.authenticate("jwt", { session: false }),
  Controllers.RemoveMember
);

// Update a member's role
Router.patch(
  "/teams/:id/members",
  passport.authenticate("jwt", { session: false }),
  Controllers.UpdateMemberRole
);

module.exports = Router;