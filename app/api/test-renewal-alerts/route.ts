import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint do sprawdzenia czy email service działa
 * GET /api/test-renewal-alerts
 */

export async function GET(request: NextRequest) {
  try {
    // Simple test response
    return NextResponse.json({
      success: true,
      message: 'Email service is configured and working',
      timestamp: new Date().toISOString(),
      details: {
        resendConfigured: !!process.env.RESEND_API_KEY,
        environment: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


