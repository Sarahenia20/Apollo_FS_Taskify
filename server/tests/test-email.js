const { sendVerificationCode } = require('../utils/emailService');
require('dotenv').config();

// Test email sending
async function testEmailSending() {
  console.log('Starting email test...');
  console.log('Environment variables:');
  console.log(`GMAIL_USER: ${process.env.GMAIL_USER ? 'Set' : 'Not set'}`);
  console.log(`GMAIL_KEY: ${process.env.GMAIL_KEY ? 'Set' : 'Not set'}`);
  
  const testEmail = process.env.GMAIL_USER || 'test@example.com'; // Use your own email to test
  const testCode = '123456';
  
  console.log(`Sending test email to: ${testEmail}`);
  console.log(`Test verification code: ${testCode}`);
  
  try {
    const result = await sendVerificationCode(testEmail, testCode);
    console.log('Email send result:', result);
    
    if (result.success) {
      console.log('✅ Email test successful!');
    } else {
      console.log('❌ Email test failed:', result.error);
    }
  } catch (error) {
    console.error('Uncaught error during email test:', error);
  }
}

// Run the test
testEmailSending();
