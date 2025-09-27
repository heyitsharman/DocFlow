# Quick Deploy Commands

## Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

## Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd Backend
railway deploy
```

## Backend (Render Alternative)
```bash
# Create render.yaml in Backend folder
echo "services:
  - type: web
    name: docflow-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production" > Backend/render.yaml
```

## Environment Variables Needed

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docflow
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
```