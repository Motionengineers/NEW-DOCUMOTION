import { NextResponse } from 'next/server';
import { sendTransactionalEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * POST /api/email/test
 * 
 * Test endpoint for Resend email API
 * Sends a test email to verify configuration
 * 
 * Body:
 * - to: Email address to send test email to
 * - subject: Optional custom subject (default: "Test Email from Documotion")
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject } = body;
    
    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Email address (to) is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send test email
    await sendTransactionalEmail({
      to,
      subject: subject || 'Test Email from Documotion',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Email from Documotion</h2>
          <p>This is a test email to verify your Resend API configuration.</p>
          <p>If you received this email, your email integration is working correctly! ✅</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toISOString()}<br>
            From: Documotion Platform
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      to,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('POST /api/email/test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send test email',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

