const { createClient } = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const initializeRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      logger.warn('Redis URL not provided. Caching will be disabled.');
      return;
    }

    redisClient = createClient({
      url: redisUrl,
      password: process.env.REDIS_TOKEN,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to initialize Redis client:', error);
    // Don't throw error - app should work without Redis
  }
};

const getRedisClient = () => {
  return redisClient;
};

// Cache operations
const setCache = async (key, value, ttl = 3600) => {
  if (!redisClient) return false;
  
  try {
    const serializedValue = JSON.stringify(value);
    await redisClient.setEx(key, ttl, serializedValue);
    return true;
  } catch (error) {
    logger.error('Error setting cache:', error);
    return false;
  }
};

const getCache = async (key) => {
  if (!redisClient) return null;
  
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Error getting cache:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  if (!redisClient) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Error deleting cache:', error);
    return false;
  }
};

const deleteCachePattern = async (pattern) => {
  if (!redisClient) return false;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    logger.error('Error deleting cache pattern:', error);
    return false;
  }
};

// Specific cache operations for the app
const cacheAppData = async (appId, appData, ttl = 3600) => {
  return await setCache(`app:${appId}`, appData, ttl);
};

const getCachedAppData = async (appId) => {
  return await getCache(`app:${appId}`);
};

const cacheUserApps = async (userId, apps, ttl = 1800) => {
  return await setCache(`user:${userId}:apps`, apps, ttl);
};

const getCachedUserApps = async (userId) => {
  return await getCache(`user:${userId}:apps`);
};

const invalidateAppCache = async (appId) => {
  await deleteCache(`app:${appId}`);
};

const invalidateUserCache = async (userId) => {
  await deleteCachePattern(`user:${userId}:*`);
};

// Rate limiting helpers
const checkRateLimit = async (key, limit, window) => {
  if (!redisClient) return { allowed: true, remaining: limit };
  
  try {
    const current = await redisClient.incr(key);
    if (current === 1) {
      await redisClient.expire(key, window);
    }
    
    const remaining = Math.max(0, limit - current);
    return {
      allowed: current <= limit,
      remaining,
      resetTime: Date.now() + (window * 1000)
    };
  } catch (error) {
    logger.error('Error checking rate limit:', error);
    return { allowed: true, remaining: limit };
  }
};

const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  cacheAppData,
  getCachedAppData,
  cacheUserApps,
  getCachedUserApps,
  invalidateAppCache,
  invalidateUserCache,
  checkRateLimit,
  closeRedisConnection
};
