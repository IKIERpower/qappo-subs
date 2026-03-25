import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/app/lib/supabase-admin'


export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const today = new Date()
    const inThreeDays = new Date()
    inThreeDays.setDate(today.getDate() + 3)

    const todayStr = today.toISOString().split('T')[0]
    const inThreeDaysStr = inThreeDays.toISOString().split('T')[0]

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .gte('next_billing_date', todayStr)
      .lte('next_billing_date', inThreeDaysStr)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: subscriptions?.length ?? 0,
      subscriptions: subscriptions ?? [],
    })
  } catch (error) {
    console.error('Cron check-renewals error:', error)
    return NextResponse.json(
      { error: 'Failed to check renewals' },
      { status: 500 }
    )
  }
}
