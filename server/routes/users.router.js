const express = require("express");
const Router = express();
const Controllers = require("../controllers/users");
const Register = require("../controllers/auth/Register");
const { Upload } = require("../controllers/images");
const passport = require("passport");
<<<<<<< HEAD
const { checkPermission } = require("../middlewares/roles-middleware");

=======
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6

Router.post("/register", Register);
Router.get(
  "/users",
<<<<<<< HEAD
  passport.authenticate("jwt", { session: false }), checkPermission("CREATE_USER"),
=======
  passport.authenticate("jwt", { session: false }),
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
  Controllers.GetAll
);
Router.get(
  "/users/:id",
<<<<<<< HEAD
  passport.authenticate("jwt", { session: false }), 
=======
  passport.authenticate("jwt", { session: false }),
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
  Controllers.GetOne
);
Router.put(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  Controllers.UpdateOne
);
Router.put(
  "/profile",
<<<<<<< HEAD
  passport.authenticate("jwt", { session: false }),checkPermission("UPDATE_USER"),
=======
  passport.authenticate("jwt", { session: false }),
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
  Controllers.UpdateProfile
);
Router.delete(
  "/users/:id",
<<<<<<< HEAD
  passport.authenticate("jwt", { session: false }),checkPermission("DELETE_USER"),
=======
  passport.authenticate("jwt", { session: false }),
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
  Controllers.DeleteOne
);

/* add images */
Router.post(
  "/images",
  passport.authenticate("jwt", { session: false }),
  Upload
);

/* update roles */
Router.post(
  "/users/:id/roles",
  passport.authenticate("jwt", { session: false }),
  Controllers.UpdateRole
);

/* delete roles */
Router.delete(
  "/users/:id/roles",
  passport.authenticate("jwt", { session: false }),
  Controllers.DeleteRole
);

module.exports = Router;
