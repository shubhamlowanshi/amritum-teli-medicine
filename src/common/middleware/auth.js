import authService from '../../modules/auth/auth.service.js';
import User from '../../modules/users/user.model.js'

// Verify JWT access token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Access token required');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      throw error;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token, 'access');
    
    const user = await User.findOne({ _id: decoded.userId, isActive: true });
    
    if (!user) {
      const error = new Error('User not found or inactive');
      error.code = 'USER_NOT_FOUND';
      error.status = 401;
      throw error;
    }
    
    req.user = {
      userId: decoded.userId,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      error.code = 'TOKEN_EXPIRED';
      error.status = 401;
    }
    
    if (error.name === 'JsonWebTokenError') {
      error.code = 'INVALID_TOKEN';
      error.status = 401;
    }
    
    next(error);
  }
};

// Optional authentication
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = authService.verifyToken(token, 'access');
      
      const user = await User.findOne({ _id: decoded.userId, isActive: true });
      
      if (user) {
        req.user = {
          userId: decoded.userId,
          email: user.email,
          role: user.role
        };
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Unauthorized');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      return next(error);
    }
    
    if (!roles.includes(req.user.role)) {
      const error = new Error('Forbidden');
      error.code = 'FORBIDDEN';
      error.status = 403;
      return next(error);
    }
    
    next();
  };
};