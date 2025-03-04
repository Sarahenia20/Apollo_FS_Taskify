const UserModel = require("../../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const loginValidation = require("../../validation/loginValidation");

const Login = async (req, res) => {
  const { errors, isValid } = loginValidation(req.body);
  try {
    if (!isValid) {
      res.status(404).json(errors);
    } else {
      UserModel.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          errors.email = "User does not exist";
          res.status(404).json(errors);
        } else {
          bcrypt.compare(req.body.password, user.password).then((isMatch) => {
            if (!isMatch) {
              errors.password = "Incorrect password";
              res.status(404).json(errors);
            } else {
              // Check if email verification has been completed
              if (!req.body.emailVerified) {
                // Always require email verification
                return res.status(200).json({
                  requireEmailVerification: true,
                  message: "Email verification required",
                  email: user.email
                });
              }

              // If email has been verified, proceed with login
              var token = jwt.sign(
                {
                  id: user._id,
                  fullName: user.fullName,
                  email: user.email,
                  roles: user.roles,
                },
                process.env.PRIVATE_KEY,
                { expiresIn: "1h" }
              );
              res.status(200).json({
                message: "Success",
                token: token,
              });
            }
          });
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = Login;
