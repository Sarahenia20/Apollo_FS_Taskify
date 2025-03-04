const UserModel = require("../../models/users");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { sendVerificationCode } = require("../../utils/emailService");

// In-memory storage for verification codes
const tempVerificationCodes = new Map();

// Generate a random 6-digit code
const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate and send email verification code
const sendEmailVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Attempting to send verification code to: ${email}`);

    // Find the user
    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a random 6-digit code
    const verificationCode = generateSixDigitCode();
    console.log(`Generated verification code: ${verificationCode}`);
    
    // Store the code with expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    tempVerificationCodes.set(email, {
      code: verificationCode,
      expiresAt
    });
    console.log(`Stored verification code with expiration: ${expiresAt}`);

    // DEVELOPMENT MODE: For testing purposes, don't actually send email
    // Instead, log the code to console and return it in the response
    if (process.env.NODE_ENV === 'development' || process.env.SKIP_EMAIL_SENDING === 'true') {
      console.log(`DEVELOPMENT MODE: Skip email sending. Verification code: ${verificationCode}`);
      
      return res.status(200).json({ 
        message: "DEVELOPMENT MODE: Verification code logged to console",
        expiresAt,
        code: verificationCode // ONLY in development mode
      });
    }

    // Production mode - Send the code via email
    console.log(`Sending verification code via email...`);
    const emailResult = await sendVerificationCode(email, verificationCode);
    console.log(`Email result:`, emailResult);
    
    if (!emailResult.success) {
      // Fallback for email sending failures in production
      console.error(`Failed to send email:`, emailResult.error);
      console.log(`Fallback: Returning code in response due to email error`);
      
      return res.status(200).json({ 
        message: "Warning: Could not send email. Please use the code provided.",
        error: emailResult.error,
        expiresAt,
        code: verificationCode // Providing code due to email failure
      });
    }

    console.log(`Successfully sent verification code to: ${email}`);
    res.status(200).json({ 
      message: "Verification code sent to your email",
      expiresAt
    });
  } catch (error) {
    console.error("Error sending verification code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify email verification code
const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Check if there's a valid code for this email
    const storedData = tempVerificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ error: "No verification code found or code has expired" });
    }

    if (new Date() > storedData.expiresAt) {
      // Remove expired code
      tempVerificationCodes.delete(email);
      return res.status(400).json({ error: "Verification code has expired" });
    }

    // Verify the code
    if (storedData.code !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Code is valid - remove it from temp storage so it can't be reused
    tempVerificationCodes.delete(email);

    res.status(200).json({ 
      message: "Email verification successful", 
      verified: true 
    });
  } catch (error) {
    console.error("Error verifying email code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Generate 2FA secret and QR code
const generateTwoFactorSecret = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: "Two-factor authentication is already enabled" });
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `Taskify:${user.email}`,
    });

    // Store the secret temporarily (not enabled yet until verified)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      message: "Two-factor authentication secret generated",
      qrCode: qrCodeUrl,
      secret: secret.base32, // This should be shown to the user only once
    });
  } catch (error) {
    console.error("Error generating 2FA secret:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify and enable 2FA
const verifyAndEnableTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({ message: "Two-factor authentication enabled successfully" });
  } catch (error) {
    console.error("Error verifying 2FA token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Disable 2FA
const disableTwoFactor = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if 2FA is already disabled
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: "Two-factor authentication is not enabled" });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({ message: "Two-factor authentication disabled successfully" });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify OTP during login
const verifyOtp = async (req, res) => {
  try {
    const { email, token } = req.body;

    // Find the user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    res.status(200).json({ message: "OTP verified successfully", verified: true });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Check if user has 2FA enabled
const checkTwoFactorStatus = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ twoFactorEnabled: user.twoFactorEnabled });
  } catch (error) {
    console.error("Error checking 2FA status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  generateTwoFactorSecret,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  verifyOtp,
  checkTwoFactorStatus,
  sendEmailVerificationCode,
  verifyEmailCode
};
