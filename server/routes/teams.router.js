const express = require("express");
const Router = express();
const Controllers = require("../controllers/teams");
const passport = require("passport");

Router.post(
  "/teams",
  passport.authenticate("jwt", { session: false }),
  Controllers.CreateTeam
);
Router.get(
  "/teams",
  passport.authenticate("jwt", { session: false }),
  Controllers.GetAllTeams
);
Router.get(
  "/teams/:id",
  passport.authenticate("jwt", { session: false }),
  Controllers.GetTeam
);
Router.put(
  "/teams/:id",
  passport.authenticate("jwt", { session: false }),
  Controllers.UpdateTeam
);
Router.delete(
  "/teams/:id",
  passport.authenticate("jwt", { session: false }),
  Controllers.DeleteTeam
);

Router.post(
    "/teams/:id/members",
    passport.authenticate("jwt", { session: false }),
    Controllers.AddMember
  );
  Router.delete(
    "/teams/:id/members",
    passport.authenticate("jwt", { session: false }),
    Controllers.RemoveMember
  );
  Router.put(
    "/teams/:id/members/role",
    passport.authenticate("jwt", { session: false }),
    Controllers.UpdateMemberRole
  );
  Router.get(
    "/teams/user",
    passport.authenticate("jwt", { session: false }),
    Controllers.GetUserTeams
  );

module.exports = Router;
