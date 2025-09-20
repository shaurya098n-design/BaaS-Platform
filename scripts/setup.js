#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Frontend + Backend Deployment Platform...\n');

// Create necessary directories
const directories = [
  'logs',
  'temp',
  'static',
  'uploads'
];

console.log('📁 Creating directories...');
directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   ✅ Created ${dir}/`);
  } else {
    console.log(`   ⚠️  ${dir}/ already exists`);
  }
});

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating .env file...');
  const envExamplePath = path.join(process.cwd(), 'env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('   ✅ Created .env from env.example');
    console.log('   ⚠️  Please update .env with your actual configuration');
  } else {
    console.log('   ❌ env.example not found');
  }
} else {
  console.log('\n⚠️  .env file already exists');
}

// Check Node.js version
console.log('\n🔍 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 18) {
  console.log(`   ✅ Node.js ${nodeVersion} is supported`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} is not supported. Please upgrade to Node.js 18 or higher.`);
  process.exit(1);
}

// Check if dependencies are installed
console.log('\n📦 Checking dependencies...');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ Dependencies are installed');
} else {
  console.log('   ⚠️  Dependencies not found. Installing...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('   ✅ Dependencies installed successfully');
  } catch (error) {
    console.log('   ❌ Failed to install dependencies');
    process.exit(1);
  }
}

// Create sample frontend app for testing
console.log('\n🎨 Creating sample frontend app...');
const sampleAppPath = path.join(process.cwd(), 'sample-app');
if (!fs.existsSync(sampleAppPath)) {
  fs.mkdirSync(sampleAppPath, { recursive: true });
  
  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Frontend App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .api-demo {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        button {
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            background: #45a049;
        }
        .result {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Sample Frontend App</h1>
        <p>This is a sample frontend application that demonstrates the deployment platform.</p>
        
        <div class="api-demo">
            <h3>API Demo</h3>
            <p>Test the pre-built APIs:</p>
            <button onclick="testHealth()">Test Health Check</button>
            <button onclick="testAuth()">Test Auth API</button>
            <button onclick="testCRUD()">Test CRUD API</button>
            <div id="result" class="result" style="display: none;"></div>
        </div>
    </div>

    <script>
        // API configuration will be automatically injected
        function showResult(data) {
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.textContent = JSON.stringify(data, null, 2);
        }

        async function testHealth() {
            try {
                const response = await fetch('/health');
                const data = await response.json();
                showResult(data);
            } catch (error) {
                showResult({ error: error.message });
            }
        }

        async function testAuth() {
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                showResult(data);
            } catch (error) {
                showResult({ error: error.message });
            }
        }

        async function testCRUD() {
            try {
                const response = await fetch('/api/crud/sample');
                const data = await response.json();
                showResult(data);
            } catch (error) {
                showResult({ error: error.message });
            }
        }
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(sampleAppPath, 'index.html'), indexHtml);
  console.log('   ✅ Sample app created in sample-app/');
} else {
  console.log('   ⚠️  Sample app already exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('   1. Update .env with your Supabase configuration');
console.log('   2. Run the database setup scripts in Supabase');
console.log('   3. Start the development server: npm run dev');
console.log('   4. Test the sample app by zipping the sample-app/ folder and uploading it');
console.log('\n📚 For more information, check the README.md and DEPLOYMENT.md files');
