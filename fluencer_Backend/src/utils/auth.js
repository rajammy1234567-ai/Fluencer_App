import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateToken = (userId, role = 'influencer') => {
  return jwt.sign(
    { 
      id: userId,      // CRITICAL: Use 'id' to match req.user.id
      userId: userId,  // Keep userId for backward compatibility
      role: role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const generateOTPExpiry = () => {
  const now = new Date();
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
  return new Date(now.getTime() + expiryMinutes * 60 * 1000);
};

export const isOTPExpired = (expiryTime) => {
  return new Date() > new Date(expiryTime);
};
