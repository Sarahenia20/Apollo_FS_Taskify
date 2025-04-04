const UserModel = require("../../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const loginValidation = require("../../validation/loginValidation");

// Mode test pour désactiver temporairement la 2FA
const TEST_MODE = false; // Mettre à false pour activer la 2FA

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
              // Check if 2FA is enabled for this user
              // Explicitly check if twoFactorEnabled is true (not undefined or false)
              if (user.twoFactorEnabled === true && !TEST_MODE) {
                // Return a response indicating 2FA is required
                return res.status(200).json({
                  message: "2FA_REQUIRED",
                  email: user.email,
                  twoFactorRequired: true
                });
              } else {
                // 2FA not required or TEST_MODE is enabled, proceed with normal login
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
            }
          });
        }
      });
    }
  } catch (error) {
    res.status(404).json(error.message);
  }
};
module.exports = Login;
