const fs = require('fs-extra');
const path = require('path');
const yauzl = require('yauzl');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

class FileProcessor {
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    this.staticDir = path.join(process.cwd(), 'static');
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB default
  }

  // Ensure directories exist
  async ensureDirectories() {
    await fs.ensureDir(this.tempDir);
    await fs.ensureDir(this.staticDir);
  }

  // Validate uploaded file
  validateFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Only ZIP files are allowed');
    }

    return true;
  }

  // Extract ZIP file
  async extractZip(zipPath, extractPath) {
    return new Promise((resolve, reject) => {
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(new Error(`Failed to open ZIP file: ${err.message}`));
          return;
        }

        const extractedFiles = [];
        let entryCount = 0;
        let processedCount = 0;

        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          entryCount++;
          
          // Skip directories
          if (/\/$/.test(entry.fileName)) {
            zipfile.readEntry();
            return;
          }

          // Security check - prevent directory traversal
          if (entry.fileName.includes('..') || entry.fileName.startsWith('/')) {
            logger.warn(`Skipping potentially unsafe file: ${entry.fileName}`);
            zipfile.readEntry();
            return;
          }

          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              logger.error(`Error opening read stream for ${entry.fileName}:`, err);
              zipfile.readEntry();
              return;
            }

            const fullPath = path.join(extractPath, entry.fileName);
            const dir = path.dirname(fullPath);

            // Ensure directory exists
            fs.ensureDir(dir).then(() => {
              const writeStream = fs.createWriteStream(fullPath);
              
              readStream.pipe(writeStream);
              
              writeStream.on('close', () => {
                extractedFiles.push(entry.fileName);
                processedCount++;
                
                if (processedCount === entryCount) {
                  resolve(extractedFiles);
                }
              });
              
              writeStream.on('error', (err) => {
                logger.error(`Error writing file ${entry.fileName}:`, err);
                processedCount++;
                
                if (processedCount === entryCount) {
                  resolve(extractedFiles);
                }
              });
            }).catch((err) => {
              logger.error(`Error creating directory for ${entry.fileName}:`, err);
              processedCount++;
              
              if (processedCount === entryCount) {
                resolve(extractedFiles);
              }
            });
          });
        });

        zipfile.on('end', () => {
          if (entryCount === 0) {
            resolve([]);
          }
        });

        zipfile.on('error', (err) => {
          reject(new Error(`ZIP processing error: ${err.message}`));
        });
      });
    });
  }

  // Detect framework type
  detectFramework(extractPath) {
    const packageJsonPath = path.join(extractPath, 'package.json');
    const indexHtmlPath = path.join(extractPath, 'index.html');
    const srcPath = path.join(extractPath, 'src');

    try {
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = fs.readJsonSync(packageJsonPath);
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (dependencies.react || dependencies['react-dom']) {
          return {
            framework: 'react',
            buildCommand: 'npm run build',
            startCommand: 'npm start',
            hasPackageJson: true
          };
        }

        if (dependencies.vue || dependencies['@vue/cli-service']) {
          return {
            framework: 'vue',
            buildCommand: 'npm run build',
            startCommand: 'npm run serve',
            hasPackageJson: true
          };
        }

        if (dependencies['@angular/core'] || dependencies['@angular/cli']) {
          return {
            framework: 'angular',
            buildCommand: 'ng build --prod',
            startCommand: 'ng serve',
            hasPackageJson: true
          };
        }

        if (dependencies.next) {
          return {
            framework: 'next',
            buildCommand: 'npm run build',
            startCommand: 'npm start',
            hasPackageJson: true
          };
        }
      }

      // Check for vanilla HTML/CSS/JS
      if (fs.existsSync(indexHtmlPath)) {
        return {
          framework: 'vanilla',
          buildCommand: null,
          startCommand: null,
          hasPackageJson: false
        };
      }

      return {
        framework: 'unknown',
        buildCommand: null,
        startCommand: null,
        hasPackageJson: false
      };
    } catch (error) {
      logger.error('Error detecting framework:', error);
      return {
        framework: 'unknown',
        buildCommand: null,
        startCommand: null,
        hasPackageJson: false
      };
    }
  }

  // Find entry point file
  findEntryPoint(extractPath, framework) {
    const possibleEntryPoints = [
      'index.html',
      'public/index.html',
      'src/index.html',
      'dist/index.html',
      'build/index.html'
    ];

    for (const entryPoint of possibleEntryPoints) {
      const fullPath = path.join(extractPath, entryPoint);
      if (fs.existsSync(fullPath)) {
        return entryPoint;
      }
    }

    // If no index.html found, look for other HTML files
    const htmlFiles = this.findFilesByExtension(extractPath, '.html');
    if (htmlFiles.length > 0) {
      return htmlFiles[0];
    }

    return null;
  }

  // Find files by extension
  findFilesByExtension(dir, extension) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.findFilesByExtension(fullPath, extension));
        } else if (item.endsWith(extension)) {
          files.push(path.relative(dir, fullPath));
        }
      }
    } catch (error) {
      logger.error(`Error reading directory ${dir}:`, error);
    }
    
    return files;
  }

  // Process uploaded file
  async processFile(file, userId) {
    await this.ensureDirectories();
    
    // Validate file
    this.validateFile(file);

    // Generate unique app ID
    const appId = uuidv4();
    const tempZipPath = path.join(this.tempDir, `${appId}.zip`);
    const extractPath = path.join(this.staticDir, appId);

    try {
      // Save uploaded file temporarily
      await fs.writeFile(tempZipPath, file.buffer);

      // Extract ZIP file
      const extractedFiles = await this.extractZip(tempZipPath, extractPath);

      if (extractedFiles.length === 0) {
        throw new Error('ZIP file appears to be empty or invalid');
      }

      // Detect framework
      const frameworkInfo = this.detectFramework(extractPath);

      // Find entry point
      const entryPoint = this.findEntryPoint(extractPath, frameworkInfo.framework);

      if (!entryPoint) {
        throw new Error('No valid entry point found in the uploaded files');
      }

      // Clean up temp ZIP file
      await fs.remove(tempZipPath);

      return {
        appId,
        extractPath,
        extractedFiles,
        frameworkInfo,
        entryPoint,
        fileSize: file.size,
        originalName: file.originalname
      };

    } catch (error) {
      // Clean up on error
      await fs.remove(tempZipPath);
      await fs.remove(extractPath);
      throw error;
    }
  }

  // Clean up old files
  async cleanup(appId) {
    try {
      const extractPath = path.join(this.staticDir, appId);
      await fs.remove(extractPath);
      logger.info(`Cleaned up files for app ${appId}`);
    } catch (error) {
      logger.error(`Error cleaning up files for app ${appId}:`, error);
    }
  }

  // Get file stats
  async getFileStats(extractPath) {
    try {
      const stats = await fs.stat(extractPath);
      return {
        size: stats.size,
        isDirectory: stats.isDirectory(),
        modified: stats.mtime
      };
    } catch (error) {
      logger.error('Error getting file stats:', error);
      return null;
    }
  }
}

module.exports = new FileProcessor();
