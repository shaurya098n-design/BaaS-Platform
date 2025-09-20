const { getSupabase } = require('../config/supabase');
const { AppError, catchAsync } = require('./errorHandler');
const logger = require('../utils/logger');

// Verify JWT token from Supabase
const verifyToken = catchAsync(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('No authorization header or invalid format');
      throw new AppError('Access token is required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    logger.info('Verifying token:', token.substring(0, 20) + '...');
    
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      logger.error('Token verification error:', error);
      throw new AppError('Invalid or expired token', 401);
    }

    if (!user) {
      logger.warn('No user found for token');
      throw new AppError('Invalid or expired token', 401);
    }

    logger.info('Token verified successfully for user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      logger.error('Token verification error:', error);
      next(new AppError('Authentication failed', 401));
    }
  }
});

// Optional authentication - doesn't fail if no token
const optionalAuth = catchAsync(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    req.user = null;
    next();
  }
});

// Check if user owns the resource
const checkOwnership = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.id !== resourceUserId) {
      return next(new AppError('You can only access your own resources', 403));
    }

    next();
  };
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const { checkRateLimit } = require('../config/redis');
    const key = `rate_limit:user:${req.user.id}`;
    const result = await checkRateLimit(key, maxRequests, Math.floor(windowMs / 1000));

    if (!result.allowed) {
      return next(new AppError('Too many requests. Please try again later.', 429));
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    });

    next();
  });
};

// Validate user permissions for app access
const validateAppAccess = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const appId = req.params.appId || req.params.id;
  
  if (!appId) {
    return next(new AppError('App ID is required', 400));
  }

  try {
    const { getAppByAppId } = require('../config/supabase');
    const app = await getAppByAppId(appId);

    if (!app) {
      return next(new AppError('App not found', 404));
    }

    if (app.user_id !== req.user.id) {
      return next(new AppError('You can only access your own apps', 403));
    }

    req.app = app;
    next();
  } catch (error) {
    logger.error('App access validation error:', error);
    next(new AppError('Failed to validate app access', 500));
  }
});

// Admin middleware (for future admin features)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  // Check if user has admin role (you can implement this based on your user metadata)
  const userRole = req.user.user_metadata?.role || req.user.app_metadata?.role;
  
  if (userRole !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
  checkOwnership,
  userRateLimit,
  validateAppAccess,
  requireAdmin
};
