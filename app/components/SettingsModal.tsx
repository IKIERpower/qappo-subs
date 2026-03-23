'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { useAuth } from '@/app/lib/AuthContext'
import clsx from 'clsx'

interface SettingsModalProps {
  onClose: () => void
  userEmail?: string
}

export default function SettingsModal({ onClose, userEmail }: SettingsModalProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'danger'>('profile')
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return
    
    setDeleting(true)
    try {
      // Usuń subskrypcje i alerty
      if (user?.id) {
        await supabase.from('subscriptions').delete().eq('user_id', user.id)
        await supabase.from('alerts').delete().eq('user_id', user.id)
        await supabase.from('profiles').delete().eq('id', user.id)
      }
      
      // Usuń konto auth
      await supabase.auth.signOut()
      router.replace('/auth/login')
    } catch (error) {
      console.error('Error deleting account:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface-container-lowest border border-outline-variant/30 shadow-lg w-full max-w-md max-h-[80vh] flex flex-col animate-fade-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/20 flex-shrink-0">
          <h2 className="font-headline font-semibold text-lg text-on-surface">Settings</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant/20 flex-shrink-0">
          {(['profile', 'notifications', 'danger'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'flex-1 px-4 py-3 font-label text-xs uppercase tracking-wider font-medium transition-all border-b-2',
                activeTab === tab
                  ? 'text-on-surface border-b-primary'
                  : 'text-on-surface-variant border-b-transparent hover:text-on-surface'
              )}
            >
              {tab === 'profile' && 'Profile'}
              {tab === 'notifications' && 'Notifications'}
              {tab === 'danger' && 'Danger'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Email</label>
                <div className="px-4 py-3 bg-surface-container-low border border-outline-variant/20 text-on-surface font-label text-sm">
                  {userEmail || user?.email || '—'}
                </div>
              </div>
              <div className="pt-4 border-t border-outline-variant/20">
                <p className="font-label text-xs text-on-surface-variant mb-4">
                  To reset your password or update your email, please use the password reset link in your email.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <p className="font-label text-sm text-on-surface mb-4">
                Configure your subscription renewal alerts and email notifications.
              </p>
              <a
                href="/alerts"
                onClick={(e) => { e.preventDefault(); router.push('/alerts'); onClose() }}
                className="block w-full px-4 py-3 bg-primary text-white font-label text-xs uppercase tracking-widest font-bold hover:bg-on-surface transition-colors text-center"
              >
                Go to Alerts
              </a>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-4">
              {!confirmDelete ? (
                <>
                  <p className="font-label text-sm text-on-surface mb-6">
                    Deleting your account is permanent and cannot be undone. All subscriptions, alerts, and profile data will be removed.
                  </p>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full px-4 py-3 bg-tertiary text-white font-label text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity"
                  >
                    Delete Account
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-tertiary/10 border border-tertiary/30 p-4">
                    <p className="font-label text-xs text-tertiary mb-4">
                      This action cannot be undone. To confirm, type <strong>DELETE</strong> below:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={e => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm focus:outline-none focus:border-tertiary transition-colors"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setConfirmDelete(false); setDeleteConfirmText('') }}
                      className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-xs uppercase tracking-widest font-bold hover:bg-surface-container transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE' || deleting}
                      className="flex-1 px-4 py-3 bg-tertiary text-white font-label text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

