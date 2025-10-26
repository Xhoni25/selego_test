# Deployment Guide

This guide covers deploying the Expense Manager application to various platforms.

## Prerequisites

- GitHub repository with your code
- MongoDB database (Atlas recommended for production)
- External service accounts (OpenAI, Email service)

## Backend Deployment

### Option 1: Railway

1. **Create Railway Account**

   - Go to [Railway](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**

   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `api` folder as root directory

3. **Configure Environment Variables**

   - Go to your project settings
   - Add all variables from `api/env.example`
   - Set `NODE_ENV=production`
   - Update `CLIENT_URL` to your frontend URL

4. **Deploy**
   - Railway will automatically build and deploy
   - Get your backend URL from the dashboard

### Option 2: Heroku

1. **Install Heroku CLI**

   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**

   ```bash
   cd api
   heroku create your-app-name
   ```

3. **Set Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set OPENAI_API_KEY=your-openai-key
   heroku config:set EMAIL_HOST=your-email-host
   heroku config:set EMAIL_PORT=587
   heroku config:set EMAIL_USER=your-email
   heroku config:set EMAIL_PASS=your-email-password
   heroku config:set FROM_EMAIL=your-from-email
   heroku config:set CLIENT_URL=your-frontend-url
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 3: DigitalOcean App Platform

1. **Create DigitalOcean Account**

   - Go to [DigitalOcean](https://www.digitalocean.com)
   - Sign up and verify account

2. **Create New App**

   - Go to Apps section
   - Click "Create App"
   - Connect your GitHub repository
   - Select the `api` folder

3. **Configure App**

   - Set build command: `npm install`
   - Set run command: `npm start`
   - Add environment variables

4. **Deploy**
   - Click "Create Resources"
   - Wait for deployment to complete

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Create Vercel Account**

   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**

   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `app`

3. **Configure Build Settings**

   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Set Environment Variables**

   - Add `VITE_API_URL` with your backend URL
   - Example: `https://your-backend.railway.app`

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Option 2: Netlify

1. **Create Netlify Account**

   - Go to [Netlify](https://netlify.com)
   - Sign up with GitHub

2. **Create New Site**

   - Click "New site from Git"
   - Connect your repository
   - Set base directory to `app`

3. **Configure Build Settings**

   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set Environment Variables**

   - Go to Site settings > Environment variables
   - Add `VITE_API_URL`

5. **Deploy**
   - Click "Deploy site"

### Option 3: GitHub Pages

1. **Update Vite Config**

   ```javascript
   // app/vite.config.js
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/',
     build: {
       outDir: 'dist',
     },
   });
   ```

2. **Add GitHub Actions**
   Create `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '18'
         - run: cd app && npm install
         - run: cd app && npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./app/dist
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to Pages section
   - Select "GitHub Actions" as source

## Environment Configuration

### Production Environment Variables

**Backend (.env)**

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-manager
JWT_SECRET=your-super-secure-jwt-secret
OPENAI_API_KEY=sk-your-openai-api-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
CLIENT_URL=https://your-frontend-domain.com
```

**Frontend (.env)**

```env
VITE_API_URL=https://your-backend-domain.com
```

## Database Setup

### MongoDB Atlas (Production)

1. **Create Production Cluster**

   - Use M2 or higher tier for production
   - Enable backup and monitoring
   - Set up proper security groups

2. **Configure Security**

   - Create database user with limited permissions
   - Whitelist only your server IPs
   - Enable IP whitelist for your deployment platform

3. **Set Up Monitoring**
   - Enable Atlas monitoring
   - Set up alerts for performance issues
   - Configure backup retention

## SSL/HTTPS Setup

### Automatic SSL (Recommended)

- Vercel, Netlify, and Railway provide automatic SSL
- No additional configuration needed

### Manual SSL Setup

1. **Get SSL Certificate**

   - Use Let's Encrypt (free)
   - Or purchase from certificate authority

2. **Configure Server**
   - Update server to use HTTPS
   - Redirect HTTP to HTTPS
   - Set secure headers

## Domain Configuration

### Custom Domain Setup

1. **Purchase Domain**

   - Buy domain from registrar (Namecheap, GoDaddy, etc.)

2. **Configure DNS**

   - Point A record to your server IP
   - Or use CNAME for subdomain

3. **Update Application**
   - Update `CLIENT_URL` in backend
   - Update `VITE_API_URL` in frontend
   - Update CORS settings

## Monitoring and Logging

### Application Monitoring

1. **Error Tracking**

   - Use Sentry for error monitoring
   - Set up alerts for critical errors

2. **Performance Monitoring**

   - Use New Relic or DataDog
   - Monitor response times and throughput

3. **Uptime Monitoring**
   - Use UptimeRobot or Pingdom
   - Set up alerts for downtime

### Logging

1. **Backend Logging**

   - Use Winston or similar logging library
   - Log errors, warnings, and info messages
   - Set up log rotation

2. **Frontend Logging**
   - Use console logging for development
   - Send errors to monitoring service in production

## Security Considerations

### Backend Security

1. **Environment Variables**

   - Never commit `.env` files
   - Use secure secret management
   - Rotate secrets regularly

2. **API Security**

   - Implement rate limiting
   - Use HTTPS only
   - Validate all inputs
   - Sanitize user data

3. **Database Security**
   - Use strong passwords
   - Enable authentication
   - Restrict network access
   - Regular security updates

### Frontend Security

1. **Content Security Policy**

   - Set up CSP headers
   - Prevent XSS attacks
   - Restrict resource loading

2. **API Security**
   - Use HTTPS for all API calls
   - Implement proper error handling
   - Don't expose sensitive data

## Backup Strategy

### Database Backups

1. **MongoDB Atlas**

   - Automatic daily backups
   - Point-in-time recovery
   - Cross-region replication

2. **Manual Backups**
   ```bash
   mongodump --uri="mongodb+srv://..." --out=backup/
   ```

### Application Backups

1. **Code Repository**

   - Use Git for version control
   - Regular commits and pushes
   - Tag releases

2. **Configuration Backups**
   - Document all environment variables
   - Keep configuration files in version control
   - Regular configuration reviews

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**

   - Use cloud load balancer
   - Distribute traffic across instances
   - Health checks and failover

2. **Database Scaling**
   - Use MongoDB Atlas auto-scaling
   - Read replicas for read-heavy workloads
   - Sharding for large datasets

### Vertical Scaling

1. **Server Resources**

   - Monitor CPU and memory usage
   - Upgrade server specifications
   - Optimize application performance

2. **Database Resources**
   - Monitor query performance
   - Add indexes as needed
   - Optimize database queries

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**

   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for syntax errors

2. **Environment Variables**

   - Verify all required variables are set
   - Check variable names and values
   - Test with different environments

3. **Database Connection**

   - Verify MongoDB connection string
   - Check network connectivity
   - Verify authentication credentials

4. **CORS Issues**
   - Update CORS settings in backend
   - Verify frontend URL configuration
   - Check for trailing slashes

### Performance Issues

1. **Slow Response Times**

   - Check database query performance
   - Monitor server resources
   - Optimize API endpoints

2. **High Memory Usage**
   - Check for memory leaks
   - Optimize data structures
   - Monitor garbage collection

## Maintenance

### Regular Tasks

1. **Security Updates**

   - Update dependencies regularly
   - Apply security patches
   - Monitor security advisories

2. **Performance Monitoring**

   - Review performance metrics
   - Optimize slow queries
   - Update resource allocation

3. **Backup Verification**
   - Test backup restoration
   - Verify backup integrity
   - Update backup procedures

### Monitoring Checklist

- [ ] Application is responding
- [ ] Database is accessible
- [ ] External services are working
- [ ] SSL certificates are valid
- [ ] Error rates are within limits
- [ ] Performance metrics are normal

For additional help, refer to the platform-specific documentation or create an issue in the repository.
