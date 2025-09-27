# DocFlow Pro - Deployment Guide

## Frontend Deployment (Vercel)

### Quick Deploy
```bash
# Deploy frontend to Vercel
cd frontend
vercel --prod
```

### Manual Setup
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

## Backend Deployment Options

### Option 1: Railway
1. Visit [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select Backend folder as root
4. Add environment variables
5. Deploy

### Option 2: Render
1. Visit [render.com](https://render.com)
2. Connect GitHub repository
3. Create new Web Service
4. Set build command: `cd Backend && npm install`
5. Set start command: `cd Backend && npm start`

### Option 3: Heroku
```bash
# Install Heroku CLI and login
heroku create docflow-backend
git subtree push --prefix Backend heroku main
```

## Database (MongoDB Atlas)
- Already configured for production
- Update connection string in deployment environment

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
```

## Full Stack Options

### Vercel + Railway
- Frontend: Vercel (Next.js optimized)
- Backend: Railway (Node.js)
- Database: MongoDB Atlas

### Netlify + Render
- Frontend: Netlify
- Backend: Render
- Database: MongoDB Atlas

### DigitalOcean App Platform
- Deploy both frontend and backend together
- Single platform management