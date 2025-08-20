# Funny Yellow - Production Deployment Guide

This guide covers deploying Funny Yellow sticker platform to production.

## Prerequisites

- Docker installed
- Supabase project set up
- Environment variables configured

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Update production environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Database Setup

1. **Run the database setup SQL:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `lib/database.sql`
   - Execute the commands

2. **Upload stickers to Supabase:**
   ```bash
   npm run upload-stickers
   ```

## Deployment Options

### Option 1: Docker (Recommended)

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

2. **Check health:**
   ```bash
   curl http://localhost:3000/api/health
   ```

### Option 2: Manual Build

1. **Install dependencies:**
   ```bash
   npm ci --only=production
   ```

2. **Build the application:**
   ```bash
   npm run prepare-production
   ```

3. **Start the production server:**
   ```bash
   npm start
   ```

## Performance Optimization

The application includes several performance optimizations:

- **Image Optimization**: Automatic WebP/AVIF conversion and responsive loading
- **Adaptive Loading**: Quality adjustment based on network conditions
- **Caching**: 24-hour cache TTL for images
- **Compression**: Gzip/Brotli compression enabled
- **Security Headers**: CSP, X-Frame-Options, etc.

## Monitoring

### Health Check
- Endpoint: `/api/health`
- Checks database and storage connectivity
- Returns JSON health status

### Performance Monitoring
- Built-in Web Vitals monitoring in development
- Core metrics: CLS, LCP, FCP tracking
- Console logging of performance data

## Production Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Stickers uploaded to Supabase
- [ ] DNS configured (if using custom domain)
- [ ] SSL certificate configured
- [ ] Health checks passing
- [ ] Performance metrics within acceptable ranges

## Scaling Considerations

### For high traffic:
1. **CDN**: Use Cloudflare or similar for static assets
2. **Caching**: Implement Redis for API responses
3. **Database**: Enable read replicas in Supabase
4. **Monitoring**: Add Sentry or similar for error tracking

### Resource Requirements:
- **Memory**: 512MB minimum, 1GB recommended
- **CPU**: 1 vCPU minimum, 2 vCPU recommended
- **Storage**: 10GB minimum for Docker images and cache

## Troubleshooting

### Common Issues:

1. **Image loading failures:**
   - Check Supabase storage bucket permissions
   - Verify CORS settings in Supabase

2. **Database connection errors:**
   - Validate environment variables
   - Check Supabase project status

3. **Performance issues:**
   - Enable performance monitoring
   - Check network conditions
   - Review image optimization settings

### Logs:
```bash
# Docker logs
docker-compose logs -f

# Application logs
npm run dev # with DEBUG=* for detailed logs
```

## Security

The application includes:
- Security headers (CSP, X-Frame-Options, etc.)
- Input validation and sanitization
- Rate limiting (can be added with nginx)
- HTTPS enforcement (configure in reverse proxy)

## Backup Strategy

1. **Database**: Supabase provides automatic backups
2. **Storage**: Supabase storage is replicated
3. **Code**: Git repository serves as backup

## Updates

To update the application:

1. Pull latest changes
2. Rebuild Docker image: `docker-compose up -d --build`
3. Run database migrations if any
4. Verify health checks

---

For support, check the application logs and Supabase dashboard for any issues.