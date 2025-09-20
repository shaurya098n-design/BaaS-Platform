const express = require('express');
const { getSupabase, getSupabaseAdmin } = require('../config/supabase');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Register new user
router.post('/register', 
  catchAsync(async (req, res) => {
    // Debug logging
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { email, password, userData = {} } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    const supabase = getSupabase();
    const supabaseAdmin = getSupabaseAdmin();

    try {
      console.log('Calling Supabase auth.signUp...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            created_via: 'deployment_platform'
          },
          emailRedirectTo: undefined // Disable email confirmation for testing
        }
      });

      console.log('Supabase response data:', data);
      console.log('Supabase response error:', error);

      if (error) {
        console.log('Supabase error details:', error);
        console.log('Supabase error message:', error.message);
        console.log('Supabase error status:', error.status);
        throw new AppError(error.message, 400);
      }

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          user: {
            id: data.user?.id,
            email: data.user?.email,
            emailConfirmed: data.user?.email_confirmed_at ? true : false
          }
        }
      });

    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  })
);

// Login user
router.post('/login', 
  catchAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const supabase = getSupabase();

    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Login response data:', data);
      console.log('Login response error:', error);

      if (error) {
        console.log('Login error details:', error);
        throw new AppError('Invalid email or password', 401);
      }

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            emailConfirmed: data.user.email_confirmed_at ? true : false,
            lastSignIn: data.user.last_sign_in_at
          },
          token: data.session.access_token,
          session: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at
          }
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  })
);

// Logout user
router.post('/logout', 
  optionalAuth,
  catchAsync(async (req, res) => {
    const supabase = getSupabase();

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('Logout error:', error);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  })
);

// Refresh token
router.post('/refresh', 
  catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const supabase = getSupabase();

    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        throw new AppError('Invalid refresh token', 401);
      }

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          session: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at
          }
        }
      });

    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  })
);

// Get current user
router.get('/me', 
  optionalAuth,
  catchAsync(async (req, res) => {
    if (!req.user) {
      return res.json({
        success: true,
        data: {
          user: null,
          authenticated: false
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          emailConfirmed: req.user.email_confirmed_at ? true : false,
          createdAt: req.user.created_at,
          lastSignIn: req.user.last_sign_in_at,
          metadata: req.user.user_metadata
        },
        authenticated: true
      }
    });
  })
);

// Update user profile
router.put('/profile', 
  optionalAuth,
  catchAsync(async (req, res) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { userData } = req.body;
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });

      if (error) {
        throw new AppError(error.message, 400);
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            metadata: data.user.user_metadata
          }
        }
      });

    } catch (error) {
      logger.error('Profile update error:', error);
      throw error;
    }
  })
);

// Change password
router.put('/password', 
  optionalAuth,
  catchAsync(async (req, res) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { password } = req.body;

    if (!password || password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    const supabase = getSupabase();

    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        throw new AppError(error.message, 400);
      }

      res.json({
        success: true,
        message: 'Password updated successfully'
      });

    } catch (error) {
      logger.error('Password update error:', error);
      throw error;
    }
  })
);

// Request password reset
router.post('/reset-password', 
  catchAsync(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const supabase = getSupabase();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.CORS_ORIGIN}/reset-password`
      });

      if (error) {
        throw new AppError(error.message, 400);
      }

      res.json({
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      });

    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  })
);

// Verify email
router.post('/verify-email', 
  catchAsync(async (req, res) => {
    const { token, type } = req.body;

    if (!token || !type) {
      throw new AppError('Token and type are required', 400);
    }

    const supabase = getSupabase();

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type
      });

      if (error) {
        throw new AppError(error.message, 400);
      }

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            emailConfirmed: data.user.email_confirmed_at ? true : false
          }
        }
      });

    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  })
);

// OAuth providers (Google, GitHub, etc.)
router.post('/oauth/:provider', 
  catchAsync(async (req, res) => {
    const { provider } = req.params;
    const { redirectTo } = req.body;

    const allowedProviders = ['google', 'github', 'discord', 'twitter'];
    if (!allowedProviders.includes(provider)) {
      throw new AppError('Unsupported OAuth provider', 400);
    }

    const supabase = getSupabase();

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || `${process.env.CORS_ORIGIN}/auth/callback`
        }
      });

      if (error) {
        throw new AppError(error.message, 400);
      }

      res.json({
        success: true,
        message: 'OAuth redirect initiated',
        data: {
          url: data.url
        }
      });

    } catch (error) {
      logger.error(`OAuth ${provider} error:`, error);
      throw error;
    }
  })
);

module.exports = router;
