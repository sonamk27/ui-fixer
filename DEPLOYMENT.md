# Vercel Deployment Guide

## 🚀 Deploy UI Fixer to Vercel

This guide will help you deploy the UI Fixer application to Vercel with both frontend and backend.

### 📋 Prerequisites

- Vercel account
- GitHub account (recommended)
- Environment variables for backend API keys

### 🔧 Project Structure

```
ui-fixer/
├── frontend/          # React frontend (Vite)
├── backend/           # Express.js backend
├── vercel.json        # Vercel configuration
├── package.json       # Main package.json
└── DEPLOYMENT.md      # This guide
```

### ⚙️ Configuration Files

#### 1. vercel.json
- Configures frontend build output directory
- Routes API requests to backend
- Sets up serverless functions

#### 2. package.json
- Contains build script: `DISABLE_ESLINT_PLUGIN=true npx vite build`
- Includes vercel-build script for deployment

### 🌐 Deployment Steps

#### Method 1: Via Vercel Dashboard

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```
   Build Command: npm run vercel-build
   Output Directory: build
   Install Command: npm install
   ```

3. **Set Environment Variables**
   Go to Settings → Environment Variables and add:
   ```
   NODE_ENV=production
   PORT=5005
   FRONTEND_URL=https://your-app-name.vercel.app
   OPENAI_API_KEY=your_openai_api_key_here (optional)
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

#### Method 2: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Project**
   ```bash
   vercel
   ```

4. **Configure Environment Variables**
   ```bash
   vercel env add NODE_ENV
   vercel env add PORT
   vercel env add FRONTEND_URL
   vercel env add OPENAI_API_KEY
   ```

### 🔑 Required Environment Variables

#### Backend Variables
```env
NODE_ENV=production
PORT=5005
FRONTEND_URL=https://your-app-name.vercel.app

# Optional - for AI integration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-vision-preview

# Optional - MongoDB
MONGODB_URI=your_mongodb_connection_string
```

### 📁 File Upload Configuration

The backend handles file uploads using multer. For Vercel deployment:

1. **File Storage**: Uses temporary storage for uploaded images
2. **Max File Size**: 10MB (configurable via `MAX_FILE_SIZE`)
3. **Supported Formats**: JPG, PNG, GIF, WebP

### 🛠️ Build Process

1. **Frontend Build**
   - Vite builds React app to `build/` directory
   - Static assets are optimized
   - Environment variables are injected

2. **Backend Build**
   - Express.js server is packaged as serverless function
   - Dependencies are installed
   - API routes are configured

### 🔄 API Routes

After deployment, your API will be available at:
```
https://your-app-name.vercel.app/api/analyze
https://your-app-name.vercel.app/api/upload
https://your-app-name.vercel.app/api/results/:id
```

### 🐛 Troubleshooting

#### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `dependencies` (not `devDependencies`)
   - Verify build script works locally: `npm run build`

2. **API Errors**
   - Ensure environment variables are set correctly
   - Check that backend routes are properly configured in vercel.json

3. **File Upload Issues**
   - Verify file size limits
   - Check that multipart/form-data is properly handled

4. **CORS Issues**
   - Set `FRONTEND_URL` to your Vercel app URL
   - Check CORS configuration in backend

#### Debug Commands

```bash
# Check build locally
npm run build

# Test backend locally
cd backend && npm start

# Check Vercel logs
vercel logs
```

### 📊 Performance Optimization

1. **Frontend**
   - Images are optimized by Vercel
   - Static files are cached automatically
   - CDN is configured automatically

2. **Backend**
   - Serverless functions scale automatically
   - Rate limiting is configured
   - Request/response size limits are set

### 🔄 Continuous Deployment

Once connected to GitHub, Vercel will automatically:

- Deploy on every push to main branch
- Create preview URLs for pull requests
- Roll back on failed deployments

### 📱 Mobile Compatibility

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

### 🔒 Security Considerations

1. **API Keys**: Store in Vercel environment variables
2. **File Uploads**: Validate file types and sizes
3. **Rate Limiting**: Configured in backend middleware
4. **CORS**: Properly configured for your domain

### 📈 Monitoring

Vercel provides built-in monitoring for:
- Build status
- Function invocations
- Error logs
- Performance metrics

### 🆘 Support

If you encounter issues:

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review deployment logs in Vercel dashboard
3. Test locally before deploying
4. Check environment variables configuration

---

**Happy Deploying! 🚀**
