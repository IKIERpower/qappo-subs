import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'
import { checkAndSendRenewalAlerts } from '@/app/lib/emailService'

/**
 * Cron endpoint do wysyłania renewal alerts
 * Powinien być wywoływany co godzinę przez cron job
 * 
 * Usage:
 * GET /api/cron/check-renewals
 * 
 * Optional:
 * GET /api/cron/check-renewals?userId=xxx (dla konkretnego użytkownika)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('🔔 Starting renewal alert check...')

    // Jeśli podano userId, sprawdź tylko tego użytkownika
    if (userId) {
      console.log(`🚀 Checking alerts for user: ${userId}`)

      // Pobierz email użytkownika
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()

      if (!profile?.email) {
        return NextResponse.json({
          success: false,
          error: 'User not found',
        }, { status: 404 })
      }

      try {
        await checkAndSendRenewalAlerts(userId, profile.email)
        return NextResponse.json({
          success: true,
          message: `✅ Alerts checked for ${profile.email}`,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 })
      }
    }

    // W przeciwnym razie sprawdź wszystkich użytkowników
    console.log('🚀 Checking renewal alerts for all users...')

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found',
        checked: 0,
        timestamp: new Date().toISOString(),
      })
    }

    let successCount = 0
    let errorCount = 0
    const errors: Record<string, string> = {}

    for (const profile of profiles) {
      try {
        console.log(`Checking alerts for ${profile.email}...`)
        await checkAndSendRenewalAlerts(profile.id, profile.email)
        successCount++
      } catch (error) {
        errorCount++
        errors[profile.id] = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Failed for user ${profile.id}:`, error)
      }
    }

    console.log(
      `✅ Completed: ${successCount} succeeded, ${errorCount} failed`
    )

    return NextResponse.json({
      success: true,
      message: 'Renewal alert check completed',
      checked: profiles.length,
      successCount,
      errorCount,
      ...(errorCount > 0 && { errors }),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron endpoint error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

