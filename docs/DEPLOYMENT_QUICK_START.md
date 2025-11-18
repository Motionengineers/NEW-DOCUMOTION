# 🚀 Quick Deployment Guide

**Last Updated**: 2024-11-18  
**Status**: ✅ Build Fixed & Ready

---

## ⚡ 5-Minute Deployment

### Step 1: Fix Build Issues ✅
All build errors have been fixed:
- ✅ BigQuery module made optional
- ✅ Linting warnings fixed
- ✅ Unescaped entities fixed

### Step 2: Test Build Locally

```bash
# Test production build
npm run build

# If successful, you'll see:
# ✓ Compiled successfully
# Build successful
```

### Step 3: Push to GitHub

```bash
# Initialize Git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment - 90 APIs"

# Add remote (replace with your repo)
git remote add origin https://github.com/yourusername/documotion.git

# Push
git push -u origin main
```

### Step 4: Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click**: "Add New Project"
4. **Import** your GitHub repository
5. **Configure**:
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

6. **Add Environment Variables**:
   ```
   DATABASE_URL=your-postgresql-url
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-here
   ```

7. **Click**: "Deploy"

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL production

# Deploy to production
vercel --prod
```

### Step 5: Set Up Database

#### Get Free PostgreSQL Database

**Option A: Supabase** (Recommended)
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

**Option B: Neon**
1. Go to https://neon.tech
2. Create new project
3. Get connection string from dashboard

#### Update Prisma Schema

Change `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

#### Run Migrations

```bash
# After deployment, run migrations
vercel env pull .env.production
npx prisma migrate deploy
```

---

## 🔧 Required Environment Variables

### Minimum (Required)
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-here
```

### Optional (Enhanced Features)
```bash
# Free APIs (optional)
GITHUB_TOKEN=ghp_...
UNSPLASH_ACCESS_KEY=...
RESEND_API_KEY=re_...

# Paid Services (optional)
OPENAI_API_KEY=sk-...
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
```

---

## ✅ Deployment Checklist

- [ ] Build passes: `npm run build`
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Database created (PostgreSQL)
- [ ] Prisma schema updated (postgresql)
- [ ] Migrations run
- [ ] Production URL working
- [ ] All APIs tested

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Fix: Run locally first
npm run build

# Check for errors and fix them
```

### Database Connection Fails
- Check `DATABASE_URL` format
- Verify database allows Vercel IPs
- Check SSL mode: `?sslmode=require`

### Internal Server Error
- Check Vercel logs: Dashboard > Deployments > View Logs
- Verify environment variables are set
- Check database connection

---

## 📊 What Gets Deployed

- ✅ 90 API endpoints
- ✅ All frontend pages
- ✅ Database schema
- ✅ Static assets
- ✅ All 10 free APIs

---

## 🎯 Next Steps After Deployment

1. **Test Production URL**
   - Visit your Vercel URL
   - Test all major features
   - Verify APIs work

2. **Seed Database** (Optional)
   ```bash
   DATABASE_URL="your-db-url" npm run db:seed
   ```

3. **Set Up Custom Domain** (Optional)
   - Vercel Dashboard > Settings > Domains
   - Add your domain
   - Update DNS records

4. **Monitor**
   - Check Vercel Analytics
   - Monitor API usage
   - Set up error tracking

---

**Status**: ✅ Ready to Deploy  
**Estimated Time**: 15-30 minutes  
**Cost**: $0/month (free tiers)

---

**Full Guide**: See `docs/DEPLOYMENT_CHECKLIST.md` for detailed steps.

