# NextAuth Setup Guide

## Environment Variables

Add these to your `.env` file:

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"

# Google OAuth (Optional - for Google sign-in)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Database Migration

After updating the schema, run:

```bash
npx prisma migrate dev --name add-nextauth-tables
npx prisma generate
```

## Test Authentication

1. Start the dev server:

   ```bash
   npm run dev
   ```

2. Visit: http://localhost:3000/auth/signin

3. Try signing in with email/password (you'll need to create a user first)

## Creating Test Users

You can create a test user via Prisma Studio:

```bash
npx prisma studio
```

Or use this script:

```javascript
// scripts/createTestUser.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('User created:', user);
}

createUser();
```

## Troubleshooting

### Error: "Configuration"

- Make sure `NEXTAUTH_SECRET` is set in `.env`
- Make sure `NEXTAUTH_URL` matches your app URL
- Run database migration to create NextAuth tables

### Error: "AccessDenied"

- Check that the user exists in the database
- Verify password hash is correct
- Check user role in database
