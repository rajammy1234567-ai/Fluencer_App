import { sendOTPEmail } from './config/mailer.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing Nodemailer with Gmail credentials:');
console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_APP_PASSWORD exists:', !!process.env.GMAIL_APP_PASSWORD);

async function testMail() {
  try {
    const success = await sendOTPEmail(process.env.GMAIL_USER, '123456');
    console.log('Send result:', success);
  } catch (err) {
    console.error('Test script caught error:', err);
  }
}

testMail();
