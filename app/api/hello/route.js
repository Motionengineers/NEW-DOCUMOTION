import { NextResponse } from 'next/server';

/**
 * Example API Endpoint - Hello World
 * 
 * This is a simple example API to help you learn how to create APIs.
 * 
 * GET /api/hello - Returns a greeting
 * GET /api/hello?name=John - Returns personalized greeting
 * POST /api/hello - Accepts JSON body with name and email
 */

// GET method - Read data
export async function GET(request) {
  try {
    // Get query parameters from URL
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || 'Guest';

    return NextResponse.json({
      success: true,
      message: `Hello ${name}! Welcome to Documotion API.`,
      timestamp: new Date().toISOString(),
      tip: 'Try POST /api/hello with {"name":"John","email":"john@example.com"}',
    });
  } catch (error) {
    console.error('GET /api/hello failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    );
  }
}

// POST method - Create/Update data
export async function POST(request) {
  try {
    // Parse JSON body from request
    const body = await request.json();
    const { name, email } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name and email are required',
          example: { name: 'John Doe', email: 'john@example.com' }
        },
        { status: 400 }
      );
    }

    // In a real API, you would save this to database
    // For now, we'll just return it
    return NextResponse.json({
      success: true,
      message: `User ${name} received!`,
      data: { 
        name, 
        email,
        receivedAt: new Date().toISOString(),
      },
      note: 'In a real API, this would be saved to the database',
    });
  } catch (error) {
    console.error('POST /api/hello failed:', error);
    
    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON. Please send valid JSON in request body.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    );
  }
}

