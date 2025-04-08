const UserModel = require("../../models/users");
const LoginActivity = require("../../models/LoginActivity");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const loginValidation = require("../../validation/loginValidation");
const { checkSuspiciousLogin } = require("../../config/loginSecurity");
const { sendSuspiciousLoginAlert } = require("../../config/mail");

// Mode test pour désactiver temporairement la 2FA
const TEST_MODE = false; // Mettre à false pour activer la 2FA

// Helper function to record login activity
function recordLoginActivity(user, req, isSuccessful, is2FARequired = false) {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];

  // Only check for suspicious activity on successful logins
  if (isSuccessful) {
    return checkSuspiciousLogin(user._id, ipAddress, userAgent)
      .then((suspiciousCheck) => {
        // Create login activity record
        const loginActivity = new LoginActivity({
          user: user._id,
          timestamp: new Date(),
          ipAddress,
          userAgent,
          successful: isSuccessful,
          isSuspicious: suspiciousCheck.isSuspicious,
          suspiciousReason: suspiciousCheck.reasons,
          twoFactorRequired: is2FARequired,
        });

        // Save login activity
        return loginActivity.save().then(() => {
          // Send alert if suspicious
          if (isSuccessful && suspiciousCheck.isSuspicious) {
            // Convert async function to promise chain
            return Promise.resolve().then(async () => {
              try {
                const result = await sendSuspiciousLoginAlert(
                  user,
                  loginActivity
                );
                console.log("Email alert result:", result);
                return {
                  isSuspicious: suspiciousCheck.isSuspicious,
                  reasons: suspiciousCheck.reasons,
                  emailSent: true,
                  emailPreviewUrl: result.previewUrl,
                };
              } catch (error) {
                console.error("Error sending email alert:", error);
                return {
                  isSuspicious: suspiciousCheck.isSuspicious,
                  reasons: suspiciousCheck.reasons,
                  emailSent: false,
                };
              }
            });
          }

          return {
            isSuspicious: suspiciousCheck.isSuspicious,
            reasons: suspiciousCheck.reasons,
          };
        });
      })
      .catch((error) => {
        console.error("Error recording login activity:", error);
        return { isSuspicious: false };
      });
  } else {
    // For failed logins, don't check for suspicious activity
    const loginActivity = new LoginActivity({
      user: user._id,
      timestamp: new Date(),
      ipAddress,
      userAgent,
      successful: false,
      isSuspicious: false,
      twoFactorRequired: false,
    });

    return loginActivity
      .save()
      .then(() => {
        return { isSuspicious: false };
      })
      .catch((error) => {
        console.error("Error recording failed login activity:", error);
        return { isSuspicious: false };
      });
  }
}

const Login = (req, res) => {
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
              // Record failed login
              recordLoginActivity(user, req, false).then(() => {
                errors.password = "Incorrect password";
                res.status(404).json(errors);
              });
            } else {
              // Check if 2FA is enabled for this user
              if (user.twoFactorEnabled === true && !TEST_MODE) {
                // Record successful login with 2FA required
                recordLoginActivity(user, req, true, true).then(() => {
                  // Return a response indicating 2FA is required
                  res.status(200).json({
                    message: "2FA_REQUIRED",
                    email: user.email,
                    twoFactorRequired: true,
                  });
                });
              } else {
                // Record successful login
                recordLoginActivity(user, req, true).then((securityCheck) => {
                  // For testing email functionality
                  console.log("email alert functionality log...");
                  const testLoginActivity = {
                    timestamp: new Date(),
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers["user-agent"],
                    deviceInfo: {
                      browser: "Chrome",
                      os: "Windows",
                      device: "Desktop",
                    },
                    suspiciousReason: [
                      "Test reason - Force email alert for testing",
                    ],
                  };

                  // Convert async function to promise chain
                  Promise.resolve()
                    .then(async () => {
                      try {
                        const emailResult = await sendSuspiciousLoginAlert(
                          user,
                          testLoginActivity
                        );
                        console.log(
                          "Suspicious log email sending result:",
                          emailResult
                        );

                        if (emailResult.previewUrl) {
                          console.log(
                            "📧 View  email at:",
                            emailResult.previewUrl
                          );
                        }

                        return emailResult;
                      } catch (error) {
                        console.error("Error sending email:", error);
                        return { success: false, error: error.message };
                      }
                    })
                    .finally(() => {
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

                      // Add security alert to response if suspicious login detected
                      const response = {
                        message: "Success",
                        token: token,
                      };

                      if (securityCheck.isSuspicious) {
                        response.securityAlert = {
                          message:
                            "Suspicious login detected. A security alert has been sent to your email.",
                          reasons: securityCheck.reasons,
                        };

                        if (securityCheck.emailPreviewUrl) {
                          response.securityAlert.emailPreviewUrl =
                            securityCheck.emailPreviewUrl;
                        }
                      }

                      res.status(200).json(response);
                    });
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
