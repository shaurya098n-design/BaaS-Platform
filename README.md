# Frontend + Backend Deployment Automation Platform

A comprehensive platform that automatically deploys frontend applications and provides pre-built backend APIs with zero configuration required.

## 🚀 Features

- **One-Click Deployment**: Upload any frontend app (React, Vue, Angular, or vanilla HTML/CSS/JS) as a ZIP file
- **Automatic API Injection**: Automatically injects API configuration into your frontend code
- **Pre-built Backend APIs**: Ready-to-use authentication, CRUD, and search APIs
- **Supabase Integration**: Built-in authentication, storage, and database
- **Redis Caching**: High-performance caching with Upstash Redis
- **Static File Serving**: Automatic static file hosting with CDN-like performance
- **Framework Detection**: Automatically detects and configures your frontend framework
- **Custom Domains**: Support for custom domains and SSL
- **Analytics**: Built-in usage analytics and monitoring
- **CI/CD Ready**: GitHub Actions integration for automated deployments

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Supabase      │
│   Upload        │───▶│   Server        │───▶│   Services      │
│   (ZIP File)    │    │   (Express.js)  │    │   (Auth/DB/Storage)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   (Upstash)     │
                       └─────────────────┘
```

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Caching**: Upstash Redis
- **File Processing**: yauzl, fs-extra
- **Deployment**: Vercel, Railway, Docker
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 18+
- Supabase account
- Upstash Redis account (optional)
- Vercel/Railway account for deployment

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

### 5. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

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

### Deploy a React App

```bash
curl -X POST http://localhost:3000/api/upload/deploy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "frontend=@my-react-app.zip" \
  -F "appName=My React App"
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

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Railway Deployment

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

- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] Custom API endpoint creation
- [ ] Database schema management
- [ ] Webhook support
- [ ] Advanced caching strategies
- [ ] Performance optimization
- [ ] Mobile app support

## 🙏 Acknowledgments

- Supabase for providing excellent backend services
- Upstash for Redis hosting
- Vercel and Railway for deployment platforms
- The open-source community for amazing tools and libraries
