# DocFlow Pro Deployment Checklist

## Pre-Deployment
- [ ] MongoDB Atlas cluster is set up and accessible
- [ ] JWT secret is generated (minimum 32 characters)
- [ ] Environment variables are prepared
- [ ] Code is pushed to GitHub

## Frontend Deployment (Vercel)
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Configure environment variables:
  - [ ] NEXT_PUBLIC_API_URL
- [ ] Deploy and test

## Backend Deployment (Railway)
- [ ] Create Railway account
- [ ] Import GitHub repository
- [ ] Set root directory to `Backend`
- [ ] Configure environment variables:
  - [ ] NODE_ENV=production
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] PORT (Railway provides this)
- [ ] Deploy and test

## Post-Deployment Testing
- [ ] Frontend loads correctly
- [ ] Backend API health check works
- [ ] User registration works
- [ ] User login works
- [ ] Document upload works
- [ ] Admin functions work
- [ ] Database connectivity confirmed

## Domain & SSL (Optional)
- [ ] Configure custom domain
- [ ] SSL certificates (auto-configured on Vercel/Railway)

## Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics
- [ ] Monitor database usage
- [ ] Monitor API performance