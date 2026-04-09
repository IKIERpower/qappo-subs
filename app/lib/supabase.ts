import { createClient } from '@supabase/supabase-js'

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })
}

export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at'>
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>
      }
      alerts: {
        Row: Alert
        Insert: Omit<Alert, 'id' | 'created_at'>
        Update: Partial<Omit<Alert, 'id' | 'created_at'>>
      }
    }
  }
}

export interface Subscription {
  id: string
  created_at: string
  user_id: string
  name: string
  category: string
  cost: number
  currency: string
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
  next_billing_date: string | null
  status: 'active' | 'paused' | 'cancelled'
  description?: string
  website?: string
  notes?: string
}

export interface Alert {
  id: string
  created_at: string
  user_id: string
  type: 'renewal' | 'budget' | 'duplicate'
  threshold_value: number
  threshold_unit: string
  enabled: boolean
  label: string
  description?: string
}

export const supabase = getSupabaseBrowserClient()

