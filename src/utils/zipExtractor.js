const yauzl = require('yauzl');
const { createReadStream } = require('fs');
const { createWriteStream, mkdirSync, existsSync } = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { uploadFile, downloadFile } = require('../config/supabase');
const logger = require('./logger');

/**
 * Extract ZIP file and save individual files to Supabase Storage
 * @param {string} appId - The app ID
 * @param {string} storagePath - The storage path in Supabase
 * @param {string} bucketName - The Supabase bucket name
 * @returns {Promise<Array>} Array of extracted file information
 */
const extractAndSaveFiles = async (appId, storagePath, bucketName = 'frontend-apps') => {
  try {
    logger.info(`Starting ZIP extraction for app ${appId}`);
    
    // Download the ZIP file from Supabase Storage
    const zipFilePath = `${storagePath}/app.zip`;
    logger.info(`Attempting to download ZIP file from: ${bucketName}/${zipFilePath}`);
    
    const zipBuffer = await downloadFile(bucketName, zipFilePath);
    
    if (!zipBuffer) {
      throw new Error('ZIP file not found in storage');
    }
    
    logger.info(`Successfully downloaded ZIP file, size: ${zipBuffer.length} bytes`);
    
    // Create temporary directory for extraction
    const tempDir = path.join(__dirname, '../../temp', appId);
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    
    const tempZipPath = path.join(tempDir, 'app.zip');
    require('fs').writeFileSync(tempZipPath, zipBuffer);
    
    // Extract files
    const extractedFiles = await new Promise((resolve, reject) => {
      const files = [];
      
      yauzl.open(tempZipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
          return;
        }
        
        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          // Skip directories
          if (/\/$/.test(entry.fileName)) {
            zipfile.readEntry();
            return;
          }
          
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              reject(err);
              return;
            }
            
            const fileInfo = {
              fileName: path.basename(entry.fileName),
              filePath: entry.fileName,
              fileSize: entry.uncompressedSize,
              fileType: getFileType(entry.fileName),
              mimeType: getMimeType(entry.fileName),
              parentDirectory: path.dirname(entry.fileName) || null,
              isDirectory: false
            };
            
            // Create file buffer
            const chunks = [];
            readStream.on('data', (chunk) => chunks.push(chunk));
            readStream.on('end', async () => {
              try {
                const fileBuffer = Buffer.concat(chunks);
                const contentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
                
                // Upload individual file to Supabase Storage
                const individualFilePath = `${storagePath}/extracted/${entry.fileName}`;
                await uploadFile(bucketName, individualFilePath, fileBuffer, {
                  contentType: fileInfo.mimeType,
                  upsert: true
                });
                
                // Add to files array
                files.push({
                  ...fileInfo,
                  storagePath: individualFilePath,
                  contentHash
                });
                
                logger.info(`Extracted and uploaded: ${entry.fileName}`);
                zipfile.readEntry();
              } catch (error) {
                reject(error);
              }
            });
            
            readStream.on('error', reject);
          });
        });
        
        zipfile.on('end', () => {
          resolve(files);
        });
        
        zipfile.on('error', reject);
      });
    });
    
    // Clean up temporary files
    require('fs-extra').removeSync(tempDir);
    
    logger.info(`Successfully extracted ${extractedFiles.length} files for app ${appId}`);
    return extractedFiles;
    
  } catch (error) {
    logger.error('Error extracting ZIP file:', error);
    throw error;
  }
};

/**
 * Get file type based on extension
 * @param {string} fileName - The file name
 * @returns {string} File type
 */
const getFileType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  
  const typeMap = {
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.js': 'js',
    '.jsx': 'js',
    '.ts': 'js',
    '.tsx': 'js',
    '.json': 'json',
    '.png': 'image',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.gif': 'image',
    '.svg': 'image',
    '.ico': 'image',
    '.woff': 'font',
    '.woff2': 'font',
    '.ttf': 'font',
    '.eot': 'font',
    '.md': 'text',
    '.txt': 'text',
    '.xml': 'text'
  };
  
  return typeMap[ext] || 'other';
};

/**
 * Get MIME type based on extension
 * @param {string} fileName - The file name
 * @returns {string} MIME type
 */
const getMimeType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  
  const mimeMap = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.jsx': 'application/javascript',
    '.ts': 'application/typescript',
    '.tsx': 'application/typescript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.xml': 'application/xml'
  };
  
  return mimeMap[ext] || 'application/octet-stream';
};

/**
 * Save extracted files to database
 * @param {string} appId - The app ID
 * @param {Array} files - Array of file information
 * @returns {Promise<Array>} Array of database records
 */
const saveFilesToDatabase = async (appId, files) => {
  try {
    const { getSupabaseAdmin } = require('../config/supabase');
    const supabase = getSupabaseAdmin();
    
    const fileRecords = files.map(file => ({
      app_id: appId,
      file_path: file.filePath,
      file_name: file.fileName,
      file_type: file.fileType,
      file_size: file.fileSize,
      storage_path: file.storagePath,
      mime_type: file.mimeType,
      content_hash: file.contentHash,
      is_directory: file.isDirectory,
      parent_directory: file.parentDirectory
    }));
    
    const { data, error } = await supabase
      .from('extracted_files')
      .insert(fileRecords)
      .select();
    
    if (error) {
      throw error;
    }
    
    logger.info(`Saved ${data.length} file records to database for app ${appId}`);
    return data;
    
  } catch (error) {
    logger.error('Error saving files to database:', error);
    throw error;
  }
};

module.exports = {
  extractAndSaveFiles,
  saveFilesToDatabase,
  getFileType,
  getMimeType
};
