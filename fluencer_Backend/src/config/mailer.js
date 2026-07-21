import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Clean app password - remove spaces and quotes
const cleanAppPassword = (process.env.GMAIL_APP_PASSWORD || '').replace(/[\s"']/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: cleanAppPassword,
  },
});

export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Fluncer - Your OTP for Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #826FCC 0%, #5D42C6 100%); padding: 20px; border-radius: 8px;">
          <div style="background: white; padding: 30px; border-radius: 8px; text-align: center; max-width: 400px; margin: 0 auto;">
            <h2 style="color: #44449D; margin: 0 0 20px 0;">Fluncer</h2>
            <p style="color: #373233; font-size: 16px; margin: 0 0 10px 0;">Your OTP for Email Verification</p>
            <div style="background: linear-gradient(135deg, #826FCC 0%, #5D42C6 100%); padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 0;">${otp}</p>
            </div>
            <p style="color: #7C7474; font-size: 14px; margin: 20px 0;">This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES} minutes</p>
            <p style="color: #7C7474; font-size: 12px; margin: 10px 0;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

export default transporter;
