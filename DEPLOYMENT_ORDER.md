# DocFlow Deployment Order Guide

## Phase 1: Backend Deployment (Railway)

### Manual Deployment:
1. Visit https://railway.app
2. Connect GitHub account  
3. Import repository: heyitsharman/DocFlow
4. Set root directory: `/Backend`
5. Add environment variables:
   - NODE_ENV=production
   - MONGODB_URI=your_connection_string
   - JWT_SECRET=your_secret_key
   - PORT=$PORT (Railway provides this automatically)

### Get Your Backend URL:
After deployment, Railway will provide a URL like:
`https://docflow-backend-production.railway.app`

---

## Phase 2: Update Frontend Configuration

Replace the API URL in frontend/.env.local:
```
NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_URL.railway.app/api
```

---

## Phase 3: Frontend Deployment (Vercel)

### Manual Deployment:
1. Visit https://vercel.com
2. Import from GitHub: heyitsharman/DocFlow  
3. Configure:
   - Framework: Next.js
   - Root Directory: `frontend`
4. Add environment variable:
   - NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_URL.railway.app/api
5. Deploy

---

## Testing Your Deployment

1. Visit your Vercel frontend URL
2. Try to register/login
3. Test document upload
4. Verify admin functions work

If API calls fail, check:
- Railway backend is running
- Environment variables are correct
- CORS is configured for your frontend domain