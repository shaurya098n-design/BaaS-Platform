const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const acorn = require('acorn');
const walk = require('acorn-walk');
const logger = require('./logger');

class FrontendAnalyzer {
  constructor() {
    this.supportedFrameworks = ['react', 'vue', 'angular', 'svelte', 'vanilla', 'nextjs', 'nuxt'];
    this.frameworkSignatures = {
      react: [
        'react', 'React', 'jsx', 'JSX', 'createElement', 'useState', 'useEffect',
        'componentDidMount', 'render()', 'import React', 'from "react"'
      ],
      vue: [
        'vue', 'Vue', 'vue.js', 'v-if', 'v-for', 'v-model', 'new Vue',
        'Vue.component', 'export default', 'template', 'script setup'
      ],
      angular: [
        'angular', 'Angular', '@Component', '@Injectable', 'ngOnInit',
        'ngFor', 'ngIf', '[(ngModel)]', 'import { Component }'
      ],
      svelte: [
        'svelte', 'Svelte', 'svelte/store', 'onMount', 'createEventDispatcher',
        'export let', 'bind:', 'on:click', 'if:', 'each:'
      ],
      nextjs: [
        'next', 'Next.js', 'getServerSideProps', 'getStaticProps',
        'useRouter', 'Link', 'import { useRouter }', 'pages/api'
      ],
      nuxt: [
        'nuxt', 'Nuxt.js', 'nuxt.config', 'asyncData', 'fetch',
        'middleware', 'plugins', 'layouts', 'pages'
      ]
    };
  }

  /**
   * Main analysis method - analyzes entire frontend project
   * @param {string} projectPath - Path to extracted project
   * @returns {Object} Complete analysis results
   */
  async analyzeProject(projectPath) {
    try {
      logger.info(`Starting frontend analysis for: ${projectPath}`);

      const analysis = {
        projectPath,
        timestamp: new Date().toISOString(),
        framework: null,
        structure: {},
        components: [],
        apis: [],
        forms: [],
        dataModels: [],
        files: [],
        pages: [],
        requirements: {},
        recommendations: []
      };

      // 1. Detect framework
      analysis.framework = await this.detectFramework(projectPath);
      logger.info(`Detected framework: ${analysis.framework.name}`);

      // 2. Analyze project structure
      analysis.structure = await this.analyzeStructure(projectPath);

      // 3. Get all files with their content
      analysis.files = await this.analyzeFiles(projectPath);

      // 4. Parse HTML files for pages and forms
      const htmlFiles = this.findFilesByExtension(projectPath, ['.html', '.htm']);
      for (const htmlFile of htmlFiles) {
        const htmlAnalysis = await this.analyzeHTML(htmlFile);
        analysis.forms.push(...htmlAnalysis.forms);
        analysis.components.push(...htmlAnalysis.components);
        analysis.pages.push(...htmlAnalysis.pages);
      }

      // 5. Parse JavaScript/TypeScript files
      const jsFiles = this.findFilesByExtension(projectPath, ['.js', '.jsx', '.ts', '.tsx', '.vue']);
      for (const jsFile of jsFiles) {
        const jsAnalysis = await this.analyzeJavaScript(jsFile, analysis.framework);
        analysis.apis.push(...jsAnalysis.apis);
        analysis.dataModels.push(...jsAnalysis.dataModels);
        analysis.components.push(...jsAnalysis.components);
      }

      // 6. Generate requirements and recommendations
      analysis.requirements = this.generateRequirements(analysis);
      analysis.recommendations = this.generateRecommendations(analysis);

      logger.info(`Analysis complete. Found ${analysis.forms.length} forms, ${analysis.apis.length} API calls, ${analysis.components.length} components, ${analysis.pages.length} pages`);
      
      return analysis;

    } catch (error) {
      logger.error('Error analyzing frontend project:', error);
      throw error;
    }
  }

  /**
   * Analyze all files in the project
   * @param {string} projectPath - Path to project
   * @returns {Array} File analysis results
   */
  async analyzeFiles(projectPath) {
    const files = [];
    const allFiles = await this.getAllFiles(projectPath);
    
    for (const filePath of allFiles) {
      try {
        const relativePath = path.relative(projectPath, filePath);
        const stat = await fs.stat(filePath);
        const ext = path.extname(filePath);
        
        const fileInfo = {
          path: relativePath,
          fullPath: filePath,
          size: stat.size,
          extension: ext,
          type: this.getFileType(ext),
          lastModified: stat.mtime,
          content: null,
          lines: 0,
          language: this.getLanguage(ext)
        };

        // Read content for text files
        if (this.isTextFile(ext)) {
          try {
            const content = await fs.readFile(filePath, 'utf8');
            fileInfo.content = content;
            fileInfo.lines = content.split('\n').length;
          } catch (error) {
            logger.warn(`Could not read file ${filePath}:`, error.message);
          }
        }

        files.push(fileInfo);
      } catch (error) {
        logger.warn(`Error analyzing file ${filePath}:`, error.message);
      }
    }

    return files.sort((a, b) => a.path.localeCompare(b.path));
  }

  /**
   * Detect the frontend framework used
   * @param {string} projectPath - Path to project
   * @returns {Object} Framework information
   */
  async detectFramework(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const framework = { name: 'vanilla', version: null, confidence: 0 };

    try {
      // Check package.json first
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        for (const [frameworkName, signatures] of Object.entries(this.frameworkSignatures)) {
          for (const dep of Object.keys(dependencies)) {
            if (signatures.some(sig => dep.toLowerCase().includes(sig.toLowerCase()))) {
              framework.name = frameworkName;
              framework.version = dependencies[dep];
              framework.confidence = 0.9;
              return framework;
            }
          }
        }
      }

      // Scan files for framework signatures
      const allFiles = await this.getAllFiles(projectPath);
      const frameworkScores = {};

      for (const file of allFiles) {
        if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.vue')) {
          const content = await fs.readFile(file, 'utf8');
          
          for (const [frameworkName, signatures] of Object.entries(this.frameworkSignatures)) {
            if (!frameworkScores[frameworkName]) frameworkScores[frameworkName] = 0;
            
            for (const signature of signatures) {
              const matches = (content.match(new RegExp(signature, 'g')) || []).length;
              frameworkScores[frameworkName] += matches;
            }
          }
        }
      }

      // Find framework with highest score
      const bestFramework = Object.entries(frameworkScores)
        .sort(([,a], [,b]) => b - a)[0];

      if (bestFramework && bestFramework[1] > 0) {
        framework.name = bestFramework[0];
        framework.confidence = Math.min(bestFramework[1] / 10, 1);
      }

    } catch (error) {
      logger.warn('Error detecting framework:', error);
    }

    return framework;
  }

  /**
   * Analyze project structure
   * @param {string} projectPath - Path to project
   * @returns {Object} Project structure analysis
   */
  async analyzeStructure(projectPath) {
    const structure = {
      hasPackageJson: false,
      hasNodeModules: false,
      hasSrc: false,
      hasPublic: false,
      hasDist: false,
      hasBuild: false,
      entryPoints: [],
      configFiles: [],
      directories: []
    };

    try {
      const items = await fs.readdir(projectPath);
      
      structure.hasPackageJson = items.includes('package.json');
      structure.hasNodeModules = items.includes('node_modules');
      structure.hasSrc = items.includes('src');
      structure.hasPublic = items.includes('public');
      structure.hasDist = items.includes('dist');
      structure.hasBuild = items.includes('build');

      // Find entry points
      const entryPointPatterns = ['index.html', 'index.js', 'main.js', 'app.js', 'App.jsx', 'App.tsx'];
      for (const pattern of entryPointPatterns) {
        if (items.includes(pattern)) {
          structure.entryPoints.push(pattern);
        }
      }

      // Find config files
      const configPatterns = ['webpack.config.js', 'vite.config.js', 'next.config.js', 'nuxt.config.js', 'tailwind.config.js'];
      for (const pattern of configPatterns) {
        if (items.includes(pattern)) {
          structure.configFiles.push(pattern);
        }
      }

      // Get all directories
      for (const item of items) {
        const fullPath = path.join(projectPath, item);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          structure.directories.push(item);
        }
      }

    } catch (error) {
      logger.warn('Error analyzing structure:', error);
    }

    return structure;
  }

  /**
   * Analyze HTML file for forms, components, and pages
   * @param {string} filePath - Path to HTML file
   * @returns {Object} HTML analysis results
   */
  async analyzeHTML(filePath) {
    const analysis = { forms: [], components: [], pages: [] };

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const $ = cheerio.load(content);

      // Analyze pages
      const pageAnalysis = {
        path: path.relative(process.cwd(), filePath),
        title: $('title').text() || 'Untitled',
        description: $('meta[name="description"]').attr('content') || '',
        viewport: $('meta[name="viewport"]').attr('content') || '',
        scripts: [],
        stylesheets: [],
        links: []
      };

      // Extract scripts
      $('script').each((i, script) => {
        const src = $(script).attr('src');
        if (src) {
          pageAnalysis.scripts.push(src);
        }
      });

      // Extract stylesheets
      $('link[rel="stylesheet"]').each((i, link) => {
        const href = $(link).attr('href');
        if (href) {
          pageAnalysis.stylesheets.push(href);
        }
      });

      // Extract links
      $('a[href]').each((i, link) => {
        const href = $(link).attr('href');
        const text = $(link).text().trim();
        if (href && text) {
          pageAnalysis.links.push({ href, text });
        }
      });

      analysis.pages.push(pageAnalysis);

      // Analyze forms
      $('form').each((i, form) => {
        const formAnalysis = {
          id: $(form).attr('id') || `form-${i}`,
          action: $(form).attr('action') || '',
          method: $(form).attr('method') || 'GET',
          fields: [],
          submitButton: null
        };

        // Analyze form fields
        $(form).find('input, select, textarea').each((j, field) => {
          const fieldAnalysis = {
            type: $(field).attr('type') || $(field).prop('tagName').toLowerCase(),
            name: $(field).attr('name') || '',
            id: $(field).attr('id') || '',
            placeholder: $(field).attr('placeholder') || '',
            required: $(field).attr('required') !== undefined,
            value: $(field).attr('value') || ''
          };
          formAnalysis.fields.push(fieldAnalysis);
        });

        // Find submit button
        const submitBtn = $(form).find('button[type="submit"], input[type="submit"]').first();
        if (submitBtn.length) {
          formAnalysis.submitButton = {
            text: submitBtn.text() || submitBtn.attr('value') || 'Submit',
            type: submitBtn.attr('type') || 'submit'
          };
        }

        analysis.forms.push(formAnalysis);
      });

      // Analyze potential components (divs with specific patterns)
      $('div[class*="component"], div[class*="Component"], div[id*="component"], div[id*="Component"]').each((i, div) => {
        const componentAnalysis = {
          type: 'html-component',
          selector: $(div).attr('class') || $(div).attr('id') || `component-${i}`,
          hasChildren: $(div).children().length > 0,
          hasEventHandlers: $(div).attr('onclick') || $(div).attr('onchange') || false
        };
        analysis.components.push(componentAnalysis);
      });

    } catch (error) {
      logger.warn(`Error analyzing HTML file ${filePath}:`, error);
    }

    return analysis;
  }

  /**
   * Analyze JavaScript/TypeScript file
   * @param {string} filePath - Path to JS/TS file
   * @param {Object} framework - Framework information
   * @returns {Object} JavaScript analysis results
   */
  async analyzeJavaScript(filePath, framework) {
    const analysis = { apis: [], dataModels: [], components: [] };

    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Parse JavaScript/TypeScript
      const ast = acorn.parse(content, {
        ecmaVersion: 2020,
        sourceType: 'module',
        allowHashBang: true
      });

      // Walk the AST to find API calls, components, and data models
      walk.simple(ast, {
        CallExpression: (node) => {
          this.analyzeCallExpression(node, analysis, framework);
        },
        VariableDeclarator: (node) => {
          this.analyzeVariableDeclarator(node, analysis, framework);
        },
        FunctionDeclaration: (node) => {
          this.analyzeFunctionDeclaration(node, analysis, framework);
        },
        ClassDeclaration: (node) => {
          this.analyzeClassDeclaration(node, analysis, framework);
        }
      });

    } catch (error) {
      logger.warn(`Error analyzing JavaScript file ${filePath}:`, error);
    }

    return analysis;
  }

  /**
   * Analyze call expressions for API calls
   * @param {Object} node - AST node
   * @param {Object} analysis - Analysis object to update
   * @param {Object} framework - Framework information
   */
  analyzeCallExpression(node, analysis, framework) {
    const callee = node.callee;
    
    // Detect fetch calls
    if (callee.name === 'fetch' || (callee.type === 'MemberExpression' && callee.property.name === 'fetch')) {
      const apiCall = {
        type: 'fetch',
        url: this.extractStringLiteral(node.arguments[0]),
        method: 'GET',
        hasBody: node.arguments.length > 1
      };
      
      // Try to extract method from options
      if (node.arguments[1] && node.arguments[1].type === 'ObjectExpression') {
        const methodProp = node.arguments[1].properties.find(p => p.key.name === 'method');
        if (methodProp) {
          apiCall.method = this.extractStringLiteral(methodProp.value);
        }
      }
      
      analysis.apis.push(apiCall);
    }

    // Detect axios calls
    if (callee.type === 'MemberExpression' && callee.property.name && 
        ['get', 'post', 'put', 'delete', 'patch'].includes(callee.property.name)) {
      const apiCall = {
        type: 'axios',
        method: callee.property.name.toUpperCase(),
        url: this.extractStringLiteral(node.arguments[0]),
        hasBody: node.arguments.length > 1
      };
      analysis.apis.push(apiCall);
    }

    // Detect React components
    if (framework.name === 'react' && callee.name === 'createElement') {
      const componentName = this.extractStringLiteral(node.arguments[0]);
      if (componentName && componentName[0] === componentName[0].toUpperCase()) {
        analysis.components.push({
          type: 'react-component',
          name: componentName,
          framework: 'react'
        });
      }
    }
  }

  /**
   * Analyze variable declarators for data models
   * @param {Object} node - AST node
   * @param {Object} analysis - Analysis object to update
   * @param {Object} framework - Framework information
   */
  analyzeVariableDeclarator(node, analysis, framework) {
    if (node.init && node.init.type === 'ObjectExpression') {
      const dataModel = {
        name: node.id.name,
        type: 'object',
        properties: []
      };

      node.init.properties.forEach(prop => {
        dataModel.properties.push({
          name: prop.key.name || prop.key.value,
          type: this.inferType(prop.value)
        });
      });

      analysis.dataModels.push(dataModel);
    }
  }

  /**
   * Analyze function declarations
   * @param {Object} node - AST node
   * @param {Object} analysis - Analysis object to update
   * @param {Object} framework - Framework information
   */
  analyzeFunctionDeclaration(node, analysis, framework) {
    // Detect React functional components
    if (framework.name === 'react' && node.id && node.id.name[0] === node.id.name[0].toUpperCase()) {
      analysis.components.push({
        type: 'react-functional-component',
        name: node.id.name,
        framework: 'react'
      });
    }
  }

  /**
   * Analyze class declarations
   * @param {Object} node - AST node
   * @param {Object} analysis - Analysis object to update
   * @param {Object} framework - Framework information
   */
  analyzeClassDeclaration(node, analysis, framework) {
    // Detect React class components
    if (framework.name === 'react') {
      analysis.components.push({
        type: 'react-class-component',
        name: node.id.name,
        framework: 'react'
      });
    }
  }

  /**
   * Generate API requirements based on analysis
   * @param {Object} analysis - Complete analysis results
   * @returns {Object} API requirements
   */
  generateRequirements(analysis) {
    const requirements = {
      authentication: false,
      crud: [],
      fileUpload: false,
      realTime: false,
      search: false,
      customEndpoints: []
    };

    // Analyze forms for CRUD requirements
    analysis.forms.forEach(form => {
      if (form.action.includes('create') || form.action.includes('add')) {
        requirements.crud.push({ operation: 'create', resource: this.inferResourceFromForm(form) });
      }
      if (form.action.includes('update') || form.action.includes('edit')) {
        requirements.crud.push({ operation: 'update', resource: this.inferResourceFromForm(form) });
      }
      if (form.action.includes('delete') || form.action.includes('remove')) {
        requirements.crud.push({ operation: 'delete', resource: this.inferResourceFromForm(form) });
      }
    });

    // Analyze API calls
    analysis.apis.forEach(api => {
      if (api.url && (api.url.includes('login') || api.url.includes('auth'))) {
        requirements.authentication = true;
      }
      if (api.url && (api.url.includes('upload') || api.url.includes('file'))) {
        requirements.fileUpload = true;
      }
      if (api.url && (api.url.includes('search') || api.url.includes('query'))) {
        requirements.search = true;
      }
    });

    return requirements;
  }

  /**
   * Generate recommendations based on analysis
   * @param {Object} analysis - Complete analysis results
   * @returns {Array} Recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.framework.name === 'react') {
      recommendations.push({
        type: 'framework',
        message: 'React project detected. Consider adding React Router for navigation.',
        priority: 'medium'
      });
    }

    if (analysis.forms.length > 0) {
      recommendations.push({
        type: 'backend',
        message: `${analysis.forms.length} forms detected. Backend APIs will be generated for form handling.`,
        priority: 'high'
      });
    }

    if (analysis.apis.length > 0) {
      recommendations.push({
        type: 'integration',
        message: `${analysis.apis.length} API calls detected. Consider implementing API client injection.`,
        priority: 'high'
      });
    }

    return recommendations;
  }

  // Helper methods
  findFilesByExtension(dir, extensions) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findFilesByExtension(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async getAllFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  extractStringLiteral(node) {
    if (!node) return null;
    if (node.type === 'Literal') return node.value;
    if (node.type === 'TemplateLiteral') return node.quasis[0].value.cooked;
    return null;
  }

  inferType(node) {
    if (!node) return 'unknown';
    if (node.type === 'Literal') return typeof node.value;
    if (node.type === 'ArrayExpression') return 'array';
    if (node.type === 'ObjectExpression') return 'object';
    return 'unknown';
  }

  inferResourceFromForm(form) {
    // Try to infer resource name from form fields or action
    const commonFields = ['name', 'title', 'email', 'username', 'password'];
    const resourceFields = form.fields.filter(field => commonFields.includes(field.name));
    
    if (resourceFields.length > 0) {
      return resourceFields[0].name;
    }
    
    return 'resource';
  }

  getFileType(extension) {
    const types = {
      '.js': 'JavaScript',
      '.jsx': 'React JSX',
      '.ts': 'TypeScript',
      '.tsx': 'React TypeScript',
      '.vue': 'Vue Component',
      '.html': 'HTML',
      '.htm': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.sass': 'SASS',
      '.less': 'LESS',
      '.json': 'JSON',
      '.md': 'Markdown',
      '.txt': 'Text',
      '.png': 'Image',
      '.jpg': 'Image',
      '.jpeg': 'Image',
      '.gif': 'Image',
      '.svg': 'SVG',
      '.ico': 'Icon',
      '.woff': 'Font',
      '.woff2': 'Font',
      '.ttf': 'Font',
      '.eot': 'Font'
    };
    return types[extension] || 'Unknown';
  }

  getLanguage(extension) {
    const languages = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.vue': 'vue',
      '.html': 'html',
      '.htm': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'sass',
      '.less': 'less',
      '.json': 'json',
      '.md': 'markdown',
      '.txt': 'text'
    };
    return languages[extension] || 'text';
  }

  isTextFile(extension) {
    const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html', '.htm', '.css', '.scss', '.sass', '.less', '.json', '.md', '.txt'];
    return textExtensions.includes(extension);
  }
}

module.exports = FrontendAnalyzer;
