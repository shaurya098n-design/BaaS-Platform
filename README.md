# 🚀 Backend-as-a-Service (BaaS) Platform

A comprehensive platform that automatically deploys frontend applications and provides pre-built backend APIs with zero configuration required. Built with Next.js, TypeScript, and modern web technologies.

## ✨ Features

- **🎨 Modern UI/UX**: Professional dashboard with glassmorphism effects and responsive design
- **⚡ Next.js Frontend**: Fast, modern React-based frontend with TypeScript
- **🔐 One-Click Deployment**: Upload any frontend app (React, Vue, Angular, or vanilla HTML/CSS/JS) as a ZIP file
- **🔧 Automatic API Injection**: Automatically injects API configuration into your frontend code
- **🚀 Pre-built Backend APIs**: Ready-to-use authentication, CRUD, and search APIs
- **🗄️ Supabase Integration**: Built-in authentication, storage, and database
- **⚡ Redis Caching**: High-performance caching with Upstash Redis
- **📁 Static File Serving**: Automatic static file hosting with CDN-like performance
- **🔍 Framework Detection**: Automatically detects and configures your frontend framework (with node_modules filtering)
- **🌐 Custom Domains**: Support for custom domains and SSL
- **📊 Analytics**: Built-in usage analytics and monitoring
- **🔄 CI/CD Ready**: GitHub Actions integration for automated deployments
- **🎯 Auto-Deployment**: Automatic Vercel deployment on GitHub push
- **💻 GitHub Integration**: Connect GitHub accounts and deploy to repositories
- **📱 Responsive Design**: Fully responsive across all device sizes with optimized layouts
- **🎛️ Collapsible Sidebar**: Modern sidebar with collapse/expand functionality
- **👁️ View Toggle**: Switch between grid and list views for projects
- **✨ Smooth Animations**: Optimized hover effects and transitions
- **🔐 Enhanced Authentication**: Smooth loading states without page flash
- **🎨 Compact Design**: Optimized spacing and modern card layouts
- **📁 File Analysis**: Hierarchical file tree with VS Code-like interface
- **🔍 Project Analysis**: Comprehensive project analysis with framework detection
- **📊 Real-time Analytics**: Live project statistics and usage monitoring
- **🎯 Drag-to-Resize**: Resizable panels for optimal workspace layout
- **📝 Code Preview**: Full file content preview with syntax highlighting

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Express.js    │    │   Supabase      │
│   Frontend      │───▶│   Backend API   │───▶│   Services      │
│   (React/TS)    │    │   Server        │    │   (Auth/DB/Storage)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Redis Cache   │              │
         │              │   (Upstash)     │              │
         │              └─────────────────┘              │
         │                                               │
         ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│   Vercel        │                            │   GitHub        │
│   Deployment    │                            │   Integration   │
│   (Auto-Deploy) │                            │   (OAuth/Repos) │
└─────────────────┘                            └─────────────────┘
```

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules with modern design system
- **UI Components**: Custom React components with glassmorphism effects
- **State Management**: React hooks and context
- **Deployment**: Vercel (auto-deployment on GitHub push)

### **Backend**
- **Runtime**: Node.js + Express.js
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Caching**: Upstash Redis
- **File Processing**: yauzl, fs-extra
- **Deployment**: Railway, Docker

### **DevOps & Tools**
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, TypeScript
- **Version Control**: Git with GitHub integration
- **Monitoring**: Built-in analytics and error tracking

## 📋 Prerequisites

- **Node.js 18+** - For running the development server
- **Supabase account** - For database, authentication, and storage
- **Upstash Redis account** (optional) - For caching
- **Vercel account** - For frontend deployment (auto-deployment)
- **Railway account** (optional) - For backend deployment
- **GitHub account** - For version control and CI/CD

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd frontend-backend-deployment-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis Configuration (Optional)
REDIS_URL=your_upstash_redis_url
REDIS_TOKEN=your_upstash_redis_token

# Server Configuration
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000/api

# Security
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
```

### 4. Database Setup

Run the SQL scripts in your Supabase dashboard:

1. Execute `database/schema.sql` to create tables
2. Execute `database/seed.sql` to set up default data

### 5. Start the Development Servers

**Start the Next.js frontend:**
```bash
npm run dev
```

**Start the Express backend (in a separate terminal):**
```bash
npm run server
```

- **Frontend**: `http://localhost:3000` (Next.js)
- **Backend**: `http://localhost:3001` (Express.js)

### 6. Auto-Deployment Setup

**For Vercel auto-deployment:**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Push to GitHub - automatic deployment will trigger

**Environment Variables for Vercel:**
- `NEXT_PUBLIC_API_URL` - Your backend API URL
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Upload & Deployment Endpoints

- `POST /api/upload/deploy` - Deploy frontend application
- `GET /api/upload/apps` - Get user's deployed apps
- `GET /api/upload/apps/:appId` - Get specific app details
- `PUT /api/upload/apps/:appId` - Update app settings
- `DELETE /api/upload/apps/:appId` - Delete app
- `POST /api/upload/apps/:appId/redeploy` - Redeploy app

### CRUD API Endpoints

- `POST /api/crud/:resource` - Create resource
- `GET /api/crud/:resource` - List resources (with pagination)
- `GET /api/crud/:resource/:id` - Get specific resource
- `PUT /api/crud/:resource/:id` - Update resource
- `DELETE /api/crud/:resource/:id` - Delete resource
- `POST /api/crud/:resource/bulk` - Bulk operations

### Search Endpoints

- `POST /api/search` - Search across resources

### Static File Serving

- `GET /static/:appId/*` - Serve deployed frontend files
- `GET /app/:appId` - Direct access to deployed apps

## 🔧 Usage Examples

### Deploy a Frontend App

**Using the Web Interface:**
1. Login to the dashboard at `http://localhost:3000`
2. Click "Upload New Project"
3. Select your ZIP file (React, Vue, Angular, or vanilla HTML/CSS/JS)
4. Enter app name and description
5. Click "Upload Project"

**Using the API:**
```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@my-react-app.zip" \
  -F "appName=My React App" \
  -F "frontendType=react"
```

### Use the Injected API Client++

After deployment, your frontend will have access to a global `apiClient`:

```javascript
// Login
const user = await window.apiClient.login('user@example.com', 'password');

// Create a resource
const todo = await window.apiClient.create('todos', {
  title: 'Learn deployment automation',
  completed: false
});

// Search
const results = await window.apiClient.search('deployment', {
  resource: 'todos',
  fields: ['title', 'description']
});
```

### CRUD Operations

```javascript
// Create
const newItem = await window.apiClient.create('items', {
  name: 'New Item',
  description: 'Item description'
});

// Read
const items = await window.apiClient.read('items');
const item = await window.apiClient.read('items', 'item-id');

// Update
const updatedItem = await window.apiClient.update('items', 'item-id', {
  name: 'Updated Item'
});

// Delete
await window.apiClient.delete('items', 'item-id');
```

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the image
docker build -t frontend-backend-platform .

# Run with docker-compose
docker-compose up -d
```

### Environment Variables for Docker

Create a `.env` file in the project root with your configuration.

## ☁️ Cloud Deployment

### Frontend Deployment (Vercel) - ✅ Auto-Configured

**Automatic Deployment:**
- Push to GitHub → Automatic Vercel deployment
- No manual configuration needed
- Environment variables configured in Vercel dashboard

**Manual Setup (if needed):**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key
3. Deploy automatically on push to main branch

### Backend Deployment (Railway)

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Custom Server Deployment

1. Build the Docker image
2. Deploy to your preferred cloud provider
3. Configure environment variables
4. Set up reverse proxy (nginx configuration included)

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse with configurable rate limits
- **Input Validation**: Comprehensive input validation and sanitization
- **Authentication**: JWT-based authentication with Supabase
- **CORS Protection**: Configurable CORS policies
- **Security Headers**: Helmet.js for security headers
- **File Validation**: ZIP file validation and security checks
- **Directory Traversal Protection**: Prevents path traversal attacks

## 📊 Monitoring & Analytics

- **Application Analytics**: Track app usage and performance
- **API Usage**: Monitor API calls and response times
- **Error Logging**: Comprehensive error logging with Winston
- **Health Checks**: Built-in health check endpoints
- **Performance Metrics**: Response time and throughput monitoring

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | - |
| `REDIS_URL` | Upstash Redis URL | No | - |
| `REDIS_TOKEN` | Upstash Redis token | No | - |
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment | No | development |
| `API_BASE_URL` | API base URL | No | http://localhost:3000/api |
| `MAX_FILE_SIZE` | Maximum upload size | No | 50MB |
| `JWT_SECRET` | JWT secret key | Yes | - |
| `CORS_ORIGIN` | CORS origin | No | http://localhost:3000 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🗺️ Roadmap

### ✅ **Completed Features**
- [x] **Next.js Migration** - Complete frontend migration to Next.js with TypeScript
- [x] **Modern UI/UX** - Professional dashboard with glassmorphism effects
- [x] **Auto-Deployment** - Automatic Vercel deployment on GitHub push
- [x] **GitHub Integration** - OAuth connection and repository management
- [x] **Enhanced Project Cards** - Modern design with gradients and animations
- [x] **TypeScript Integration** - Full type safety and better development experience
- [x] **ESLint Configuration** - Code quality and consistency enforcement
- [x] **Collapsible Sidebar** - Modern sidebar with collapse/expand functionality
- [x] **View Toggle System** - Grid and list view options for projects
- [x] **Compact Project Cards** - Optimized card sizing and spacing
- [x] **Responsive Design** - Fully responsive across all device sizes
- [x] **Authentication Flash Fix** - Smooth loading state prevents login page flash
- [x] **Hover Effects Optimization** - Fixed card hover cutoff issues
- [x] **Enhanced Spacing** - Improved spacing between sidebar and main content
- [x] **Status Tag Styling** - Proper styling for deployed status tags
- [x] **GitHub Status Integration** - Compact GitHub status display in sidebar
- [x] **File Analysis System** - Hierarchical file tree with VS Code-like interface
- [x] **Project Analysis Engine** - Comprehensive project analysis with framework detection
- [x] **Framework Detection Fix** - Fixed Angular false positives by filtering node_modules
- [x] **Resizable Panels** - Drag-to-resize functionality for file tree and code preview
- [x] **Code Preview System** - Full file content preview with syntax highlighting
- [x] **Authentication Token Fix** - Resolved 401 errors with proper token validation
- [x] **UI Spacing Optimization** - Reduced gaps and improved compact layout
- [x] **Code Header Spacing** - Fixed collapsing logo and text in code area headers

### 🚧 **In Progress**
- [ ] **Complete BaaS Pipeline** - Transform any frontend into full-stack app
- [ ] **Project-Specific APIs** - Dynamic endpoints per project
- [ ] **Enhanced SDK** - Project-specific API client with automatic injection

### 📋 **Planned Features**
- [ ] **Multi-tenant support** - Support for multiple organizations
- [ ] **Advanced analytics dashboard** - Detailed usage and performance metrics
- [ ] **Custom API endpoint creation** - User-defined API endpoints
- [ ] **Database schema management** - Dynamic database schema generation
- [ ] **Webhook support** - Real-time notifications and integrations
- [ ] **Advanced caching strategies** - Intelligent caching and optimization
- [ ] **Performance optimization** - Advanced performance monitoring
- [ ] **Mobile app support** - React Native and mobile framework support

## 🙏 Acknowledgments

- Supabase for providing excellent backend services
- Upstash for Redis hosting
- Vercel and Railway for deployment platforms
- The open-source community for amazing tools and libraries
