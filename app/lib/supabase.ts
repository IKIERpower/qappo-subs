import { createBrowserClient } from '@supabase/ssr'

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  // createBrowserClient from @supabase/ssr automatically handles cookie-based
  // session storage, which is required for SSR/middleware session sync in Next.js App Router
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
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
      user_categories: {
        Row: UserCategory
        Insert: Omit<UserCategory, 'id' | 'created_at'>
        Update: Partial<Omit<UserCategory, 'id' | 'created_at'>>
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

export interface UserCategory {
  id: string
  created_at: string
  user_id: string
  name: string
  is_default: boolean
}

// UWAGA: Nie eksportujemy singletona - każdy komponent tworzy klienta przez getSupabaseBrowserClient()
// createBrowserClient z @supabase/ssr jest już zoptymalizowany i wewnętrznie cachuje instancję

