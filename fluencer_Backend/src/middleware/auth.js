import { verifyToken } from '../utils/auth.js';
import User from '../models/User.js';

// CRITICAL: JWT Auth Middleware - ALWAYS returns JSON
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided. Please include Authorization header.' 
      });
    }

    // Check if it starts with Bearer
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format. Use: Bearer <token>' 
      });
    }

    // Extract token
    const token = authHeader.substring(7);
    
    if (!token || token.trim() === '') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is empty' 
      });
    }

    // Verify token signature
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token. Please login again.' 
      });
    }

    // Check if user still exists in database (rejects deleted users and revoked sessions)
    const userId = decoded.userId || decoded.id;
    if (decoded.role !== 'admin' && userId && userId !== 'guest_user') {
      const activeUser = await User.findById(userId).select('_id is_deleted');
      if (!activeUser || activeUser.is_deleted) {
        return res.status(401).json({
          success: false,
          message: 'Account no longer exists or session has been revoked. Please login or register again.'
        });
      }
    }

    // Attach user to request
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error', 
      error: error.message 
    });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) req.user = decoded;
    }
    if (!req.user) {
      req.user = { id: 'guest_user', userId: 'guest_user', role: 'guest' };
    }
    next();
  } catch (error) {
    req.user = { id: 'guest_user', userId: 'guest_user', role: 'guest' };
    next();
  }
};

export const authenticateToken = authMiddleware;
export default authMiddleware;
