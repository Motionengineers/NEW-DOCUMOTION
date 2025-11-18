# 🚀 Deployment Checklist - Documotion

**Last Updated**: 2024-11-18  
**Status**: Ready for Deployment

---

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All code committed to Git
- [ ] No sensitive data in code (API keys, passwords)
- [ ] `.env` file in `.gitignore`
- [ ] Build passes locally: `npm run build`
- [ ] No linter errors: `npm run lint`
- [ ] All tests pass: `npm test`

### 2. Database Setup
- [ ] Choose database provider:
  - [ ] **SQLite** (for development/testing)
  - [ ] **PostgreSQL** (for production - recommended)
    - [ ] Supabase account created
    - [ ] Neon account created
    - [ ] Database connection string ready

### 3. Environment Variables
- [ ] `DATABASE_URL` - Database connection string
- [ ] `NEXTAUTH_URL` - Production URL (e.g., `https://your-app.vercel.app`)
- [ ] `NEXTAUTH_SECRET` - Secure random string
- [ ] `OPENAI_API_KEY` - (Optional) For AI features
- [ ] `RAZORPAY_KEY_ID` - (Optional) For payments
- [ ] `RAZORPAY_KEY_SECRET` - (Optional) For payments
- [ ] `RESEND_API_KEY` - (Optional) For emails
- [ ] `GITHUB_TOKEN` - (Optional) For GitHub API
- [ ] `UNSPLASH_ACCESS_KEY` - (Optional) For images

### 4. Build Configuration
- [ ] `package.json` has correct build script
- [ ] `next.config.js` configured
- [ ] Prisma generate in build script: `"build": "prisma generate && next build"`

---

## 🚀 Deployment Steps

### Step 1: Prepare Database (PostgreSQL Recommended)

#### Option A: Supabase (Free Tier)
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

#### Option B: Neon (Free Tier)
1. Go to https://neon.tech
2. Create new project
3. Get connection string from dashboard
4. Format: `postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require`

#### Update Prisma Schema
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Push to GitHub

```bash
# Initialize Git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/documotion.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up/Login with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Set Environment Variables**
   Click "Environment Variables" and add:
   
   **Required:**
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-here
   ```
   
   **Optional:**
   ```
   OPENAI_API_KEY=sk-...
   RAZORPAY_KEY_ID=rzp_...
   RAZORPAY_KEY_SECRET=...
   RESEND_API_KEY=re_...
   GITHUB_TOKEN=ghp_...
   UNSPLASH_ACCESS_KEY=...
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (first time - setup)
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL production
vercel env add OPENAI_API_KEY
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET

# Deploy to production
vercel --prod
```

### Step 4: Run Database Migrations

After deployment, run migrations:

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# Option 2: Using Vercel Dashboard
# Go to your deployment > View Build Logs
# Run: npx prisma migrate deploy
```

### Step 5: Seed Database (Optional)

```bash
# Connect to production database
DATABASE_URL="your-production-db-url" npm run db:seed

# Or import data
DATABASE_URL="your-production-db-url" npm run import:govt
DATABASE_URL="your-production-db-url" npm run import:bank
DATABASE_URL="your-production-db-url" npm run import:founders
```

### Step 6: Update NEXTAUTH_URL

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Update `NEXTAUTH_URL` to your production URL:
   ```
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
3. Redeploy (or it will auto-update on next push)

---

## 🔧 Post-Deployment Configuration

### 1. Verify Deployment
- [ ] Visit your production URL
- [ ] Check all pages load correctly
- [ ] Test API endpoints
- [ ] Verify database connection

### 2. Configure Razorpay (If Using)
- [ ] Update webhook URL in Razorpay dashboard:
  ```
  https://your-app.vercel.app/api/payment/razorpay/webhook
  ```
- [ ] Enable webhook events
- [ ] Test payment flow

### 3. Set Up Custom Domain (Optional)
- [ ] Go to Vercel Dashboard > Settings > Domains
- [ ] Add your custom domain
- [ ] Update DNS records as instructed
- [ ] Update `NEXTAUTH_URL` to custom domain

### 4. Enable Analytics (Optional)
```bash
npm install @vercel/analytics
```

Add to `app/layout.js`:
```javascript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 📊 Deployment Summary

### What Gets Deployed
- ✅ 90 API endpoints
- ✅ All frontend pages
- ✅ Database schema (via migrations)
- ✅ All static assets
- ✅ Environment variables

### What Needs Manual Setup
- ⚠️ Database (PostgreSQL)
- ⚠️ Environment variables
- ⚠️ Database migrations
- ⚠️ Seed data (optional)

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Check build locally first
npm run build

# Common issues:
# - Missing dependencies: npm install
# - Prisma not generated: npm run prisma:generate
# - Type errors: Check TypeScript config
```

### Database Connection Fails
- Check `DATABASE_URL` format
- Verify database allows connections from Vercel IPs
- Check SSL mode (should be `?sslmode=require`)

### Environment Variables Not Working
- Verify variables are set in Vercel dashboard
- Check variable names match code exactly
- Redeploy after adding variables

### API Routes Not Working
- Check build logs for errors
- Verify API routes are in `app/api/` directory
- Check CORS settings if calling from frontend

---

## ✅ Quick Deploy Commands

```bash
# 1. Test build locally
npm run build

# 2. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 3. Deploy to Vercel (via dashboard or CLI)
vercel --prod

# 4. Run migrations
vercel env pull .env.production
npx prisma migrate deploy

# 5. Seed data (optional)
DATABASE_URL="your-db-url" npm run db:seed
```

---

## 🎯 Deployment Checklist Summary

- [ ] Code pushed to GitHub
- [ ] Database created (PostgreSQL)
- [ ] Environment variables set in Vercel
- [ ] Deployed to Vercel
- [ ] Migrations run
- [ ] Seed data imported (optional)
- [ ] Production URL working
- [ ] All APIs tested
- [ ] Custom domain configured (optional)

---

**Status**: ✅ Ready to Deploy  
**Estimated Time**: 15-30 minutes  
**Cost**: $0/month (free tiers)

---

**Next**: Follow the steps above to deploy your application!

