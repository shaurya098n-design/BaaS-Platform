# 🚀 Complete Guide: How to Use the Frontend + Backend Deployment Platform

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Setup](#quick-setup)
3. [Detailed Setup Guide](#detailed-setup-guide)
4. [Running the Application](#running-the-application)
5. [Testing the Platform](#testing-the-platform)
6. [Using the Platform](#using-the-platform)
7. [Deployment Options](#deployment-options)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Configuration](#advanced-configuration)
10. [API Reference](#api-reference)

---

## 🔧 Prerequisites

Before you start, make sure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **Git** installed ([Download here](https://git-scm.com/))
- **A Supabase account** ([Sign up here](https://supabase.com/))
- **An Upstash Redis account** (Optional, [Sign up here](https://upstash.com/))

---

## ⚡ Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd frontend-backend-deployment-platform

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your credentials (see detailed setup below)
```

### 3. Database Setup

1. Create a Supabase project
2. Run the database schema (see detailed setup below)

### 4. Run the Application

```bash
# Start development server
npm run dev

# Or run setup script first (recommended)
node scripts/setup.js
npm run dev
```

### 5. Test Everything

```bash
# Run the test script
node scripts/test-deployment.js
```

---

## 📖 Detailed Setup Guide

### Step 1: Supabase Setup

#### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/Login with GitHub
4. Click "New Project"
5. Choose your organization
6. Enter project details:
   - **Name**: `frontend-backend-platform`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
7. Click "Create new project"
8. Wait for the project to be ready (2-3 minutes)

#### 1.2 Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xyz.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

#### 1.3 Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `database/schema.sql`
4. Click "Run" to execute the schema
5. Create another new query
6. Copy and paste the contents of `database/seed.sql`
7. Click "Run" to execute the seed data

#### 1.4 Configure Storage

1. Go to **Storage** in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it: `frontend-apps`
4. Make it **Public** (for serving deployed apps)
5. Click "Create bucket"

#### 1.5 Set Up Authentication

1. Go to **Authentication** → **Settings**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)
4. Configure **Email** settings if needed

### Step 2: Redis Setup (Optional but Recommended)

#### 2.1 Create Upstash Redis Database

1. Go to [upstash.com](https://upstash.com)
2. Sign up/Login
3. Click "Create Database"
4. Choose:
   - **Name**: `frontend-backend-cache`
   - **Region**: Same as your Supabase region
   - **Type**: Regional
5. Click "Create"
6. Copy the **Redis URL** and **Redis Token**

### Step 3: Environment Configuration

Edit your `.env` file with the following:

```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Redis Configuration (Optional - improves performance)
REDIS_URL=redis://default:password@region.upstash.io:6379
REDIS_TOKEN=your_redis_token_here

# Server Configuration
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000/api

# File Upload Configuration
MAX_FILE_SIZE=50MB
ALLOWED_FILE_TYPES=application/zip,application/x-zip-compressed

# Security
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
CORS_ORIGIN=http://localhost:3000

# Storage Configuration
STORAGE_BUCKET=frontend-apps
STATIC_SERVE_PATH=/static

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: Replace all placeholder values with your actual credentials!

---

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start the development server
npm run dev

# The server will start on http://localhost:3000
```

### Production Mode

```bash
# Build and start production server
npm start
```

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the services
docker-compose down
```

### Using the Setup Script

```bash
# Run the automated setup script
node scripts/setup.js

# This will:
# - Create necessary directories
# - Check Node.js version
# - Install dependencies if needed
# - Create sample frontend app
# - Verify your configuration
```

---

## 🧪 Testing the Platform

### Automated Testing

```bash
# Run the comprehensive test script
node scripts/test-deployment.js

# This will test:
# - User registration and authentication
# - File upload and ZIP processing
# - Frontend deployment
# - Static file serving
# - CRUD API functionality
# - App management
```

### Manual Testing

#### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

#### 2. API Information

```bash
curl http://localhost:3000/
```

#### 3. Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "userData": {
      "name": "Test User"
    }
  }'
```

#### 4. Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

---

## 🎯 Using the Platform

### 1. Create a Frontend Application

Create a simple HTML file or use any frontend framework:

**Example: Simple HTML App**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Awesome App</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        button { padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .result { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 My Deployed App</h1>
        <p>This app is automatically connected to backend APIs!</p>
        
        <button onclick="testAPI()">Test API Connection</button>
        <button onclick="createItem()">Create Item</button>
        <button onclick="getItems()">Get Items</button>
        
        <div id="result" class="result" style="display: none;"></div>
    </div>

    <script>
        function showResult(data) {
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }

        async function testAPI() {
            try {
                const response = await fetch('/health');
                const data = await response.json();
                showResult(data);
            } catch (error) {
                showResult({ error: error.message });
            }
        }

        async function createItem() {
            try {
                const response = await window.apiClient.create('items', {
                    name: 'Test Item',
                    description: 'Created from deployed app'
                });
                showResult(response);
            } catch (error) {
                showResult({ error: error.message });
            }
        }

        async function getItems() {
            try {
                const response = await window.apiClient.read('items');
                showResult(response);
            } catch (error) {
                showResult({ error: error.message });
            }
        }
    </script>
</body>
</html>
```

### 2. Package Your App

Create a ZIP file of your frontend project:

```bash
# If you have a folder called "my-app"
zip -r my-app.zip my-app/

# Or use your operating system's built-in ZIP functionality
```

### 3. Deploy Your App

#### 3.1 Register/Login

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'

# Login to get access token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

#### 3.2 Upload and Deploy

```bash
# Deploy your app (replace YOUR_TOKEN with the token from login)
curl -X POST http://localhost:3000/api/upload/deploy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "frontend=@my-app.zip" \
  -F "appName=My Awesome App"
```

#### 3.3 Access Your Deployed App

The response will include your app URL:
```json
{
  "success": true,
  "message": "App deployed successfully",
  "data": {
    "appId": "123e4567-e89b-12d3-a456-426614174000",
    "appName": "My Awesome App",
    "appUrl": "http://localhost:3000/app/123e4567-e89b-12d3-a456-426614174000",
    "apiBaseUrl": "http://localhost:3000/api",
    "framework": "vanilla",
    "status": "deployed"
  }
}
```

Visit the `appUrl` to see your deployed application!

### 4. Using the Injected APIs

Your deployed app automatically gets access to:

#### Global API Client
```javascript
// Available in your deployed app
window.apiClient = new ApiClient();

// Authentication
const user = await window.apiClient.login('email', 'password');
await window.apiClient.logout();

// CRUD Operations
const items = await window.apiClient.read('items');
const newItem = await window.apiClient.create('items', { name: 'New Item' });
const updatedItem = await window.apiClient.update('items', 'item-id', { name: 'Updated' });
await window.apiClient.delete('items', 'item-id');

// Search
const results = await window.apiClient.search('query', {
  resource: 'items',
  fields: ['name', 'description']
});
```

#### API Configuration
```javascript
// Available in your deployed app
window.API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  endpoints: {
    auth: 'http://localhost:3000/api/auth',
    crud: 'http://localhost:3000/api/crud',
    search: 'http://localhost:3000/api/search',
    upload: 'http://localhost:3000/api/upload'
  }
};
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Beginners)

#### 1.1 Prepare for Vercel

```bash
# Make sure your code is pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 1.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository
5. Configure environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `REDIS_URL` (optional)
   - `REDIS_TOKEN` (optional)
   - `API_BASE_URL` (set to your Vercel URL + `/api`)
   - `JWT_SECRET`
   - `CORS_ORIGIN` (set to your Vercel URL)
6. Click "Deploy"

#### 1.3 Update Supabase Settings

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Update **Site URL** to your Vercel URL
3. Add your Vercel URL to **Redirect URLs**

### Option 2: Railway

#### 2.1 Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Add environment variables (same as Vercel)
7. Railway will automatically deploy

### Option 3: Docker + Custom Server

#### 3.1 Prepare Your Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 3.2 Deploy with Docker

```bash
# Clone your repository
git clone <your-repo-url>
cd frontend-backend-deployment-platform

# Create .env file
cp env.example .env
# Edit .env with your configuration

# Deploy
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "Supabase client not initialized"

**Problem**: Missing or incorrect Supabase credentials

**Solution**:
```bash
# Check your .env file
cat .env

# Make sure these are set correctly:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### 2. "Database connection failed"

**Problem**: Database schema not set up or wrong credentials

**Solution**:
1. Go to Supabase dashboard → SQL Editor
2. Run the contents of `database/schema.sql`
3. Run the contents of `database/seed.sql`
4. Verify your credentials in `.env`

#### 3. "Port already in use"

**Problem**: Port 3000 is already being used

**Solution**:
```bash
# Option 1: Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Change the port in .env
echo "PORT=3001" >> .env
```

#### 4. "File upload fails"

**Problem**: File size too large or wrong file type

**Solution**:
```bash
# Check file size (should be < 50MB)
ls -lh your-file.zip

# Make sure it's a ZIP file
file your-file.zip
```

#### 5. "Authentication failed"

**Problem**: Wrong credentials or Supabase auth not configured

**Solution**:
1. Check your Supabase project is active
2. Verify your API keys are correct
3. Make sure authentication is enabled in Supabase
4. Check the Site URL in Supabase auth settings

#### 6. "Redis connection failed"

**Problem**: Redis not configured or wrong credentials

**Solution**:
```bash
# Option 1: Set up Upstash Redis (recommended)
# Get credentials from upstash.com and add to .env

# Option 2: Disable Redis (app will work without it)
# Comment out or remove REDIS_URL and REDIS_TOKEN from .env
```

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment
export NODE_ENV=development
export DEBUG=*

# Start the server
npm run dev
```

### Check Logs

```bash
# View application logs
tail -f logs/combined.log

# View error logs only
tail -f logs/error.log

# Docker logs
docker-compose logs -f app
```

### Health Checks

```bash
# Check if the server is running
curl http://localhost:3000/health

# Check API endpoints
curl http://localhost:3000/api/auth/me

# Check database connection
curl http://localhost:3000/api/upload/apps
```

---

## ⚙️ Advanced Configuration

### Custom File Size Limits

```env
# In .env file
MAX_FILE_SIZE=100MB  # Increase from default 50MB
```

### Custom Rate Limiting

```env
# In .env file
RATE_LIMIT_WINDOW_MS=1800000  # 30 minutes
RATE_LIMIT_MAX_REQUESTS=200   # 200 requests per window
```

### Custom Storage Configuration

```env
# In .env file
STORAGE_BUCKET=my-custom-bucket
STATIC_SERVE_PATH=/my-static-path
```

### SSL/HTTPS Configuration

For production with SSL:

```env
# In .env file
NODE_ENV=production
API_BASE_URL=https://your-domain.com/api
CORS_ORIGIN=https://your-domain.com
```

### Custom Domain Setup

1. **Update Supabase Settings**:
   - Go to Authentication → Settings
   - Update Site URL to your custom domain
   - Add custom domain to Redirect URLs

2. **Update Environment Variables**:
   ```env
   API_BASE_URL=https://your-domain.com/api
   CORS_ORIGIN=https://your-domain.com
   ```

3. **Configure DNS**:
   - Point your domain to your deployment
   - Set up SSL certificate (Let's Encrypt recommended)

---

## 📚 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Optional |
| GET | `/api/auth/me` | Get current user | Optional |
| POST | `/api/auth/refresh` | Refresh token | No |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/password` | Change password | Yes |
| POST | `/api/auth/reset-password` | Request password reset | No |
| POST | `/api/auth/verify-email` | Verify email | No |
| POST | `/api/auth/oauth/:provider` | OAuth login | No |

### Upload & Deployment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload/deploy` | Deploy frontend app | Yes |
| GET | `/api/upload/apps` | Get user's apps | Yes |
| GET | `/api/upload/apps/:appId` | Get app details | Yes |
| PUT | `/api/upload/apps/:appId` | Update app settings | Yes |
| DELETE | `/api/upload/apps/:appId` | Delete app | Yes |
| POST | `/api/upload/apps/:appId/redeploy` | Redeploy app | Yes |

### CRUD API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/crud/:resource` | Create resource | Yes |
| GET | `/api/crud/:resource` | List resources | Yes |
| GET | `/api/crud/:resource/:id` | Get resource | Yes |
| PUT | `/api/crud/:resource/:id` | Update resource | Yes |
| DELETE | `/api/crud/:resource/:id` | Delete resource | Yes |
| POST | `/api/crud/:resource/bulk` | Bulk operations | Yes |

### Search Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/search` | Search resources | Yes |

### Static File Serving

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/static/:appId/*` | Serve deployed app files | No |
| GET | `/app/:appId` | Direct app access | No |

### Utility Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| GET | `/api/stats` | Get user statistics | Yes |

---

## 🎉 You're All Set!

Congratulations! You now have a fully functional Frontend + Backend Deployment Automation Platform. Here's what you can do:

### ✅ What's Working

- **One-click frontend deployment** from ZIP files
- **Automatic API integration** in deployed apps
- **Complete authentication system** with Supabase
- **CRUD APIs** for any resource type
- **Search functionality** across your data
- **Static file serving** with CDN-like performance
- **Redis caching** for improved performance
- **Comprehensive logging** and monitoring
- **Production-ready deployment** options

### 🚀 Next Steps

1. **Deploy your first app**: Upload a ZIP file and see the magic happen!
2. **Explore the APIs**: Use the injected `apiClient` in your deployed apps
3. **Customize**: Modify the platform to fit your specific needs
4. **Scale**: Deploy to production and start serving real users
5. **Monitor**: Use the built-in analytics to track usage

### 📞 Need Help?

- **Check the logs**: Look in the `logs/` directory for detailed information
- **Run tests**: Use `node scripts/test-deployment.js` to verify everything works
- **Review documentation**: Check `README.md` and `DEPLOYMENT.md` for more details
- **Debug mode**: Set `NODE_ENV=development` and `DEBUG=*` for verbose logging

### 🎯 Pro Tips

1. **Use the setup script**: `node scripts/setup.js` handles most configuration automatically
2. **Test locally first**: Always test your deployment locally before going to production
3. **Monitor your usage**: Check the analytics endpoints to understand how your platform is being used
4. **Keep backups**: Regularly backup your Supabase database and uploaded files
5. **Update regularly**: Keep your dependencies and platform updated for security and performance

Happy deploying! 🚀
