import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

async function getSupabaseWithSession() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET() {
  const { supabase, user } = await getSupabaseWithSession()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: categories, error: fetchError } = await supabase
      .from('user_categories')
      .select('id, name, is_default')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (fetchError) throw fetchError

    if (!categories || categories.length === 0) {
      const DEFAULT_CATEGORIES = ['Entertainment', 'Development', 'Utilities', 'Productivity']
      const { data: inserted, error: insertError } = await supabase
        .from('user_categories')
        .insert(DEFAULT_CATEGORIES.map(name => ({ user_id: user.id, name, is_default: true })))
        .select('id, name, is_default')

      if (insertError) throw insertError
      return NextResponse.json(inserted ?? [])
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getSupabaseWithSession()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name } = await request.json()

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const trimmedName = name.trim()

    const { data: existing } = await supabase
      .from('user_categories')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', trimmedName)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('user_categories')
      .insert({ user_id: user.id, name: trimmedName, is_default: false })
      .select('id, name, is_default')
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Categories POST error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
