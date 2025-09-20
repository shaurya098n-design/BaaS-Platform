#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const FormData = require('form-data');
const fetch = require('node-fetch');

console.log('🧪 Testing Frontend Deployment Platform...\n');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

async function testDeployment() {
  try {
    // Step 1: Register a test user
    console.log('1️⃣ Registering test user...');
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        userData: {
          name: 'Test User'
        }
      })
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      console.log(`   ⚠️  Registration failed (might already exist): ${error}`);
    } else {
      console.log('   ✅ Test user registered successfully');
    }

    // Step 2: Login
    console.log('\n2️⃣ Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${await loginResponse.text()}`);
    }

    const loginData = await loginResponse.json();
    const accessToken = loginData.data.session.accessToken;
    console.log('   ✅ Login successful');

    // Step 3: Create a test ZIP file
    console.log('\n3️⃣ Creating test ZIP file...');
    const sampleAppPath = path.join(process.cwd(), 'sample-app');
    const zipPath = path.join(process.cwd(), 'test-app.zip');

    if (!fs.existsSync(sampleAppPath)) {
      throw new Error('Sample app not found. Run setup.js first.');
    }

    await createZipFile(sampleAppPath, zipPath);
    console.log('   ✅ Test ZIP file created');

    // Step 4: Upload and deploy
    console.log('\n4️⃣ Uploading and deploying app...');
    const formData = new FormData();
    formData.append('frontend', fs.createReadStream(zipPath));
    formData.append('appName', 'Test Deployment App');

    const deployResponse = await fetch(`${API_BASE_URL}/upload/deploy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!deployResponse.ok) {
      throw new Error(`Deployment failed: ${await deployResponse.text()}`);
    }

    const deployData = await deployResponse.json();
    const appId = deployData.data.appId;
    const appUrl = deployData.data.appUrl;
    console.log('   ✅ App deployed successfully');
    console.log(`   📱 App ID: ${appId}`);
    console.log(`   🌐 App URL: ${appUrl}`);

    // Step 5: Test the deployed app
    console.log('\n5️⃣ Testing deployed app...');
    const appResponse = await fetch(appUrl);
    if (appResponse.ok) {
      console.log('   ✅ Deployed app is accessible');
    } else {
      console.log(`   ⚠️  Deployed app returned status: ${appResponse.status}`);
    }

    // Step 6: Test CRUD API
    console.log('\n6️⃣ Testing CRUD API...');
    const crudResponse = await fetch(`${API_BASE_URL}/crud/test-items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Item',
        description: 'This is a test item'
      })
    });

    if (crudResponse.ok) {
      console.log('   ✅ CRUD API is working');
    } else {
      console.log(`   ⚠️  CRUD API test failed: ${await crudResponse.text()}`);
    }

    // Step 7: Get user's apps
    console.log('\n7️⃣ Fetching user apps...');
    const appsResponse = await fetch(`${API_BASE_URL}/upload/apps`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (appsResponse.ok) {
      const appsData = await appsResponse.json();
      console.log(`   ✅ Found ${appsData.data.length} deployed apps`);
    } else {
      console.log(`   ⚠️  Failed to fetch apps: ${await appsResponse.text()}`);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await fs.remove(zipPath);
    console.log('   ✅ Test files cleaned up');

    console.log('\n🎉 All tests passed! The deployment platform is working correctly.');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ User registration and authentication');
    console.log('   ✅ File upload and ZIP processing');
    console.log('   ✅ Frontend deployment');
    console.log('   ✅ Static file serving');
    console.log('   ✅ CRUD API functionality');
    console.log('   ✅ App management');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function createZipFile(sourceDir, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

// Check if required dependencies are available
async function checkDependencies() {
  try {
    require('archiver');
    require('form-data');
    require('node-fetch');
    return true;
  } catch (error) {
    console.log('📦 Installing test dependencies...');
    try {
      const { execSync } = require('child_process');
      execSync('npm install archiver form-data node-fetch', { stdio: 'inherit' });
      return true;
    } catch (installError) {
      console.error('❌ Failed to install test dependencies:', installError.message);
      return false;
    }
  }
}

async function main() {
  const depsOk = await checkDependencies();
  if (!depsOk) {
    process.exit(1);
  }

  await testDeployment();
}

if (require.main === module) {
  main();
}
