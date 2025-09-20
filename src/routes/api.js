const express = require('express');
const { verifyToken, optionalAuth, userRateLimit } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { getSupabaseAdmin } = require('../config/supabase');
const { setCache, getCache } = require('../config/redis');
const logger = require('../utils/logger');

const router = express.Router();

// CRUD Operations
// Create resource
router.post('/crud/:resource', 
  verifyToken,
  userRateLimit(100, 60 * 1000), // 100 requests per minute
  catchAsync(async (req, res) => {
    const { resource } = req.params;
    const data = req.body;
    const userId = req.user.id;

    if (!data || Object.keys(data).length === 0) {
      throw new AppError('Data is required', 400);
    }

    // Add user_id to the data
    data.user_id = userId;
    data.created_at = new Date().toISOString();

    const supabase = getSupabaseAdmin();

    try {
      const { data: result, error } = await supabase
        .from(resource)
        .insert([data])
        .select()
        .single();

      if (error) {
        throw new AppError(`Failed to create ${resource}: ${error.message}`, 400);
      }

      // Invalidate cache
      const cacheKey = `user:${userId}:${resource}`;
      await setCache(cacheKey, null, 0); // Delete cache

      logger.info(`Created ${resource} for user ${userId}`);

      res.status(201).json({
        success: true,
        message: `${resource} created successfully`,
        data: result
      });

    } catch (error) {
      logger.error(`Error creating ${resource}:`, error);
      throw error;
    }
  })
);

// Read resources (with pagination and filtering)
router.get('/crud/:resource', 
  verifyToken,
  userRateLimit(200, 60 * 1000), // 200 requests per minute
  catchAsync(async (req, res) => {
    const { resource } = req.params;
    const { page = 1, limit = 10, sort = 'created_at', order = 'desc', ...filters } = req.query;
    const userId = req.user.id;

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from(resource)
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query = query.eq(key, value);
      }
    });

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    try {
      const { data, error, count } = await query;

      if (error) {
        throw new AppError(`Failed to fetch ${resource}: ${error.message}`, 400);
      }

      res.json({
        success: true,
        data: data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / parseInt(limit))
        }
      });

    } catch (error) {
      logger.error(`Error fetching ${resource}:`, error);
      throw error;
    }
  })
);

// Read single resource
router.get('/crud/:resource/:id', 
  verifyToken,
  userRateLimit(200, 60 * 1000),
  catchAsync(async (req, res) => {
    const { resource, id } = req.params;
    const userId = req.user.id;

    const supabase = getSupabaseAdmin();

    try {
      const { data, error } = await supabase
        .from(resource)
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new AppError(`${resource} not found`, 404);
        }
        throw new AppError(`Failed to fetch ${resource}: ${error.message}`, 400);
      }

      res.json({
        success: true,
        data
      });

    } catch (error) {
      logger.error(`Error fetching ${resource} ${id}:`, error);
      throw error;
    }
  })
);

// Update resource
router.put('/crud/:resource/:id', 
  verifyToken,
  userRateLimit(100, 60 * 1000),
  catchAsync(async (req, res) => {
    const { resource, id } = req.params;
    const data = req.body;
    const userId = req.user.id;

    if (!data || Object.keys(data).length === 0) {
      throw new AppError('Data is required', 400);
    }

    // Add updated timestamp
    data.updated_at = new Date().toISOString();

    const supabase = getSupabaseAdmin();

    try {
      const { data: result, error } = await supabase
        .from(resource)
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new AppError(`${resource} not found`, 404);
        }
        throw new AppError(`Failed to update ${resource}: ${error.message}`, 400);
      }

      // Invalidate cache
      const cacheKey = `user:${userId}:${resource}`;
      await setCache(cacheKey, null, 0);

      logger.info(`Updated ${resource} ${id} for user ${userId}`);

      res.json({
        success: true,
        message: `${resource} updated successfully`,
        data: result
      });

    } catch (error) {
      logger.error(`Error updating ${resource} ${id}:`, error);
      throw error;
    }
  })
);

// Delete resource
router.delete('/crud/:resource/:id', 
  verifyToken,
  userRateLimit(50, 60 * 1000),
  catchAsync(async (req, res) => {
    const { resource, id } = req.params;
    const userId = req.user.id;

    const supabase = getSupabaseAdmin();

    try {
      const { error } = await supabase
        .from(resource)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw new AppError(`Failed to delete ${resource}: ${error.message}`, 400);
      }

      // Invalidate cache
      const cacheKey = `user:${userId}:${resource}`;
      await setCache(cacheKey, null, 0);

      logger.info(`Deleted ${resource} ${id} for user ${userId}`);

      res.json({
        success: true,
        message: `${resource} deleted successfully`
      });

    } catch (error) {
      logger.error(`Error deleting ${resource} ${id}:`, error);
      throw error;
    }
  })
);

// Search functionality
router.post('/search', 
  verifyToken,
  userRateLimit(50, 60 * 1000),
  catchAsync(async (req, res) => {
    const { query, resource, fields = [], filters = {}, limit = 20 } = req.body;
    const userId = req.user.id;

    if (!query || query.trim().length === 0) {
      throw new AppError('Search query is required', 400);
    }

    if (!resource) {
      throw new AppError('Resource type is required', 400);
    }

    const supabase = getSupabaseAdmin();
    let supabaseQuery = supabase
      .from(resource)
      .select('*')
      .eq('user_id', userId);

    // Apply text search if fields are specified
    if (fields.length > 0) {
      const searchConditions = fields.map(field => `${field}.ilike.%${query}%`).join(',');
      supabaseQuery = supabaseQuery.or(searchConditions);
    } else {
      // Default search in common text fields
      const defaultFields = ['name', 'title', 'description', 'content'];
      const searchConditions = defaultFields.map(field => `${field}.ilike.%${query}%`).join(',');
      supabaseQuery = supabaseQuery.or(searchConditions);
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        supabaseQuery = supabaseQuery.eq(key, value);
      }
    });

    // Apply limit
    supabaseQuery = supabaseQuery.limit(parseInt(limit));

    try {
      const { data, error } = await query;

      if (error) {
        throw new AppError(`Search failed: ${error.message}`, 400);
      }

      res.json({
        success: true,
        data: data || [],
        query,
        resource,
        count: data ? data.length : 0
      });

    } catch (error) {
      logger.error(`Search error for query "${query}":`, error);
      throw error;
    }
  })
);

// Bulk operations
router.post('/crud/:resource/bulk', 
  verifyToken,
  userRateLimit(20, 60 * 1000),
  catchAsync(async (req, res) => {
    const { resource } = req.params;
    const { operation, data, ids } = req.body;
    const userId = req.user.id;

    if (!operation || !['create', 'update', 'delete'].includes(operation)) {
      throw new AppError('Valid operation is required (create, update, delete)', 400);
    }

    const supabase = getSupabaseAdmin();

    try {
      let result;
      
      switch (operation) {
        case 'create':
          if (!data || !Array.isArray(data)) {
            throw new AppError('Data array is required for bulk create', 400);
          }
          
          const createData = data.map(item => ({
            ...item,
            user_id: userId,
            created_at: new Date().toISOString()
          }));
          
          const { data: createdData, error: createError } = await supabase
            .from(resource)
            .insert(createData)
            .select();
          
          if (createError) throw createError;
          result = createdData;
          break;

        case 'update':
          if (!ids || !Array.isArray(ids) || !data) {
            throw new AppError('IDs array and data are required for bulk update', 400);
          }
          
          const { data: updatedData, error: updateError } = await supabase
            .from(resource)
            .update({ ...data, updated_at: new Date().toISOString() })
            .in('id', ids)
            .eq('user_id', userId)
            .select();
          
          if (updateError) throw updateError;
          result = updatedData;
          break;

        case 'delete':
          if (!ids || !Array.isArray(ids)) {
            throw new AppError('IDs array is required for bulk delete', 400);
          }
          
          const { error: deleteError } = await supabase
            .from(resource)
            .delete()
            .in('id', ids)
            .eq('user_id', userId);
          
          if (deleteError) throw deleteError;
          result = { deleted: ids.length };
          break;
      }

      // Invalidate cache
      const cacheKey = `user:${userId}:${resource}`;
      await setCache(cacheKey, null, 0);

      logger.info(`Bulk ${operation} on ${resource} for user ${userId}`);

      res.json({
        success: true,
        message: `Bulk ${operation} completed successfully`,
        data: result
      });

    } catch (error) {
      logger.error(`Bulk ${operation} error on ${resource}:`, error);
      throw error;
    }
  })
);

// Get API statistics
router.get('/stats', 
  verifyToken,
  catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { getAppByUserId } = require('../config/supabase');

    try {
      const apps = await getAppByUserId(userId);
      
      const stats = {
        totalApps: apps.length,
        deployedApps: apps.filter(app => app.status === 'deployed').length,
        processingApps: apps.filter(app => app.status === 'processing').length,
        failedApps: apps.filter(app => app.status === 'failed').length,
        frameworks: apps.reduce((acc, app) => {
          acc[app.framework] = (acc[app.framework] || 0) + 1;
          return acc;
        }, {}),
        totalStorage: apps.reduce((acc, app) => acc + (app.file_size || 0), 0)
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error(`Error fetching stats for user ${userId}:`, error);
      throw error;
    }
  })
);

module.exports = router;
