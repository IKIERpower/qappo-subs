'use client'

// Shared CategoryDropdown - używa useCategories() jako jedynego źródła prawdy.
// "Add new..." zapisuje kategorię na stałe do bazy i synchronizuje wszystkie miejsca.

import { useState, useRef, useEffect } from 'react'
import { useCategories } from '@/app/lib/CategoriesContext'
import clsx from 'clsx'

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function CategoryDropdown({ value, onChange }: Props) {
  const { categories, addCategory, loading } = useCategories()
  const [open, setOpen] = useState(false)
  const [addingNew, setAddingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setAddingNew(false)
        setNewName('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (addingNew && inputRef.current) inputRef.current.focus()
  }, [addingNew])

  async function handleAddNew() {
    if (!newName.trim() || saving) return
    setSaving(true)
    const created = await addCategory(newName.trim())
    setSaving(false)
    if (created) {
      onChange(created.name)
      setAddingNew(false)
      setNewName('')
      setOpen(false)
    }
  }

  const displayValue = value || 'Select category'
  const selectedCategory = categories.find(c => c.name === value)

  return (
    <div ref={ref} className="relative z-20">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm',
          'flex items-center justify-between gap-2 transition-all duration-200 hover:border-outline-variant focus:outline-none',
          open && 'border-on-surface/40'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedCategory && (
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedCategory.color }} />
          )}
          <span className={clsx(
            'uppercase tracking-wider text-[10px] truncate',
            value ? 'text-on-surface' : 'text-on-surface-variant/50'
          )}>
            {displayValue}
          </span>
        </div>
        <span className={clsx(
          'material-symbols-outlined text-[16px] text-on-surface-variant transition-transform duration-300 shrink-0',
          open && 'rotate-180'
        )}>expand_more</span>
      </button>

      <div className={clsx(
        'absolute z-[60] left-0 right-0 mt-1 bg-surface-container-high border border-outline-variant/50 shadow-xl overflow-hidden transition-all duration-300 origin-top',
        open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
      )}>
        {loading ? (
          <div className="px-4 py-3 font-label text-[10px] text-on-surface-variant">Loading...</div>
        ) : (
          <>
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { onChange(cat.name); setOpen(false) }}
                className={clsx(
                  'w-full px-4 py-3 text-left font-label text-[10px] uppercase tracking-wider',
                  'transition-all duration-150 flex items-center justify-between gap-2',
                  i !== 0 && 'border-t border-outline-variant/15',
                  value === cat.name
                    ? 'bg-on-surface text-surface'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: value === cat.name ? 'currentColor' : cat.color }}
                  />
                  {cat.name}
                </div>
                {value === cat.name && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>
            ))}

            {/* Add new category */}
            <div className="border-t border-outline-variant/20">
              {!addingNew ? (
                <button
                  type="button"
                  onClick={() => setAddingNew(true)}
                  className="w-full px-4 py-3 text-left font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Add new category
                </button>
              ) : (
                <div className="px-4 py-3 flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value.slice(0, 30))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); handleAddNew() }
                      if (e.key === 'Escape') { setAddingNew(false); setNewName('') }
                    }}
                    placeholder="Category name..."
                    maxLength={30}
                    className="flex-1 px-3 py-1.5 bg-surface-container border border-outline-variant/30 text-on-surface font-label text-[11px] placeholder:text-on-surface-variant/50 focus:outline-none focus:border-on-surface/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddNew}
                    disabled={!newName.trim() || saving}
                    className="px-3 py-1.5 bg-on-surface text-surface font-label text-[10px] uppercase tracking-wider disabled:opacity-40 hover:bg-on-surface/85 transition-colors"
                  >
                    {saving ? '...' : 'Add'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
