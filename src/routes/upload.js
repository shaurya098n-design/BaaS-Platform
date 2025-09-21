const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { verifyToken, userRateLimit } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const fileProcessor = require('../utils/fileProcessor');
const frontendInjector = require('../utils/frontendInjector');
const FrontendAnalyzer = require('../utils/frontendAnalyzer');
const { 
  createAppRecord, 
  updateAppRecord, 
  uploadFile, 
  getPublicUrl,
  getSupabaseAdmin 
} = require('../config/supabase');
const { cacheAppData, invalidateUserCache } = require('../config/redis');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const fileSizeLimit = 200 * 1024 * 1024; // 200MB hardcoded limit
console.log('Multer file size limit set to:', fileSizeLimit, 'bytes (', fileSizeLimit / (1024 * 1024), 'MB)');

const upload = multer({
  storage,
  limits: {
    fileSize: fileSizeLimit,
    fieldSize: 10 * 1024 * 1024, // 10MB for form fields
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter - mimetype:', file.mimetype);
    console.log('File filter - originalname:', file.originalname);
    
    // Check file extension first (more reliable)
    const fileName = file.originalname.toLowerCase();
    const hasZipExtension = fileName.endsWith('.zip');
    
    // Check MIME type (comprehensive list)
    const allowedMimeTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream', // Some browsers report ZIP as this
      'application/x-zip',
      'application/zip-compressed'
    ];
    
    const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
    
    // Accept if either extension or MIME type is valid
    if (hasZipExtension || hasValidMimeType) {
      console.log('File type allowed - Extension:', hasZipExtension, 'MIME:', hasValidMimeType);
      cb(null, true);
    } else {
      console.log('File type not allowed - Extension:', hasZipExtension, 'MIME:', hasValidMimeType);
      cb(new Error('Only ZIP files are allowed. Please upload a .zip file.'), false);
    }
  }
});

// Simple upload route for the frontend interface
router.post('/', 
  // verifyToken, // Temporarily disabled for testing
  // userRateLimit(5, 15 * 60 * 1000), // 5 uploads per 15 minutes
  (req, res, next) => {
    // Simple multer handling without complex error checking
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.log('=== MULTER ERROR ===');
        console.log('Error code:', err.code);
        console.log('Error message:', err.message);
        console.log('Error field:', err.field);
        console.log('Full error:', err);
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message
        });
      }
      console.log('Multer success - file processed');
      next();
    });
  },
  catchAsync(async (req, res) => {
    console.log('=== UPLOAD ROUTE HIT ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? 'File exists' : 'No file');
    console.log('App name from body:', req.body.appName);
    console.log('Frontend type from body:', req.body.frontendType);
    
    // Get user ID from auth header
    let userId = null;
    
    // Try to get real user ID from auth header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('Auth token found, attempting to get user ID...');
      
      try {
        const { getSupabaseAdmin } = require('../config/supabase');
        const supabaseAdmin = getSupabaseAdmin();
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        
        if (user && !error) {
          userId = user.id;
          console.log('Real user ID found:', userId);
        } else {
          console.log('Could not get user from token, using test user:', error?.message);
        }
      } catch (authError) {
        console.log('Auth error, using test user:', authError.message);
      }
    } else {
      console.log('No auth header found, using test user');
    }
    
    console.log('Using user ID:', userId);
    const { appName, name, description, frontendType, framework } = req.body;
    
    // Use appName if provided, otherwise fall back to name for backward compatibility
    const finalAppName = appName || name;
    const finalFramework = frontendType || framework;

    if (!req.file) {
      console.log('ERROR: No file uploaded');
      throw new AppError('No file uploaded', 400);
    }

    if (!finalAppName || finalAppName.trim().length === 0) {
      console.log('ERROR: App name is required');
      throw new AppError('App name is required', 400);
    }

    console.log(`Starting simple upload for user ${userId}, app: ${finalAppName}`);
    console.log(`File details: ${req.file.originalname}, Size: ${req.file.size} bytes, Type: ${req.file.mimetype}`);

    try {
      // Generate a unique app ID
      const appId = uuidv4();
      
      logger.info(`=== UPLOAD START ===`);
      logger.info(`User ID: ${userId}`);
      logger.info(`App Name: ${finalAppName}`);
      logger.info(`Framework: ${finalFramework}`);
      logger.info(`File: ${req.file.originalname}, Size: ${req.file.size} bytes, Type: ${req.file.mimetype}`);
      logger.info(`Generated App ID: ${appId}`);

      // Create app record in database
      const { createAppRecord } = require('../config/supabase');
      const appData = {
        id: appId,
        user_id: userId,
        app_name: finalAppName.trim(),
        app_url: `http://localhost:3000/static/${appId}`,
        api_base_url: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api`,
        storage_path: `apps/${userId}/${appId}`,
        original_filename: req.file.originalname,
        file_size: req.file.size,
        status: 'deployed',
        framework: finalFramework || 'html',
        deployed_at: new Date().toISOString()
      };
      
      logger.info(`Creating app record in database...`);
      const appRecord = await createAppRecord(appData);
      logger.info(`App record created successfully: ${appRecord.id}`);

      // Upload the ZIP file to Supabase Storage
      logger.info(`Uploading ZIP file to storage...`);
      const { uploadFile } = require('../config/supabase');
      const zipBuffer = req.file.buffer;
      
      await uploadFile(
        process.env.STORAGE_BUCKET || 'frontend-apps',
        `${appData.storage_path}/app.zip`,
        zipBuffer,
        {
          contentType: 'application/zip',
          upsert: true
        }
      );
      logger.info(`ZIP file uploaded to storage successfully`);

      // Extract files to local static directory for analysis
      logger.info(`Extracting files to local directory for analysis...`);
      const fs = require('fs-extra');
      const path = require('path');
      const yauzl = require('yauzl');
      
      const staticDir = path.join(process.cwd(), 'static');
      const projectDir = path.join(staticDir, appId);
      
      // Create project directory
      await fs.ensureDir(projectDir);
      
      // Extract ZIP file
      await new Promise((resolve, reject) => {
        yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipfile) => {
          if (err) return reject(err);
          
          zipfile.readEntry();
          zipfile.on('entry', (entry) => {
            if (/\/$/.test(entry.fileName)) {
              // Directory entry
              zipfile.readEntry();
            } else {
              // File entry
              zipfile.openReadStream(entry, (err, readStream) => {
                if (err) return reject(err);
                
                const filePath = path.join(projectDir, entry.fileName);
                const dirPath = path.dirname(filePath);
                
                fs.ensureDir(dirPath).then(() => {
                  const writeStream = fs.createWriteStream(filePath);
                  readStream.pipe(writeStream);
                  
                  writeStream.on('close', () => {
                    zipfile.readEntry();
                  });
                  
                  writeStream.on('error', reject);
                }).catch(reject);
              });
            }
          });
          
          zipfile.on('end', resolve);
          zipfile.on('error', reject);
        });
      });
      
      logger.info(`Files extracted successfully to ${projectDir}`);

      // Success response with real data
      const responseData = {
        success: true,
        message: 'App uploaded and saved successfully!',
        data: {
          id: appRecord.id,
          appId: appId,
          appName: finalAppName.trim(),
          appUrl: `http://localhost:3000/static/${appId}`,
          apiBaseUrl: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api`,
          framework: finalFramework || 'html',
          status: 'deployed',
          deployedAt: new Date().toISOString(),
          fileInfo: {
            originalName: req.file.originalname,
            size: req.file.size
          }
        }
      };
      
      logger.info(`=== UPLOAD SUCCESS ===`);
      logger.info(`Response: ${JSON.stringify(responseData, null, 2)}`);
      
      res.status(201).json(responseData);

    } catch (error) {
      logger.error(`Upload failed for user ${userId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Upload failed: ' + error.message
      });
    }
  })
);

// Upload and deploy frontend application
router.post('/deploy', 
  verifyToken, 
  userRateLimit(5, 15 * 60 * 1000), // 5 uploads per 15 minutes
  upload.single('frontend'),
  catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { appName, customDomain } = req.body;

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    if (!appName || appName.trim().length === 0) {
      throw new AppError('App name is required', 400);
    }

    // Check if user can deploy more apps
    const { data: canDeploy } = await getSupabaseAdmin()
      .rpc('can_deploy_app', { user_uuid: userId });

    if (!canDeploy) {
      throw new AppError('You have reached the maximum number of apps. Please delete some apps or upgrade your plan.', 403);
    }

    logger.info(`Starting deployment for user ${userId}, app: ${appName}`);

    try {
      // Process the uploaded file
      const processResult = await fileProcessor.processFile(req.file, userId);
      const { appId, extractPath, frameworkInfo, entryPoint, fileSize, originalName } = processResult;

      // Generate app URL
      const appUrl = customDomain || `${process.env.API_BASE_URL}/app/${appId}`;
      const apiBaseUrl = `${process.env.API_BASE_URL}/api`;

      // Inject API configuration into frontend
      await frontendInjector.injectAll(extractPath, apiBaseUrl, appId);

      // Upload processed files to Supabase Storage
      const storagePath = `apps/${userId}/${appId}`;
      const zipBuffer = await require('fs-extra').readFile(extractPath);
      
      await uploadFile(
        process.env.STORAGE_BUCKET || 'frontend-apps',
        `${storagePath}/app.zip`,
        zipBuffer,
        {
          contentType: 'application/zip',
          upsert: true
        }
      );

      // Create app record in database
      const appData = {
        user_id: userId,
        app_name: appName.trim(),
        app_url: appUrl,
        api_base_url: apiBaseUrl,
        storage_path: storagePath,
        original_filename: originalName,
        file_size: fileSize,
        status: 'deployed',
        framework: frameworkInfo.framework,
        build_command: frameworkInfo.buildCommand,
        start_command: frameworkInfo.startCommand,
        custom_domain: customDomain || null,
        deployed_at: new Date().toISOString()
      };

      const appRecord = await createAppRecord(appData);

      // Cache app data
      await cacheAppData(appId, appRecord);

      // Invalidate user cache
      await invalidateUserCache(userId);

      logger.info(`Successfully deployed app ${appId} for user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'App deployed successfully',
        data: {
          appId: appRecord.id,
          appName: appRecord.app_name,
          appUrl: appRecord.app_url,
          apiBaseUrl: appRecord.api_base_url,
          framework: appRecord.framework,
          status: appRecord.status,
          deployedAt: appRecord.deployed_at
        }
      });

    } catch (error) {
      logger.error(`Deployment failed for user ${userId}:`, error);
      
      // Clean up on error
      if (processResult && processResult.appId) {
        await fileProcessor.cleanup(processResult.appId);
      }

      throw error;
    }
  })
);

// Get user's deployed apps
router.get('/apps', 
  verifyToken,
  catchAsync(async (req, res) => {
    const userId = req.user.id;
    
    try {
      const { getCachedUserApps, cacheUserApps } = require('../config/redis');
      const { getAppByUserId } = require('../config/supabase');

      // Try to get from cache first
      let apps = await getCachedUserApps(userId);
      
      if (!apps) {
        // Get from database
        apps = await getAppByUserId(userId);
        
        // Cache the result
        await cacheUserApps(userId, apps);
      }

      res.json({
        success: true,
        data: apps.map(app => ({
          id: app.id,
          appName: app.app_name,
          appUrl: app.app_url,
          apiBaseUrl: app.api_base_url,
          framework: app.framework,
          status: app.status,
          original_filename: app.original_filename,
          file_size: app.file_size,
          createdAt: app.created_at,
          deployedAt: app.deployed_at,
          lastAccessedAt: app.last_accessed_at
        }))
      });
    } catch (error) {
      logger.error('Error fetching user apps:', error);
      // Return empty array if database is not set up yet
      res.json({
        success: true,
        data: []
      });
    }
  })
);

// Delete app by ID
router.delete('/:appId', 
  // verifyToken, // Temporarily disabled for testing
  catchAsync(async (req, res) => {
    try {
      const { appId } = req.params;
      console.log('=== DELETE APP REQUEST ===');
      console.log('App ID to delete:', appId);
      
      // Get user ID from auth header
      let userId = null;
      
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const { createClient } = require('@supabase/supabase-js');
          const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            userId = user.id;
          }
        } catch (error) {
          console.error('Error getting user from token:', error);
        }
      }
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { getAppByAppId, deleteAppRecord } = require('../config/supabase');
      const { deleteFile } = require('../config/supabase');
      
      // Get app details first
      const app = await getAppByAppId(appId);
      if (!app) {
        return res.status(404).json({
          success: false,
          message: 'App not found'
        });
      }
      
      // Check if user owns this app
      if (app.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own apps'
        });
      }
      
      console.log('App found:', app.app_name);
      console.log('Storage path:', app.storage_path);
      
      // Delete from Supabase Storage
      try {
        await deleteFile(app.storage_path);
        console.log('Files deleted from storage');
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError.message);
        // Continue with database deletion even if storage fails
      }
      
      // Delete from database
      await deleteAppRecord(appId);
      console.log('App record deleted from database');
      
      res.json({
        success: true,
        message: 'App deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting app:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to delete app: ' + error.message
      });
    }
  })
);

// Get specific app details
router.get('/apps/:appId', 
  verifyToken,
  catchAsync(async (req, res) => {
    const { appId } = req.params;
    const userId = req.user.id;
    const { getCachedAppData, cacheAppData } = require('../config/redis');
    const { getAppByAppId } = require('../config/supabase');

    // Try to get from cache first
    let app = await getCachedAppData(appId);
    
    if (!app) {
      // Get from database
      app = await getAppByAppId(appId);
      
      if (!app) {
        throw new AppError('App not found', 404);
      }

      // Verify ownership
      if (app.user_id !== userId) {
        throw new AppError('Access denied', 403);
      }

      // Cache the result
      await cacheAppData(appId, app);
    }

    res.json({
      success: true,
      data: {
        id: app.id,
        appName: app.app_name,
        appUrl: app.app_url,
        apiBaseUrl: app.api_base_url,
        framework: app.framework,
        buildCommand: app.build_command,
        startCommand: app.start_command,
        status: app.status,
        customDomain: app.custom_domain,
        sslEnabled: app.ssl_enabled,
        environmentVariables: app.environment_variables,
        createdAt: app.created_at,
        deployedAt: app.deployed_at,
        lastAccessedAt: app.last_accessed_at
      }
    });
  })
);

// Update app settings
router.put('/apps/:appId', 
  verifyToken,
  catchAsync(async (req, res) => {
    const { appId } = req.params;
    const userId = req.user.id;
    const { appName, customDomain, environmentVariables } = req.body;
    const { getAppByAppId, updateAppRecord, invalidateAppCache } = require('../config/supabase');

    // Get app and verify ownership
    const app = await getAppByAppId(appId);
    if (!app) {
      throw new AppError('App not found', 404);
    }

    if (app.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Prepare updates
    const updates = {};
    if (appName) updates.app_name = appName.trim();
    if (customDomain !== undefined) updates.custom_domain = customDomain;
    if (environmentVariables) updates.environment_variables = environmentVariables;

    if (Object.keys(updates).length === 0) {
      throw new AppError('No valid updates provided', 400);
    }

    // Update app record
    const updatedApp = await updateAppRecord(appId, updates);

    // Invalidate cache
    await invalidateAppCache(appId);

    res.json({
      success: true,
      message: 'App updated successfully',
      data: {
        id: updatedApp.id,
        appName: updatedApp.app_name,
        customDomain: updatedApp.custom_domain,
        environmentVariables: updatedApp.environment_variables
      }
    });
  })
);

// Delete app
router.delete('/apps/:appId', 
  verifyToken,
  catchAsync(async (req, res) => {
    const { appId } = req.params;
    const userId = req.user.id;
    const { getAppByAppId, deleteAppRecord, deleteFile } = require('../config/supabase');
    const { invalidateAppCache, invalidateUserCache } = require('../config/redis');

    // Get app and verify ownership
    const app = await getAppByAppId(appId);
    if (!app) {
      throw new AppError('App not found', 404);
    }

    if (app.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Delete files from storage
    try {
      await deleteFile(
        process.env.STORAGE_BUCKET || 'frontend-apps',
        `${app.storage_path}/app.zip`
      );
    } catch (error) {
      logger.error(`Error deleting storage files for app ${appId}:`, error);
    }

    // Clean up local files
    await fileProcessor.cleanup(appId);

    // Delete app record
    await deleteAppRecord(appId);

    // Invalidate caches
    await invalidateAppCache(appId);
    await invalidateUserCache(userId);

    logger.info(`App ${appId} deleted by user ${userId}`);

    res.json({
      success: true,
      message: 'App deleted successfully'
    });
  })
);

// Redeploy app (re-upload and process)
router.post('/apps/:appId/redeploy', 
  verifyToken,
  userRateLimit(3, 15 * 60 * 1000), // 3 redeploys per 15 minutes
  upload.single('frontend'),
  catchAsync(async (req, res) => {
    const { appId } = req.params;
    const userId = req.user.id;
    const { getAppByAppId, updateAppRecord } = require('../config/supabase');

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Get app and verify ownership
    const app = await getAppByAppId(appId);
    if (!app) {
      throw new AppError('App not found', 404);
    }

    if (app.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    logger.info(`Starting redeployment for app ${appId}`);

    try {
      // Process the new file
      const processResult = await fileProcessor.processFile(req.file, userId);
      const { extractPath, frameworkInfo, entryPoint, fileSize, originalName } = processResult;

      // Inject API configuration
      await frontendInjector.injectAll(extractPath, app.api_base_url, appId);

      // Update storage
      const zipBuffer = await require('fs-extra').readFile(extractPath);
      await uploadFile(
        process.env.STORAGE_BUCKET || 'frontend-apps',
        `${app.storage_path}/app.zip`,
        zipBuffer,
        {
          contentType: 'application/zip',
          upsert: true
        }
      );

      // Update app record
      const updates = {
        original_filename: originalName,
        file_size: fileSize,
        framework: frameworkInfo.framework,
        build_command: frameworkInfo.buildCommand,
        start_command: frameworkInfo.startCommand,
        deployed_at: new Date().toISOString(),
        status: 'deployed'
      };

      const updatedApp = await updateAppRecord(appId, updates);

      // Invalidate cache
      const { invalidateAppCache } = require('../config/redis');
      await invalidateAppCache(appId);

      logger.info(`Successfully redeployed app ${appId}`);

      res.json({
        success: true,
        message: 'App redeployed successfully',
        data: {
          appId: updatedApp.id,
          appName: updatedApp.app_name,
          appUrl: updatedApp.app_url,
          framework: updatedApp.framework,
          status: updatedApp.status,
          deployedAt: updatedApp.deployed_at
        }
      });

    } catch (error) {
      logger.error(`Redeployment failed for app ${appId}:`, error);
      
      // Clean up on error
      if (processResult && processResult.appId) {
        await fileProcessor.cleanup(processResult.appId);
      }

      throw error;
    }
  })
);

// Save extracted files to database (replace ZIP with individual files)
router.post('/:appId/save-extracted', 
  catchAsync(async (req, res) => {
    try {
      const { appId } = req.params;
      console.log('=== SAVE EXTRACTED FILES REQUEST ===');
      console.log('App ID:', appId);
      
      // Get user ID from auth header
      let userId = null;
      
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const { createClient } = require('@supabase/supabase-js');
          const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            userId = user.id;
          }
        } catch (error) {
          console.error('Error getting user from token:', error);
        }
      }
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { getAppByAppId, updateAppRecord } = require('../config/supabase');
      
      // Get app and verify ownership
      const app = await getAppByAppId(appId);
      if (!app) {
        return res.status(404).json({
          success: false,
          message: 'App not found'
        });
      }
      
      if (app.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only modify your own apps'
        });
      }
      
      console.log('App found:', app.app_name);
      
      // Extract ZIP file and save individual files
      const { extractAndSaveFiles, saveFilesToDatabase } = require('../utils/zipExtractor');
      
      console.log('Starting ZIP file extraction...');
      
      let extractedFiles;
      try {
        extractedFiles = await extractAndSaveFiles(appId, app.storage_path);
        console.log(`Extracted ${extractedFiles.length} files`);
      } catch (extractionError) {
        if (extractionError.message.includes('File not found in storage')) {
          return res.status(400).json({
            success: false,
            message: 'ZIP file not found in storage. This app was uploaded before the storage feature was implemented. Please upload a new ZIP file to use the extraction feature.',
            error: 'ZIP_FILE_NOT_IN_STORAGE'
          });
        }
        throw extractionError;
      }
      
      console.log('Saving file records to database...');
      const fileRecords = await saveFilesToDatabase(appId, extractedFiles);
      console.log(`Saved ${fileRecords.length} file records to database`);
      
      // Update the app record to mark it as extracted
      const updates = {
        status: 'deployed', // Use 'deployed' status (allowed by constraint)
        original_filename: 'extracted_files', // Mark as extracted instead of null
        file_size: 0, // Reset file size
        updated_at: new Date().toISOString()
      };
      
      const updatedApp = await updateAppRecord(appId, updates);
      console.log('App updated successfully');
      
      res.json({
        success: true,
        message: 'Files saved to database successfully',
        data: {
          appId: updatedApp.id,
          appName: updatedApp.app_name,
          status: updatedApp.status,
          updatedAt: updatedApp.updated_at
        }
      });
      
    } catch (error) {
      console.error('Error saving extracted files:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to save files to database: ' + error.message
      });
    }
  })
);

// Get extracted files for an app
router.get('/:appId/files', 
  catchAsync(async (req, res) => {
    try {
      const { appId } = req.params;
      console.log('=== GET EXTRACTED FILES REQUEST ===');
      console.log('App ID:', appId);
      
      // Get user ID from auth header
      let userId = null;
      
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const { createClient } = require('@supabase/supabase-js');
          const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            userId = user.id;
          }
        } catch (error) {
          console.error('Error getting user from token:', error);
        }
      }
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { getAppByAppId } = require('../config/supabase');
      
      // Get app and verify ownership
      const app = await getAppByAppId(appId);
      if (!app) {
        return res.status(404).json({
          success: false,
          message: 'App not found'
        });
      }
      
      if (app.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view files for your own apps'
        });
      }
      
      // Get extracted files from database
      const { getSupabaseAdmin } = require('../config/supabase');
      const supabase = getSupabaseAdmin();
      
      const { data: files, error } = await supabase
        .from('extracted_files')
        .select('*')
        .eq('app_id', appId)
        .order('file_path');
      
      if (error) {
        throw error;
      }
      
      res.json({
        success: true,
        data: {
          appId: app.id,
          appName: app.app_name,
          totalFiles: files.length,
          files: files.map(file => ({
            id: file.id,
            fileName: file.file_name,
            filePath: file.file_path,
            fileType: file.file_type,
            fileSize: file.file_size,
            mimeType: file.mime_type,
            parentDirectory: file.parent_directory,
            isDirectory: file.is_directory,
            createdAt: file.created_at
          }))
        }
      });
      
    } catch (error) {
      console.error('Error fetching extracted files:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch extracted files: ' + error.message
      });
    }
  })
);

// Analyze project endpoint
router.get('/analyze/:appId', verifyToken, catchAsync(async (req, res) => {
  const { appId } = req.params;
  const userId = req.user.id;

  try {
    logger.info(`Starting analysis for project ${appId} by user ${userId}`);

    // Get project info from database
    const supabase = getSupabaseAdmin();
    const { data: project, error: projectError } = await supabase
      .from('deployed_apps')
      .select('*')
      .eq('id', appId)
      .eq('user_id', userId)
      .single();

    if (projectError) {
      logger.error(`Database error for project ${appId}:`, projectError);
      return res.status(500).json({
        success: false,
        message: 'Database error: ' + projectError.message
      });
    }

    if (!project) {
      logger.warn(`Project ${appId} not found for user ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project files exist
    const projectPath = path.join(process.cwd(), 'static', appId);
    logger.info(`Checking project path: ${projectPath}`);
    
    if (!fs.existsSync(projectPath)) {
      logger.warn(`Project files not found at path: ${projectPath}`);
      
      // Try to find the project by checking if the directory exists with a different name
      const staticDir = path.join(process.cwd(), 'static');
      const directories = fs.readdirSync(staticDir).filter(item => {
        const fullPath = path.join(staticDir, item);
        return fs.statSync(fullPath).isDirectory();
      });
      
      logger.info(`Available project directories: ${directories.join(', ')}`);
      
      return res.status(404).json({
        success: false,
        message: `Project files not found. Available projects: ${directories.join(', ')}`
      });
    }

    // Initialize analyzer and analyze project
    const analyzer = new FrontendAnalyzer();
    const analysis = await analyzer.analyzeProject(projectPath);

    logger.info(`Analysis complete for project ${appId}:`, {
      framework: analysis.framework.name,
      files: analysis.files.length,
      pages: analysis.pages.length,
      components: analysis.components.length,
      apis: analysis.apis.length
    });

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error(`Error analyzing project ${appId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Analysis failed: ' + error.message
    });
  }
}));

module.exports = router;
