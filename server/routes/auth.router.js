const express = require("express");
const Router = express();
const Login = require("../controllers/auth/Login");
const { ChangePassword } = require("../controllers/auth/ChangePassword");
const passport = require("passport");
const { CheckMail, ResetPassword } = require("../controllers/auth/Reset");
const { 
  generateTwoFactorSecret, 
  verifyAndEnableTwoFactor, 
  disableTwoFactor, 
  verifyOtp,
  checkTwoFactorStatus,
  sendEmailVerificationCode,
  verifyEmailCode
} = require("../controllers/auth/TwoFactorAuth");

Router.post("/login", Login);
Router.post(
  "/change_password",
  passport.authenticate("jwt", { session: false }),
  ChangePassword
);
Router.post("/__check_mail", CheckMail);
Router.post("/__reset_password", ResetPassword);

// 2FA routes
Router.post("/2fa/check", checkTwoFactorStatus);
Router.post("/2fa/verify-otp", verifyOtp);
Router.post(
  "/2fa/generate",
  passport.authenticate("jwt", { session: false }),
  generateTwoFactorSecret
);
Router.post(
  "/2fa/verify-enable",
  passport.authenticate("jwt", { session: false }),
  verifyAndEnableTwoFactor
);
Router.post(
  "/2fa/disable",
  passport.authenticate("jwt", { session: false }),
  disableTwoFactor
);

// Email verification for 2FA
Router.post("/2fa/send-email-code", sendEmailVerificationCode);
Router.post("/2fa/verify-email-code", verifyEmailCode);

module.exports = Router;
