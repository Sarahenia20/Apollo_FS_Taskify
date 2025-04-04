const express = require("express");
const Router = express.Router();
const Controllers = require("../controllers/users");
const passport = require("passport");

// Debug logging
console.log("Imported Controllers:", Object.keys(Controllers));

Router.get(
  "/users", 
  passport.authenticate("jwt", { session: false }),
  Controllers.GetAll // Ensure this matches exactly
);

Router.get(
  "/users/:id", 
  passport.authenticate("jwt", { session: false }),
  Controllers.GetOne
);

Router.put(
  "/users/:id", 
  passport.authenticate("jwt", { session: false }),
  Controllers.UpdateOne
);

Router.delete(
  "/users/:id", 
  passport.authenticate("jwt", { session: false }),
  Controllers.DeleteOne
);

Router.put(
  "/profile", 
  passport.authenticate("jwt", { session: false }),
  Controllers.UpdateProfile
);

module.exports = Router;