# How to Add a New API Endpoint - Step by Step Guide

This guide will walk you through creating a new API endpoint in Documotion from scratch.

---

## 📋 Prerequisites

- Basic understanding of JavaScript/Node.js
- Familiarity with Next.js (App Router)
- Access to the Documotion project

---

## 🎯 Step 1: Understand the File Structure

In Next.js App Router, API routes are created in the `app/api/` directory.

**Structure:**
```
app/
  api/
    your-endpoint/
      route.js          ← This file handles the API
```

**Example:**
- `app/api/states/route.js` → `GET /api/states`
- `app/api/funding/state/route.js` → `GET /api/funding/state`
- `app/api/users/[id]/route.js` → `GET /api/users/123` (dynamic route)

---

## 🚀 Step 2: Create Your First API (Simple Example)

Let's create a simple "Hello World" API to get started.

### 2.1 Create the Directory

```bash
mkdir -p app/api/hello
```

### 2.2 Create the Route File

Create `app/api/hello/route.js`:

```javascript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Hello from Documotion API!',
    timestamp: new Date().toISOString(),
  });
}
```

### 2.3 Test It

Start your dev server:
```bash
npm run dev
```

Test the API:
```bash
curl http://localhost:3000/api/hello
```

Or open in browser: `http://localhost:3000/api/hello`

**Expected Response:**
```json
{
  "success": true,
  "message": "Hello from Documotion API!",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

✅ **Congratulations!** You've created your first API!

---

## 📝 Step 3: Add Query Parameters

Let's enhance the API to accept query parameters.

### Update `app/api/hello/route.js`:

```javascript
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Get query parameters from URL
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'Guest';
  const age = searchParams.get('age');

  return NextResponse.json({
    success: true,
    message: `Hello ${name}!`,
    age: age ? parseInt(age) : null,
    timestamp: new Date().toISOString(),
  });
}
```

**Test:**
```bash
curl "http://localhost:3000/api/hello?name=John&age=25"
```

---

## 🔧 Step 4: Add POST Method

Let's add a POST endpoint to accept data.

### Update `app/api/hello/route.js`:

```javascript
import { NextResponse } from 'next/server';

// GET method
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'Guest';

  return NextResponse.json({
    success: true,
    message: `Hello ${name}!`,
    timestamp: new Date().toISOString(),
  });
}

// POST method
export async function POST(request) {
  try {
    // Parse JSON body
    const body = await request.json();
    const { name, email } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Process the data (e.g., save to database)
    // For now, just return it
    return NextResponse.json({
      success: true,
      message: `User ${name} created!`,
      data: { name, email },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('POST /api/hello failed:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid JSON or server error' },
      { status: 500 }
    );
  }
}
```

**Test POST:**
```bash
curl -X POST http://localhost:3000/api/hello \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'
```

---

## 💾 Step 5: Connect to Database (Prisma)

Let's create an API that reads from the database.

### Example: Get All Users

Create `app/api/users/route.js`:

```javascript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch users from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      take: 100, // Limit to 100 users
    });

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('GET /api/users failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load users' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Step 6: Create a Real-World Example

Let's create a "Products" API that follows Documotion patterns.

### Create `app/api/products/route.js`:

```javascript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products - List all products
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where = {};
    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      take: Math.min(limit, 100), // Max 100
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error('GET /api/products failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price, category } = body;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Name and price are required' },
        { status: 400 }
      );
    }

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        category: category || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('POST /api/products failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create product' },
      { status: 500 }
    );
  }
}
```

---

## 🔐 Step 7: Add Authentication

Protect your API with authentication.

### Update `app/api/products/route.js`:

```javascript
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export async function GET(request) {
  // Public endpoint - no auth required
  // ... (same as before)
}

export async function POST(request) {
  try {
    // Check authentication
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID from token
    const userId = parseInt(token.sub);

    // Rest of your code...
    const body = await request.json();
    // ... create product
  } catch (error) {
    // ... error handling
  }
}
```

---

## 📁 Step 8: Dynamic Routes (with ID)

Create an API for a specific product: `GET /api/products/123`

### Create `app/api/products/[id]/route.js`:

```javascript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/[id] - Get single product
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const productId = parseInt(id);

    if (!Number.isFinite(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('GET /api/products/[id] failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load product' },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] - Update product
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const productId = parseInt(id);
    const updates = await request.json();

    const product = await prisma.product.update({
      where: { id: productId },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('PATCH /api/products/[id] failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const productId = parseInt(id);

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    console.error('DELETE /api/products/[id] failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to delete product' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Step 9: Follow Documotion Patterns

Here's a template that follows Documotion's patterns:

```javascript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCachedValue, setCachedValue } from '@/lib/cache';

export const dynamic = 'force-dynamic'; // Disable caching

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_NAMESPACE = 'your-endpoint';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check cache first
    const cacheKey = searchParams.toString();
    const cached = getCachedValue(CACHE_NAMESPACE, cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Your logic here
    const data = await prisma.yourModel.findMany({
      // ... your query
    });

    const response = {
      success: true,
      data: data,
    };

    // Cache the response
    setCachedValue(CACHE_NAMESPACE, cacheKey, response, CACHE_TTL_MS);

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/your-endpoint failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load data' },
      { status: 500 }
    );
  }
}
```

---

## ✅ Step 10: Testing Your API

### Test with cURL:

```bash
# GET request
curl http://localhost:3000/api/your-endpoint

# GET with query params
curl "http://localhost:3000/api/your-endpoint?param=value"

# POST request
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'

# PATCH request
curl -X PATCH http://localhost:3000/api/your-endpoint/123 \
  -H "Content-Type: application/json" \
  -d '{"key":"newvalue"}'

# DELETE request
curl -X DELETE http://localhost:3000/api/your-endpoint/123
```

### Test in Browser:

Just open: `http://localhost:3000/api/your-endpoint`

### Test with JavaScript (Frontend):

```javascript
// GET request
const response = await fetch('/api/your-endpoint');
const data = await response.json();

// POST request
const response = await fetch('/api/your-endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' }),
});
const data = await response.json();
```

---

## 📚 Common Patterns

### Pattern 1: List with Pagination

```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.model.findMany({ skip, take: limit }),
    prisma.model.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

### Pattern 2: Cursor Pagination

```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const items = await prisma.model.findMany({
    take: limit + 1,
    ...(cursor ? { cursor: { id: parseInt(cursor) }, skip: 1 } : {}),
    orderBy: { id: 'asc' },
  });

  const nextCursor = items.length > limit ? items.pop().id : null;

  return NextResponse.json({
    success: true,
    data: items,
    nextCursor,
  });
}
```

### Pattern 3: Error Handling

```javascript
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.requiredField) {
      return NextResponse.json(
        { success: false, error: 'requiredField is required' },
        { status: 400 }
      );
    }

    // Business logic
    const result = await doSomething(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('POST /api/endpoint failed:', error);
    
    // Return appropriate error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Duplicate entry' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Quick Checklist

When creating a new API:

- [ ] Create directory: `app/api/your-endpoint/`
- [ ] Create file: `route.js`
- [ ] Export HTTP methods: `GET`, `POST`, `PATCH`, `DELETE`
- [ ] Add error handling with try/catch
- [ ] Return `NextResponse.json()` with `success` field
- [ ] Add validation for required fields
- [ ] Add authentication if needed
- [ ] Test with cURL or browser
- [ ] Add to API documentation

---

## 📖 Real Examples from Documotion

Study these existing APIs:

1. **Simple GET**: `app/api/states/route.js`
2. **With Filters**: `app/api/funding/state/route.js`
3. **POST with Body**: `app/api/funding/match/route.js`
4. **Dynamic Route**: `app/api/funding/[schemeId]/route.js`
5. **With Auth**: `app/api/subscription/route.js`

---

## 🆘 Troubleshooting

### Issue: "Route not found"
- Check file path: `app/api/your-endpoint/route.js`
- Restart dev server: `npm run dev`

### Issue: "Cannot read property of undefined"
- Check if `request.json()` was called (for POST)
- Check if `params` exists (for dynamic routes)

### Issue: "Database error"
- Check Prisma client is generated: `npx prisma generate`
- Check database connection in `.env`

### Issue: "CORS error"
- Next.js handles CORS automatically for same-origin
- For external access, add CORS headers

---

## 🎓 Next Steps

1. Create a simple API following this guide
2. Test it with cURL
3. Connect it to your frontend
4. Add authentication
5. Add to API documentation

---

## 📝 Template: Copy & Paste

Here's a ready-to-use template:

```javascript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Add your logic here
    
    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error('GET /api/your-endpoint failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    // Add your logic here
    
    return NextResponse.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('POST /api/your-endpoint failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    );
  }
}
```

---

**Happy coding! 🚀**

