@echo off
REM Deploy script for DocFlow Pro (Windows)

echo 🚀 Starting DocFlow Pro Deployment...

REM Frontend deployment to Vercel
echo 📦 Building frontend...
cd frontend
npm run build

echo 🌐 Deploying frontend to Vercel...
vercel --prod

REM Go back to root
cd ..

echo ✅ Frontend deployed successfully!
echo 🔗 Your frontend is now live!

echo.
echo 📝 Next steps:
echo 1. Deploy your backend to Railway/Render/Heroku
echo 2. Update NEXT_PUBLIC_API_URL in Vercel environment variables
echo 3. Test the full application

pause