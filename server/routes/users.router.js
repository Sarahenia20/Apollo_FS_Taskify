const express = require("express");
const Router = express.Router();
const Controllers = require("../controllers/users");
const passport = require("passport");
const User = require("../models/users");
// Debug logging
console.log("Imported Controllers:", Object.keys(Controllers));
// Add this to your router (routes/users.js)

// Add POST route for creating users
Router.post(
  "/users", 
  passport.authenticate("jwt", { session: false }),
  Controllers.CreateUser
);
Router.get(
  "/users", 
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Fetch all users but exclude sensitive fields
      const users = await User.find({}, { 
        password: 0, 
        reset_token: 0,
        twoFactorEnabled: 0
      });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: error.message });
    }
  }
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