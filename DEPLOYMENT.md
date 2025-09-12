# HealthCare+ Deployment Guide

This guide provides detailed instructions for deploying the HealthCare+ platform to various hosting providers.

## 🏗️ Pre-Deployment Checklist

### Backend Preparation
- [ ] All environment variables configured
- [ ] MongoDB database set up (local or cloud)
- [ ] Email service configured for OTP
- [ ] API endpoints tested
- [ ] Security middleware configured
- [ ] Error handling implemented

### Frontend Preparation
- [ ] API service configured to point to backend
- [ ] Environment variables set
- [ ] Build process tested
- [ ] All components working with backend
- [ ] Responsive design verified

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose a cloud provider (AWS, Google Cloud, Azure)
   - Select a region close to your users
   - Choose M0 (free tier) for development

3. **Configure Database Access**
   - Create a database user with read/write permissions
   - Add your IP address to the IP whitelist (or 0.0.0.0/0 for all IPs)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Local MongoDB (Development)

```bash
# Install MongoDB Community Edition
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod

# Default connection: mongodb://localhost:27017/healthcare_db
```

## 🚀 Backend Deployment Options

### Option 1: Heroku (Easiest)

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd backend
   heroku create your-healthcare-backend
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/healthcare_db"
   heroku config:set JWT_SECRET="your-super-secret-jwt-key"
   heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
   heroku config:set EMAIL_HOST="smtp.gmail.com"
   heroku config:set EMAIL_PORT=587
   heroku config:set EMAIL_USER="your-email@gmail.com"
   heroku config:set EMAIL_PASS="your-app-password"
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Verify Deployment**
   ```bash
   heroku open
   # Visit https://your-app.herokuapp.com/health
   ```

### Option 2: Railway

1. **Connect GitHub Repository**
   - Go to [Railway](https://railway.app)
   - Sign up and connect your GitHub account
   - Import your repository

2. **Configure Environment Variables**
   - In Railway dashboard, go to Variables tab
   - Add all required environment variables

3. **Deploy**
   - Railway automatically deploys on git push
   - Monitor deployment in the dashboard

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Create new app from GitHub repository

2. **Configure Build Settings**
   - Source Directory: `backend`
   - Build Command: `npm install`
   - Run Command: `npm start`

3. **Set Environment Variables**
   - Add all required environment variables in the app settings

4. **Deploy**
   - DigitalOcean automatically builds and deploys

### Option 4: AWS EC2 (Advanced)

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - Configure security groups (ports 22, 80, 443, 5000)

2. **Connect and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Clone repository
   git clone your-repo-url
   cd healthcare-platform/backend
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   # Add all environment variables
   
   # Start with PM2
   pm2 start server.js --name healthcare-backend
   pm2 startup
   pm2 save
   ```

3. **Setup Nginx (Optional)**
   ```bash
   sudo apt install nginx
   
   # Create Nginx config
   sudo nano /etc/nginx/sites-available/healthcare
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/healthcare /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 🌐 Frontend Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard
   - Add `VITE_API_URL=https://your-backend-domain.com/api`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Build Project**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Drag & Drop**
   - Go to [Netlify](https://netlify.com)
   - Drag the `dist` folder to deploy

3. **Set Environment Variables**
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add `VITE_API_URL=https://your-backend-domain.com/api`

4. **Redeploy**
   - Netlify automatically redeploys on git push

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/healthcare-platform",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 4: AWS S3 + CloudFront

1. **Build Project**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**
   - Enable static website hosting
   - Upload `dist` folder contents

3. **Setup CloudFront**
   - Create CloudFront distribution
   - Point to S3 bucket
   - Configure custom domain (optional)

## 🔧 Environment Variables Reference

### Backend (.env)
```env
# Required
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/healthcare_db
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
FRONTEND_URL=https://your-frontend-domain.com

# Email (Required for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## 🔒 Security Considerations

### SSL/HTTPS Setup
- Use Let's Encrypt for free SSL certificates
- Configure HTTPS redirects
- Update CORS settings for HTTPS

### Environment Security
- Never commit `.env` files to git
- Use strong, unique JWT secrets
- Rotate secrets regularly
- Use app-specific passwords for email

### Database Security
- Use MongoDB Atlas for managed security
- Enable authentication
- Use connection string with credentials
- Whitelist specific IP addresses

## 📊 Monitoring and Logging

### Backend Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs healthcare-backend

# Restart if needed
pm2 restart healthcare-backend
```

### Health Checks
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor `/health` endpoint
- Set up alerts for downtime

### Error Tracking
- Integrate Sentry for error tracking
- Set up log aggregation (LogRocket, DataDog)
- Monitor API response times

## 🚀 CI/CD Pipeline (Optional)

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
          appdir: "backend"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
```

## 🔄 Post-Deployment Testing

### API Testing
```bash
# Test health endpoint
curl https://your-backend-domain.com/health

# Test API endpoints
curl -X POST https://your-backend-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Frontend Testing
- Verify all pages load correctly
- Test user registration and login
- Test API integration
- Verify responsive design on mobile

### End-to-End Testing
- Complete user registration flow
- Medication management workflow
- Appointment booking process
- Family connection setup
- Notification system

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL environment variable
   - Verify CORS configuration in backend

2. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **Email/OTP Issues**
   - Verify email credentials
   - Check app-specific password for Gmail
   - Test email connectivity

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Getting Help
- Check application logs
- Review environment variables
- Test API endpoints individually
- Verify database connectivity
- Check network and firewall settings

## 📈 Scaling Considerations

### Backend Scaling
- Use load balancers for multiple instances
- Implement database connection pooling
- Consider microservices architecture
- Use Redis for session management

### Frontend Scaling
- Use CDN for static assets
- Implement code splitting
- Optimize bundle size
- Use service workers for caching

### Database Scaling
- Use MongoDB sharding
- Implement read replicas
- Optimize database queries
- Consider database indexing

This deployment guide should help you successfully deploy the HealthCare+ platform to production. Choose the deployment option that best fits your needs and technical expertise.
