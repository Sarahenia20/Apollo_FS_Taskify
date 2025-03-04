const nodemailer = require('nodemailer');

// Log environment variables (without exposing sensitive info)
console.log('Email configuration:');
console.log(`GMAIL_USER configured: ${!!process.env.GMAIL_USER}`);
console.log(`GMAIL_KEY configured: ${!!process.env.GMAIL_KEY}`);

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_KEY
  },
  // Add additional options for better error handling
  debug: true,
  logger: true
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send messages');
  }
});

/**
 * Send an email with 2FA verification code
 * @param {string} to - Recipient email address
 * @param {string} code - 6-digit verification code
 * @returns {Promise} - Nodemailer response
 */
const sendVerificationCode = async (to, code) => {
  try {
    console.log(`Preparing to send verification code to: ${to}`);
    
    const mailOptions = {
      from: `"Taskify Security" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Your Taskify Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333;">Taskify Security Verification</h2>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
            <p>Hello,</p>
            <p>Your verification code for Taskify login is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 10px 30px; background-color: #ffffff; border: 1px dashed #cccccc; border-radius: 5px;">${code}</span>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email or contact support if you're concerned about your account security.</p>
          </div>
          <div style="margin-top: 20px; text-align: center; color: #888; font-size: 12px;">
            <p>This is an automated message, please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} Taskify. All rights reserved.</p>
          </div>
        </div>
      `
    };

    console.log('Sending email with the following options:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      from: mailOptions.from
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication error - check Gmail credentials');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error - check network connection');
    }
    return { success: false, error: error.message || 'Unknown error' };
  }
};

module.exports = {
  sendVerificationCode
};
