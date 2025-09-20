const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { getAppByAppId, updateAppRecord } = require('../config/supabase');
const logger = require('../utils/logger');

const router = express.Router();

// Serve static files for deployed frontend apps
router.get('/:appId/*', 
  catchAsync(async (req, res) => {
    const { appId } = req.params;
    const filePath = req.params[0] || 'index.html';
    
    // Get app information
    const app = await getAppByAppId(appId);
    if (!app) {
      throw new AppError('App not found', 404);
    }

    if (app.status !== 'deployed') {
      throw new AppError('App is not deployed', 404);
    }

    // Update last accessed timestamp
    try {
      await updateAppRecord(appId, {
        last_accessed_at: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error updating last accessed time for app ${appId}:`, error);
    }

    // Construct full file path
    const staticDir = path.join(process.cwd(), 'static', appId);
    const fullPath = path.join(staticDir, filePath);

    // Security check - prevent directory traversal
    if (!fullPath.startsWith(staticDir)) {
      throw new AppError('Invalid file path', 400);
    }

    try {
      // Check if file exists
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        // If it's a directory, try to serve index.html
        const indexPath = path.join(fullPath, 'index.html');
        if (await fs.pathExists(indexPath)) {
          return serveFile(res, indexPath);
        } else {
          throw new AppError('Directory listing not allowed', 403);
        }
      }

      // Serve the file
      return serveFile(res, fullPath);

    } catch (error) {
      if (error.code === 'ENOENT') {
        // File not found, try to serve index.html for SPA routing
        const indexPath = path.join(staticDir, 'index.html');
        if (await fs.pathExists(indexPath)) {
          return serveFile(res, indexPath);
        }
        throw new AppError('File not found', 404);
      }
      throw error;
    }
  })
);

// Serve app root (redirect to index.html)
router.get('/:appId', 
  catchAsync(async (req, res) => {
    const { appId } = req.params;
    
    // Get app information
    const app = await getAppByAppId(appId);
    if (!app) {
      throw new AppError('App not found', 404);
    }

    if (app.status !== 'deployed') {
      throw new AppError('App is not deployed', 404);
    }

    // Update last accessed timestamp
    try {
      await updateAppRecord(appId, {
        last_accessed_at: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error updating last accessed time for app ${appId}:`, error);
    }

    // Redirect to index.html
    res.redirect(`/static/${appId}/index.html`);
  })
);

// Helper function to serve files with proper headers
function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = mime.lookup(ext) || 'application/octet-stream';
  
  // Set appropriate headers
  res.set({
    'Content-Type': contentType,
    'Cache-Control': getCacheControl(ext),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN'
  });

  // For HTML files, add security headers
  if (contentType.includes('text/html')) {
    res.set({
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
  }

  // Stream the file
  const stream = fs.createReadStream(filePath);
  
  stream.on('error', (error) => {
    logger.error(`Error streaming file ${filePath}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error serving file' });
    }
  });

  stream.pipe(res);
}

// Get cache control headers based on file type
function getCacheControl(ext) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  const mediaExtensions = ['.mp4', '.mp3', '.webm', '.ogg'];
  
  if (staticExtensions.includes(ext)) {
    return 'public, max-age=31536000, immutable'; // 1 year for static assets
  } else if (mediaExtensions.includes(ext)) {
    return 'public, max-age=86400'; // 1 day for media files
  } else {
    return 'public, max-age=0, must-revalidate'; // No cache for HTML and other files
  }
}

// Health check for static serving
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'static-file-server',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
