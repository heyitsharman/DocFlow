# Environment Variables Guide

## Backend Environment Variables (Backend/.env)

### Required Variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS (for production)
FRONTEND_URL=http://localhost:3000
```

### Production Additional Variables:
```env
# Production Settings
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app

# Security
JWT_SECRET=very_long_random_string_for_production

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

## Frontend Environment Variables (frontend/.env.local)

### Required Variables:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Production Variables:
```env
# Production API
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app/api
```

## Platform-Specific Instructions:

### Railway (Backend Deployment):
1. Go to Railway dashboard
2. Select your project
3. Go to "Variables" tab
4. Add all backend environment variables

### Vercel (Frontend Deployment):
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add frontend environment variables

### MongoDB Atlas:
1. Go to MongoDB Atlas dashboard
2. Navigate to Database → Connect
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Use this as your MONGODB_URI

## Security Best Practices:

1. **Never commit .env files to Git**
2. **Use different secrets for development and production**
3. **Keep JWT secrets long and random (32+ characters)**
4. **Use environment-specific MongoDB databases**
5. **Set NODE_ENV correctly for each environment**

## File Structure:
```
Backend/
├── .env                    # Backend environment variables
├── .env.example           # Template (safe to commit)
└── server.js

frontend/
├── .env.local             # Frontend environment variables
├── .env.example           # Template (safe to commit)
└── next.config.ts
```