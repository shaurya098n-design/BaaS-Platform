const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');

class FrontendInjector {
  constructor() {
    this.apiConfigTag = '<meta name="apiBaseUrl" content="{API_BASE_URL}">';
    this.apiConfigScript = `
<script>
  window.API_CONFIG = {
    baseUrl: '{API_BASE_URL}',
    endpoints: {
      auth: '{API_BASE_URL}/auth',
      crud: '{API_BASE_URL}/crud',
      search: '{API_BASE_URL}/search',
      upload: '{API_BASE_URL}/upload'
    }
  };
</script>`;
  }

  // Inject API configuration into HTML files
  async injectApiConfig(extractPath, apiBaseUrl, entryPoint = 'index.html') {
    try {
      const htmlFiles = this.findHtmlFiles(extractPath);
      const injectedFiles = [];

      for (const htmlFile of htmlFiles) {
        const fullPath = path.join(extractPath, htmlFile);
        const content = await fs.readFile(fullPath, 'utf8');
        
        const injectedContent = this.injectIntoHtml(content, apiBaseUrl);
        
        if (injectedContent !== content) {
          await fs.writeFile(fullPath, injectedContent, 'utf8');
          injectedFiles.push(htmlFile);
          logger.info(`Injected API config into ${htmlFile}`);
        }
      }

      return injectedFiles;
    } catch (error) {
      logger.error('Error injecting API configuration:', error);
      throw error;
    }
  }

  // Find all HTML files in the project
  findHtmlFiles(dir) {
    const htmlFiles = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
          htmlFiles.push(...this.findHtmlFiles(fullPath).map(file => 
            path.join(item, file)
          ));
        } else if (item.endsWith('.html')) {
          htmlFiles.push(item);
        }
      }
    } catch (error) {
      logger.error(`Error reading directory ${dir}:`, error);
    }
    
    return htmlFiles;
  }

  // Skip certain directories
  shouldSkipDirectory(dirName) {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    return skipDirs.includes(dirName);
  }

  // Inject API configuration into HTML content
  injectIntoHtml(htmlContent, apiBaseUrl) {
    let modifiedContent = htmlContent;

    // Replace placeholder in meta tag
    const metaTag = this.apiConfigTag.replace('{API_BASE_URL}', apiBaseUrl);
    const scriptTag = this.apiConfigScript.replace(/{API_BASE_URL}/g, apiBaseUrl);

    // Check if meta tag already exists
    const metaRegex = /<meta\s+name=["']apiBaseUrl["'][^>]*>/i;
    if (metaRegex.test(modifiedContent)) {
      // Replace existing meta tag
      modifiedContent = modifiedContent.replace(metaRegex, metaTag);
    } else {
      // Add meta tag to head
      modifiedContent = this.insertIntoHead(modifiedContent, metaTag);
    }

    // Check if script already exists
    const scriptRegex = /<script>\s*window\.API_CONFIG\s*=/i;
    if (scriptRegex.test(modifiedContent)) {
      // Replace existing script
      modifiedContent = modifiedContent.replace(
        /<script>\s*window\.API_CONFIG\s*=.*?<\/script>/is,
        scriptTag
      );
    } else {
      // Add script to head
      modifiedContent = this.insertIntoHead(modifiedContent, scriptTag);
    }

    return modifiedContent;
  }

  // Insert content into HTML head section
  insertIntoHead(htmlContent, content) {
    const headRegex = /<head[^>]*>/i;
    const headMatch = htmlContent.match(headRegex);

    if (headMatch) {
      // Insert after opening head tag
      const insertPosition = headMatch.index + headMatch[0].length;
      return htmlContent.slice(0, insertPosition) + 
             '\n  ' + content + '\n' + 
             htmlContent.slice(insertPosition);
    } else {
      // If no head tag, add one
      const htmlRegex = /<html[^>]*>/i;
      const htmlMatch = htmlContent.match(htmlRegex);

      if (htmlMatch) {
        const insertPosition = htmlMatch.index + htmlMatch[0].length;
        return htmlContent.slice(0, insertPosition) + 
               '\n<head>\n  ' + content + '\n</head>\n' + 
               htmlContent.slice(insertPosition);
      } else {
        // If no html tag, prepend to content
        return '<head>\n  ' + content + '\n</head>\n' + htmlContent;
      }
    }
  }

  // Create environment configuration file
  async createEnvFile(extractPath, apiBaseUrl, appId) {
    const envContent = `# Auto-generated API configuration
REACT_APP_API_BASE_URL=${apiBaseUrl}
VUE_APP_API_BASE_URL=${apiBaseUrl}
API_BASE_URL=${apiBaseUrl}
APP_ID=${appId}
NODE_ENV=production
`;

    const envFiles = ['.env', '.env.production', '.env.local'];
    
    for (const envFile of envFiles) {
      const envPath = path.join(extractPath, envFile);
      try {
        await fs.writeFile(envPath, envContent, 'utf8');
        logger.info(`Created environment file: ${envFile}`);
      } catch (error) {
        logger.error(`Error creating environment file ${envFile}:`, error);
      }
    }
  }

  // Update package.json with API configuration
  async updatePackageJson(extractPath, apiBaseUrl) {
    const packageJsonPath = path.join(extractPath, 'package.json');
    
    try {
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        
        // Add API configuration to package.json
        packageJson.apiConfig = {
          baseUrl: apiBaseUrl,
          endpoints: {
            auth: `${apiBaseUrl}/auth`,
            crud: `${apiBaseUrl}/crud`,
            search: `${apiBaseUrl}/search`,
            upload: `${apiBaseUrl}/upload`
          }
        };

        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        logger.info('Updated package.json with API configuration');
      }
    } catch (error) {
      logger.error('Error updating package.json:', error);
    }
  }

  // Create API client helper file
  async createApiClient(extractPath, apiBaseUrl) {
    const apiClientContent = `// Auto-generated API client
class ApiClient {
  constructor() {
    this.baseUrl = '${apiBaseUrl}';
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers.Authorization = \`Bearer \${this.token}\`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async logout() {
    this.clearToken();
    return this.request('/auth/logout', { method: 'POST' });
  }

  // CRUD methods
  async create(resource, data) {
    return this.request(\`/crud/\${resource}\`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async read(resource, id = null) {
    const endpoint = id ? \`/crud/\${resource}/\${id}\` : \`/crud/\${resource}\`;
    return this.request(endpoint);
  }

  async update(resource, id, data) {
    return this.request(\`/crud/\${resource}/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(resource, id) {
    return this.request(\`/crud/\${resource}/\${id}\`, {
      method: 'DELETE'
    });
  }

  // Search method
  async search(query, filters = {}) {
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters })
    });
  }
}

// Global API client instance
window.apiClient = new ApiClient();
`;

    const apiClientPath = path.join(extractPath, 'api-client.js');
    await fs.writeFile(apiClientPath, apiClientContent, 'utf8');
    logger.info('Created API client helper file');
  }

  // Complete injection process
  async injectAll(extractPath, apiBaseUrl, appId) {
    try {
      // Inject into HTML files
      const injectedFiles = await this.injectApiConfig(extractPath, apiBaseUrl);
      
      // Create environment file
      await this.createEnvFile(extractPath, apiBaseUrl, appId);
      
      // Update package.json if it exists
      await this.updatePackageJson(extractPath, apiBaseUrl);
      
      // Create API client helper
      await this.createApiClient(extractPath, apiBaseUrl);

      return {
        injectedFiles,
        success: true
      };
    } catch (error) {
      logger.error('Error in complete injection process:', error);
      throw error;
    }
  }
}

module.exports = new FrontendInjector();
