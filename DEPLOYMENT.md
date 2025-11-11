# Deployment Guide for Documotion

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- A GitHub account
- Vercel account (free tier works)
- Razorpay account (for payments)
- OpenAI API key (optional, for AI features)

## Step-by-Step Deployment

### 1. Initial Setup

```bash
# Clone or navigate to your project
cd documotion

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate
```

### 2. Database Setup

#### Option A: SQLite (Development)

```bash
# Run migrations
npm run prisma:migrate

# Import seed data
npm run import:govt
npm run import:bank
npm run import:founders
npm run import:pitchdecks
```

#### Option B: PostgreSQL (Production)

1. Sign up for a free Postgres database at [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. Get your connection string
3. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. Run migrations:

```bash
npm run prisma:migrate
```

### 3. Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="your-database-url-here"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret-here"

# OpenAI (optional)
OPENAI_API_KEY="your-openai-key"

# Razorpay
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
```

Generate a secure NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

### 4. Local Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### 5. Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set production environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL production
vercel env add OPENAI_API_KEY
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET

# Deploy to production
vercel --prod
```

#### Option B: GitHub Integration

1. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables in Vercel dashboard
6. Click "Deploy"

### 6. Run Database Migrations on Vercel

After deployment, you need to run migrations:

**Option 1: Using Vercel CLI**

```bash
vercel env pull .env.production
npm run prisma:migrate deploy
```

**Option 2: Using Vercel Dashboard**

1. Go to your Vercel project
2. Open "Deployments" tab
3. Click on your deployment
4. Open "View Build Logs" and run migrations there

### 7. Post-Deployment Setup

1. **Update NEXTAUTH_URL**: In Vercel environment variables, set:

   ```
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

2. **Import Seed Data**: Run import scripts (you may need to do this via a Vercel serverless function or locally connected to production DB)

3. **Configure Razorpay**:
   - Update webhook URL in Razorpay dashboard
   - Enable/configure payment methods

4. **File Storage**: For production, consider using:
   - **Cloudinary** for images
   - **AWS S3** for PDFs
   - Update upload API to use these services

### 8. Monitoring & Maintenance

#### Error Tracking

Add Sentry to your project:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### Analytics

Enable Vercel Analytics:

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

#### Database Backups

Set up automated backups:

```bash
# Create backup script
mkdir scripts
cat > scripts/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
# Upload to S3 or your preferred storage
EOF

chmod +x scripts/backup-db.sh
```

Schedule with GitHub Actions or cron job.

### 9. Custom Domain (Optional)

1. In Vercel dashboard, go to "Settings" > "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update NEXTAUTH_URL environment variable

### 10. Performance Optimization

```bash
# Build and test production bundle
npm run build

# Analyze bundle size
npm install @next/bundle-analyzer
```

## Troubleshooting

### Common Issues

**Issue**: "Module not found" errors
**Solution**: Run `npm install` and `npm run prisma:generate`

**Issue**: Database connection fails
**Solution**: Check DATABASE_URL, verify firewall settings, ensure IP whitelist includes Vercel

**Issue**: Prisma client not found
**Solution**: Run `npm run prisma:generate` after every schema change

**Issue**: Environment variables not working
**Solution**: Restart dev server, check for typos, verify variable names match code

**Issue**: File uploads fail
**Solution**: Check file size limits, verify uploads directory permissions

### Useful Commands

```bash
# View database in Prisma Studio
npm run prisma:studio

# Check production build
npm run build && npm start

# View logs
vercel logs YOUR_DEPLOYMENT_URL

# Check database connection
npx prisma db pull
```

## Security Checklist

- [ ] NEXTAUTH_SECRET is random and secure
- [ ] DATABASE_URL uses SSL connection
- [ ] Environment variables are not committed to Git
- [ ] File uploads are validated and scanned
- [ ] Razorpay webhooks verify signatures
- [ ] API routes have rate limiting (optional)
- [ ] CORS is properly configured
- [ ] HTTPS is enforced
- [ ] Database backups are scheduled
- [ ] Error tracking is enabled

## Scaling Considerations

When your app grows:

1. **Database**: Move from SQLite to PostgreSQL
2. **File Storage**: Use Cloudinary or S3 instead of local files
3. **CDN**: Enable Vercel Edge Network
4. **Caching**: Add Redis for session storage
5. **Search**: Implement Elasticsearch or Algolia
6. **Monitoring**: Set up comprehensive logging
7. **Load Testing**: Use tools like k6 or Apache JMeter

## Support

For issues or questions:

- Check [Next.js Documentation](https://nextjs.org/docs)
- Check [Prisma Documentation](https://www.prisma.io/docs)
- Check [Vercel Documentation](https://vercel.com/docs)
- Create an issue in the repository
