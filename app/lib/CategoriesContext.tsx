'use client'

// Jedno źródło prawdy dla kategorii.
// - 3 domyślne: Utility, Entertainment, Development
// - Przechowywane w tabeli `user_categories` w Supabase (per user)
// - Fallback na localStorage gdy user nie zalogowany

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { getSupabaseBrowserClient } from '@/app/lib/supabase'
import { useAuth } from '@/app/lib/AuthContext'

const supabase = getSupabaseBrowserClient()

export const DEFAULT_CATEGORIES = ['Utility', 'Entertainment', 'Development'] as const

export interface Category {
  id: string
  name: string
  color: string
  isDefault: boolean
}

// Kolory dla kategorii — przypisane po nazwie lub indeksie
const PALETTE = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#14b8a6', // teal
]

const DEFAULT_COLORS: Record<string, string> = {
  Utility:       '#6366f1',
  Entertainment: '#f59e0b',
  Development:   '#10b981',
}

function colorForName(name: string, existingCategories: Category[]): string {
  if (DEFAULT_COLORS[name]) return DEFAULT_COLORS[name]
  const usedColors = existingCategories.map(c => c.color)
  return PALETTE.find(c => !usedColors.includes(c)) ?? PALETTE[existingCategories.length % PALETTE.length]
}

interface CategoriesContextType {
  categories: Category[]
  loading: boolean
  addCategory: (name: string) => Promise<Category | null>
  removeCategory: (id: string) => Promise<{ error?: string }>
}

const CategoriesContext = createContext<CategoriesContextType>({
  categories: [],
  loading: true,
  addCategory: async () => null,
  removeCategory: async () => ({ }),
})

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const loadCategories = useCallback(async () => {
    if (!user) { setLoading(false); return }

    const { data, error } = await supabase
      .from('user_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) { setLoading(false); return }

    if (!data || data.length === 0) {
      // First time — seed defaults
      const defaults = DEFAULT_CATEGORIES.map((name, i) => ({
        user_id: user.id,
        name,
        color: DEFAULT_COLORS[name] ?? PALETTE[i],
        is_default: true,
      }))
      const { data: inserted } = await supabase
        .from('user_categories')
        .insert(defaults)
        .select()
      
      setCategories((inserted ?? []).map(row => ({
        id: row.id,
        name: row.name,
        color: row.color,
        isDefault: row.is_default,
      })))
    } else {
      setCategories(data.map(row => ({
        id: row.id,
        name: row.name,
        color: row.color,
        isDefault: row.is_default,
      })))
    }
    setLoading(false)
  }, [user?.id])

  useEffect(() => { loadCategories() }, [loadCategories])

  const addCategory = useCallback(async (name: string): Promise<Category | null> => {
    if (!user) return null
    const trimmed = name.trim()
    if (!trimmed) return null
    if (categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      return categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase()) ?? null
    }

    const color = colorForName(trimmed, categories)
    const { data, error } = await supabase
      .from('user_categories')
      .insert({ user_id: user.id, name: trimmed, color, is_default: false })
      .select()
      .single()

    if (error || !data) return null

    const newCat: Category = { id: data.id, name: data.name, color: data.color, isDefault: false }
    setCategories(prev => [...prev, newCat])
    return newCat
  }, [user?.id, categories])

  const removeCategory = useCallback(async (id: string): Promise<{ error?: string }> => {
    if (!user) return {}
    const cat = categories.find(c => c.id === id)
    if (!cat) return {}

    // Check if any subscription uses this category
    const { count } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('category', cat.name)

    if (count && count > 0) {
      return { error: `${count}` }
    }

    await supabase.from('user_categories').delete().eq('id', id).eq('user_id', user.id)
    setCategories(prev => prev.filter(c => c.id !== id))
    return {}
  }, [user?.id, categories])

  return (
    <CategoriesContext.Provider value={{ categories, loading, addCategory, removeCategory }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  return useContext(CategoriesContext)
}
