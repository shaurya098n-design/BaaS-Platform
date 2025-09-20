# Deployment Guide

This guide covers various deployment options for the Frontend + Backend Deployment Automation Platform.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended for Beginners)

1. **Fork the Repository**
   ```bash
   # Fork this repository on GitHub
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your forked repository

3. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   REDIS_URL=your_redis_url (optional)
   REDIS_TOKEN=your_redis_token (optional)
   API_BASE_URL=https://your-app.vercel.app/api
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=https://your-app.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-app.vercel.app`

### Option 2: Railway

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Environment Variables**
   In Railway dashboard, add the same environment variables as above.

3. **Deploy**
   - Railway will automatically deploy your app
   - Your app will be available at `https://your-app.railway.app`

### Option 3: Docker + Custom Server

1. **Prepare Your Server**
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

2. **Clone and Configure**
   ```bash
   git clone <your-repo-url>
   cd frontend-backend-deployment-platform
   
   # Copy environment file
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Configure Nginx (Optional)**
   ```bash
   # Install nginx
   sudo apt install nginx -y
   
   # Copy nginx configuration
   sudo cp nginx.conf /etc/nginx/sites-available/frontend-backend-platform
   sudo ln -s /etc/nginx/sites-available/frontend-backend-platform /etc/nginx/sites-enabled/
   
   # Restart nginx
   sudo systemctl restart nginx
   ```

## 🔧 Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready
4. Note down your project URL and API keys

### 2. Set Up Database

1. Go to the SQL Editor in your Supabase dashboard
2. Run the schema creation script:
   ```sql
   -- Copy and paste the contents of database/schema.sql
   ```
3. Run the seed script:
   ```sql
   -- Copy and paste the contents of database/seed.sql
   ```

### 3. Configure Storage

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `frontend-apps`
3. Set the bucket to public if you want public access to deployed apps
4. Configure RLS policies as needed

### 4. Set Up Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL (your deployed app URL)
3. Add redirect URLs for OAuth providers if needed
4. Enable email confirmations if desired

## 🔴 Redis Setup (Optional)

### Using Upstash Redis

1. Go to [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Note down the Redis URL and token
4. Add these to your environment variables

### Using Self-Hosted Redis

1. Install Redis on your server:
   ```bash
   sudo apt install redis-server -y
   ```

2. Configure Redis:
   ```bash
   sudo nano /etc/redis/redis.conf
   # Set bind 127.0.0.1 to bind 0.0.0.0 for external access
   # Set requirepass your_password
   ```

3. Restart Redis:
   ```bash
   sudo systemctl restart redis-server
   ```

4. Update your environment variables:
   ```
   REDIS_URL=redis://your_server:6379
   REDIS_TOKEN=your_password
   ```

## 🌐 Domain and SSL Setup

### Using Cloudflare (Recommended)

1. Add your domain to Cloudflare
2. Point your domain to your deployment URL
3. Enable SSL/TLS encryption
4. Configure caching rules

### Using Let's Encrypt

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. Get SSL certificate:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. Auto-renewal:
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## 📊 Monitoring Setup

### Health Checks

The application includes built-in health checks:

- `GET /health` - Basic health check
- `GET /api/health` - API health check

### Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (error logs only)

### Monitoring with Uptime Robot

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add a new monitor
3. Set URL to `https://your-domain.com/health`
4. Set monitoring interval to 5 minutes

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use strong, unique passwords and secrets
- Rotate secrets regularly
- Use different secrets for different environments

### Database Security

- Enable RLS (Row Level Security) in Supabase
- Use service role key only on the server
- Regularly backup your database
- Monitor database access logs

### API Security

- Enable rate limiting
- Use HTTPS in production
- Implement proper CORS policies
- Validate all inputs
- Use authentication for sensitive endpoints

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check Supabase URL and keys
   - Verify database is running
   - Check network connectivity

2. **File Upload Issues**
   - Check file size limits
   - Verify file type restrictions
   - Check storage permissions

3. **Authentication Problems**
   - Verify JWT secret
   - Check Supabase auth configuration
   - Ensure proper CORS settings

4. **Redis Connection Issues**
   - Check Redis URL and credentials
   - Verify Redis server is running
   - Check firewall settings

### Debug Mode

Enable debug mode by setting:
```
NODE_ENV=development
DEBUG=*
```

### Logs

Check application logs:
```bash
# Docker
docker-compose logs -f app

# Direct
tail -f logs/combined.log
```

## 📈 Performance Optimization

### Caching

- Enable Redis caching for better performance
- Configure appropriate cache TTL values
- Use CDN for static assets

### Database Optimization

- Add appropriate indexes
- Use connection pooling
- Monitor query performance

### File Serving

- Use nginx for static file serving
- Enable gzip compression
- Configure proper cache headers

## 🔄 Backup and Recovery

### Database Backup

```bash
# Supabase provides automatic backups
# For manual backup, use pg_dump
pg_dump your_database_url > backup.sql
```

### File Backup

```bash
# Backup uploaded files
tar -czf files_backup.tar.gz static/
```

### Recovery

1. Restore database from backup
2. Restore files from backup
3. Update environment variables
4. Restart application

## 📞 Support

If you encounter issues:

1. Check the logs first
2. Review this deployment guide
3. Check GitHub issues
4. Create a new issue with detailed information

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database schema created
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Security measures in place
- [ ] Performance optimization applied
- [ ] Error handling tested
- [ ] Health checks working
