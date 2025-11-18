# 🔧 Troubleshooting Guide

## Quick Fixes for Common Issues

### Issue: "Internal Server Error" or "Nothing Works"

#### Step 1: Check Server Status
```bash
# Check if server is running
curl http://localhost:3000/api/dashboard

# Should return: {"success":true,"schemes":48,...}
```

#### Step 2: Restart Development Server
```bash
# Kill existing server
pkill -f "next dev"

# Start fresh
npm run dev
```

#### Step 3: Clear Build Cache
```bash
# Remove Next.js cache
rm -rf .next

# Rebuild
npm run build
```

#### Step 4: Check Database Connection
```bash
# Check Prisma connection
npx prisma db push

# Should show: "Your database is now in sync"
```

#### Step 5: Check Environment Variables
```bash
# Verify .env file exists
cat .env | grep -E "DATABASE_URL|NEXTAUTH"

# Required variables:
# DATABASE_URL=file:./dev.db
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-secret-here
```

---

### Issue: Features Not Loading

#### Check Browser Console
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

#### Common Client-Side Errors

**Error: "Cannot read property of undefined"**
- **Fix**: Check component props and data fetching
- **Location**: Usually in components using `useState` or `useEffect`

**Error: "Failed to fetch"**
- **Fix**: Check API routes are accessible
- **Test**: `curl http://localhost:3000/api/dashboard`

**Error: "Hydration mismatch"**
- **Fix**: Ensure server and client render the same content
- **Check**: Remove any `Date.now()` or random values in initial render

---

### Issue: Database Errors

#### Error: "Column does not exist"
```bash
# Sync database schema
npx prisma db push --accept-data-loss
```

#### Error: "Migration failed"
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name fix_schema
```

---

### Issue: Build Errors

#### Error: "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Error: "ESLint errors"
```bash
# Fix auto-fixable issues
npm run lint -- --fix

# Or temporarily disable in next.config.js
```

---

### Issue: API Routes Not Working

#### Test Individual APIs
```bash
# Dashboard
curl http://localhost:3000/api/dashboard

# States
curl http://localhost:3000/api/states

# Funding
curl "http://localhost:3000/api/funding/state?state=Karnataka"
```

#### Check API Route Files
- Ensure file is in `app/api/[route]/route.js`
- Export `GET`, `POST`, etc. functions
- Check for syntax errors

---

### Issue: Pages Not Rendering

#### Check Page Files
- Ensure file is in `app/[page]/page.jsx`
- Check for React component errors
- Verify imports are correct

#### Check for Suspense Boundaries
- Pages using `useSearchParams()` need Suspense
- Example: `app/schemes/state-explorer/page.jsx`

---

## Debugging Steps

### 1. Enable Verbose Logging
```bash
# In terminal
DEBUG=* npm run dev

# Or in code
console.log('Debug:', data);
```

### 2. Check Server Logs
- Look for errors in terminal where `npm run dev` is running
- Check for Prisma errors
- Check for API route errors

### 3. Test in Isolation
```bash
# Test specific API
curl -X POST http://localhost:3000/api/funding/match \
  -H "Content-Type: application/json" \
  -d '{"industry":"AI","stage":"seed"}'

# Test specific page
curl http://localhost:3000/schemes
```

### 4. Check Network Tab
- Open browser DevTools → Network
- Reload page
- Check for 404, 500, or CORS errors

---

## Common Solutions

### Solution 1: Full Reset
```bash
# Stop server
pkill -f "next dev"

# Clear caches
rm -rf .next node_modules/.cache

# Reinstall
npm install

# Rebuild
npm run build

# Restart
npm run dev
```

### Solution 2: Database Reset
```bash
# WARNING: Deletes all data
npx prisma migrate reset

# Re-seed if needed
npm run db:seed
```

### Solution 3: Environment Reset
```bash
# Check .env file
cat .env

# Regenerate if needed
echo "DATABASE_URL=file:./dev.db" > .env
echo "NEXTAUTH_URL=http://localhost:3000" >> .env
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env
```

---

## Still Not Working?

1. **Check Error Messages**: Copy exact error from browser console
2. **Check Server Logs**: Look at terminal output
3. **Test APIs Directly**: Use curl to test endpoints
4. **Check File Permissions**: Ensure files are readable
5. **Check Port**: Ensure port 3000 is not in use

---

## Quick Health Check

Run this to verify everything:
```bash
# 1. Server running?
curl http://localhost:3000/api/dashboard

# 2. Database connected?
npx prisma db push

# 3. Build works?
npm run build

# 4. All dependencies?
npm install
```

---

**Last Updated**: 2024-11-18

