'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/app/lib/supabase'
const supabase = getSupabaseBrowserClient()
import { useAuth } from '@/app/lib/AuthContext'
import { useLocale } from '@/app/lib/LocaleContext'
import { useCategories } from '@/app/lib/CategoriesContext'
import { useTranslation } from '@/app/lib/translations'
import AppLayout from '@/app/components/AppLayout'
import Link from 'next/link'
import clsx from 'clsx'

export default function SettingsPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { locale, setLocale } = useLocale()
  const { categories, addCategory, removeCategory } = useCategories()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [removeCategoryError, setRemoveCategoryError] = useState<{id: string, count: string} | null>(null)
  const t = useTranslation(locale)

  const [displayName, setDisplayName] = useState('')
  const [displayNameLoaded, setDisplayNameLoaded] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')
  const [nameSuccess, setNameSuccess] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState(false)

  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const initials = displayNameLoaded
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? '?'

  useEffect(() => {
    if (!user) return
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user!.id)
        .single()
      if (data?.display_name) {
        setDisplayName(data.display_name)
      } else {
        setDisplayName(user!.email?.split('@')[0] ?? '')
      }
      setDisplayNameLoaded(true)
    }
    loadProfile()
  }, [user])

  async function handleSaveDisplayName() {
    if (!displayName.trim()) return
    setNameError('')
    setNameSuccess(false)
    setSavingName(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user!.id, display_name: displayName.trim() }, { onConflict: 'id' })
    setSavingName(false)
    if (error) {
      setNameError(error.message)
    } else {
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
    }
  }

  async function handleChangeEmail() {
    setEmailError('')
    setEmailSuccess(false)
    if (!newEmail.trim()) { setEmailError(t.emailRequired); return }
    if (newEmail.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setEmailError(t.emailSameAsCurrent); return
    }
    setSavingEmail(true)
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() })
    setSavingEmail(false)
    if (error) {
      setEmailError(error.message)
    } else {
      setEmailSuccess(true)
      setNewEmail('')
    }
  }

  async function handleChangePassword() {
    setPasswordError('')
    setPasswordSuccess(false)
    if (!user?.email) return
    setSavingPassword(true)
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`
      })
    setSavingPassword(false)
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== user?.email) return
    setDeleting(true)
    setDeleteError('')
    try {
      await supabase.from('subscriptions').delete().eq('user_id', user!.id)
      await supabase.from('alerts').delete().eq('user_id', user!.id)
      await supabase.from('profiles').delete().eq('id', user!.id)
      const { error: rpcError } = await supabase.rpc('delete_own_account')
      if (rpcError) {
        console.warn('RPC delete_own_account failed:', rpcError.message)
        await signOut()
        router.replace(`/${locale}/auth/login`)
        return
      }
      await signOut()
      router.replace(`/${locale}/auth/login`)
    } catch (err) {
      setDeleteError('Something went wrong. Please try again.')
      setDeleting(false)
    }
  }

  const inputClass = "w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
  const labelClass = "font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2"

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-5 animate-fade-up">

        {/* Header */}
        <div>
          <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">{t.configuration}</div>
          <h1 className="font-headline font-bold text-2xl tracking-tighter text-on-surface">{t.accountSettings}</h1>
        </div>

        {/* ── Profile ── */}
        <section className="bg-surface-container-lowest border border-outline-variant/15">
          <div className="px-6 py-4 border-b border-outline-variant/15">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{t.profile}</div>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary flex items-center justify-center font-label font-bold text-base text-on-primary flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-headline font-semibold text-base text-on-surface truncate">
                  {displayNameLoaded ? displayName : user?.email?.split('@')[0]}
                </div>
                <div className="font-label text-sm text-on-surface-variant truncate">{user?.email}</div>
              </div>
              <span className="font-label text-[10px] uppercase tracking-widest px-2 py-1 text-secondary font-bold flex-shrink-0">
                {t.active}
              </span>
            </div>

            <div>
              <label className={labelClass}>{t.displayName}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={e => { setDisplayName(e.target.value); setNameSuccess(false); setNameError('') }}
                  placeholder={t.displayNamePlaceholder}
                  className={inputClass}
                />
                <button
                  onClick={handleSaveDisplayName}
                  disabled={savingName || !displayName.trim()}
                  className="flex items-center gap-2 bg-primary text-on-primary font-label font-bold text-xs uppercase tracking-widest px-5 py-2.5 hover:opacity-80 transition-opacity disabled:opacity-40 flex-shrink-0"
                >
                  {savingName && <span className="w-3 h-3 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
                  {t.saveDisplayName}
                </button>
              </div>
            </div>

            {nameError && (
              <div className="flex items-center gap-2 py-2.5 px-3 bg-tertiary/5 border border-tertiary/20 animate-fade-in">
                <span className="material-symbols-outlined text-[14px] text-tertiary flex-shrink-0">error</span>
                <span className="font-label text-xs text-tertiary">{nameError}</span>
              </div>
            )}
            {nameSuccess && (
              <div className="flex items-center gap-2 py-2.5 px-3 bg-secondary/5 border border-secondary/20 animate-fade-in">
                <span className="material-symbols-outlined text-[14px] text-secondary flex-shrink-0">check_circle</span>
                <span className="font-label text-xs text-secondary">{t.displayNameSaved}</span>
              </div>
            )}
          </div>
        </section>

          {/* ── Categories ── */}
          <section className="bg-surface-container-lowest border border-outline-variant/15">
              <div className="px-6 py-4 border-b border-outline-variant/15">
                  <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                      {locale === 'pl' ? 'Kategorie' : 'Categories'}
                  </div>
              </div>
              <div className="px-6 py-5 space-y-4">
                  <p className="font-label text-xs text-on-surface-variant leading-relaxed">
                      {locale === 'pl'
                          ? 'Zarządzaj kategoriami subskrypcji. Poniżej znajdują się kategorie domyślne i niestandardowe.'
                          : 'Manage subscription categories. Default and custom categories are listed below.'}
                  </p>

                  <div className="space-y-1">
                      {categories.map(cat => (
                          <div key={cat.id} className="flex items-center justify-between px-4 py-3 bg-surface-container-low border border-outline-variant/15 group">
                              <div className="flex items-center gap-3">
                                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                  <span className="font-label text-sm text-on-surface">{cat.name}</span>
                                  {cat.isDefault && (
                                      <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant border border-outline-variant/30 px-1.5 py-0.5">
                        {locale === 'pl' ? 'domyślna' : 'default'}
                      </span>
                                  )}
                              </div>
                              <div className="flex items-center gap-2">
                                  {removeCategoryError?.id === cat.id && (
                                      <span className="font-label text-[10px] text-tertiary">
                        {locale === 'pl'
                            ? `Używana przez ${removeCategoryError.count} sub.`
                            : `Used by ${removeCategoryError.count} sub(s).`}
                      </span>
                                  )}
                                  <button
                                      onClick={async () => {
                                          setRemoveCategoryError(null)
                                          const result = await removeCategory(cat.id)
                                          if (result?.error) {
                                              setRemoveCategoryError({ id: cat.id, count: result.error })
                                              setTimeout(() => setRemoveCategoryError(null), 4000)
                                          }
                                      }}
                                      className="text-on-surface-variant hover:text-tertiary transition-colors opacity-0 group-hover:opacity-100"
                                      title={locale === 'pl' ? 'Usuń kategorię' : 'Remove category'}
                                  >
                                      <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div>
                      <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                          {locale === 'pl' ? 'Dodaj nową kategorię' : 'Add new category'}
                      </div>
                      <div className="flex gap-2">
                          <input
                              type="text"
                              value={newCategoryName}
                              onChange={e => setNewCategoryName(e.target.value.slice(0, 30))}
                              onKeyDown={async e => {
                                  if (e.key === 'Enter' && newCategoryName.trim()) {
                                      setAddingCategory(true)
                                      await addCategory(newCategoryName.trim())
                                      setNewCategoryName('')
                                      setAddingCategory(false)
                                  }
                              }}
                              placeholder={locale === 'pl' ? 'np. Gry, Narzędzia do pracy' : 'e.g. Gaming, Work Tools'}
                              maxLength={30}
                              className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:border-on-surface/40 transition-colors"
                          />
                          <button
                              onClick={async () => {
                                  if (!newCategoryName.trim()) return
                                  setAddingCategory(true)
                                  await addCategory(newCategoryName.trim())
                                  setNewCategoryName('')
                                  setAddingCategory(false)
                              }}
                              disabled={!newCategoryName.trim() || addingCategory}
                              className="w-12 h-12 flex items-center justify-center bg-on-surface text-surface hover:bg-on-surface/85 transition-colors disabled:opacity-40"
                          >
                              {addingCategory
                                  ? <span className="w-3 h-3 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                                  : <span className="material-symbols-outlined text-[20px]">add</span>
                              }
                          </button>
                      </div>
                  </div>
              </div>
          </section>
        {/* ── Language ── */}
        <section className="bg-surface-container-lowest border border-outline-variant/15">
          <div className="px-6 py-4 border-b border-outline-variant/15">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{t.language}</div>
          </div>
          <div className="px-6 py-5">
            <div className="font-label text-sm text-on-surface-variant mb-4">{t.selectLanguage}</div>
            <div className="flex gap-2">
              {(['en', 'pl'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLocale(lang)}
                  className={clsx(
                    'px-5 py-2.5 border font-label text-xs uppercase tracking-widest transition-all',
                    locale === lang
                      ? 'bg-primary text-on-primary border-primary'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-on-surface'
                  )}
                >
                  {lang === 'en' ? t.english : t.polish}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Change Email ── */}
        <section className="bg-surface-container-lowest border border-outline-variant/15">
          <div className="px-6 py-4 border-b border-outline-variant/15">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{t.changeEmail}</div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="font-label text-xs text-on-surface-variant leading-relaxed">
              {locale === 'en'
                ? 'A confirmation link will be sent to your new email address. The change takes effect after you click the link.'
                : 'Link potwierdzający zostanie wysłany na nowy adres email. Zmiana wejdzie w życie po kliknięciu w link.'}
            </p>
            <div>
              <label className={labelClass}>{t.newEmail}</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => { setNewEmail(e.target.value); setEmailError(''); setEmailSuccess(false) }}
                placeholder={t.newEmailPlaceholder}
                className={inputClass}
              />
            </div>

            {emailError && (
              <div className="flex items-center gap-2 py-2.5 px-3 bg-tertiary/5 border border-tertiary/20 animate-fade-in">
                <span className="material-symbols-outlined text-[14px] text-tertiary flex-shrink-0">error</span>
                <span className="font-label text-xs text-tertiary">{emailError}</span>
              </div>
            )}
            {emailSuccess && (
              <div className="flex items-start gap-2 py-2.5 px-3 bg-secondary/5 border border-secondary/20 animate-fade-in">
                <span className="material-symbols-outlined text-[14px] text-secondary flex-shrink-0 mt-0.5">mail</span>
                <span className="font-label text-xs text-secondary">{t.emailChangeRequested}</span>
              </div>
            )}

            <button
              onClick={handleChangeEmail}
              disabled={savingEmail || !newEmail.trim()}
              className="flex items-center gap-2 bg-primary text-on-primary font-label font-bold text-xs uppercase tracking-widest px-5 py-2.5 hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {savingEmail && <span className="w-3 h-3 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
              {t.changeEmailButton}
            </button>
          </div>
        </section>

        {/* ── Security ── */}
        <section className="bg-surface-container-lowest border border-outline-variant/15">
          <div className="px-6 py-4 border-b border-outline-variant/15">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{t.security}</div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="font-label text-xs text-on-surface-variant leading-relaxed">
              {locale === 'en'
                ? "To change your password, we'll send a secure reset link to your email address. Click the link to set a new password."
                : 'Aby zmienić hasło, wyślemy bezpieczny link resetujący na Twój adres email. Kliknij w link, żeby ustawić nowe hasło.'}
            </p>

            {passwordError && (
              <div className="flex items-center gap-2 py-2.5 px-3 bg-tertiary/5 border border-tertiary/20 animate-fade-in">
                <span className="material-symbols-outlined text-[14px] text-tertiary flex-shrink-0">error</span>
                <span className="font-label text-xs text-tertiary">{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-start gap-2 py-2.5 px-3 bg-secondary/5 border border-secondary/20 animate-fade-in">
                <span className="material-symbols-outlined text-[14px] text-secondary flex-shrink-0 mt-0.5">mail</span>
                <span className="font-label text-xs text-secondary">{t.passwordResetSent}</span>
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="flex items-center gap-2 bg-primary text-on-primary font-label font-bold text-xs uppercase tracking-widest px-5 py-2.5 hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {savingPassword && <span className="w-3 h-3 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
              {t.sendPasswordResetLink}
            </button>
          </div>
        </section>

        {/* ── Powiadomienia ── */}
        <section className="bg-surface-container-lowest border border-outline-variant/15">
          <div className="px-6 py-4 border-b border-outline-variant/15">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{t.emailNotifications}</div>
          </div>
          <div className="px-6 py-5">
            <p className="font-label text-sm text-on-surface-variant leading-relaxed mb-3">
              {t.renewalReminders}
              {t.setNotificationThresholds}{' '}
              <Link href={`/${locale}/alerts`} className="text-on-surface underline hover:no-underline">{t.alerts}</Link>.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse flex-shrink-0" />
              <span className="font-label text-xs text-secondary uppercase tracking-wider">{t.notificationEngineActive}</span>
            </div>
          </div>
        </section>


        {/* ── Danger Zone ── */}
        <section className="bg-surface-container-lowest border border-tertiary/25">
          <div className="px-6 py-4 border-b border-tertiary/15">
            <div className="font-label text-[10px] uppercase tracking-widest text-tertiary">{t.dangerZone}</div>
          </div>
          <div className="px-6 py-5 flex items-start justify-between gap-4">
            <div>
              <div className="font-headline font-semibold text-sm text-on-surface">{t.deleteAccount}</div>
              <p className="font-label text-xs text-on-surface-variant mt-1">
                {t.deleteAccountDescription}
              </p>
            </div>
            <button
              onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); setDeleteError('') }}
              className="flex-shrink-0 border border-tertiary/40 text-tertiary font-label text-xs uppercase tracking-widest px-4 py-2 hover:bg-tertiary/5 transition-colors"
            >
              {t.deleteAccountConfirm}
            </button>
          </div>
        </section>

      </div>

      {/* ── Modal usunięcia konta ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="bg-surface-container-lowest border border-tertiary/30 p-6 w-full max-w-sm animate-fade-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-[22px] text-tertiary">warning</span>
              <div className="font-headline font-bold text-base text-on-surface">{t.deleteAccountModal}</div>
            </div>
            <p className="font-label text-sm text-on-surface-variant mb-5 mt-2 leading-relaxed">
              {t.deleteWarning}
            </p>

            <div className="mb-4">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                {t.typeEmailToConfirm}{' '}
                <span className="text-on-surface font-semibold">{user?.email}</span>
              </label>
              <input
                type="email"
                value={deleteConfirm}
                onChange={e => { setDeleteConfirm(e.target.value); setDeleteError('') }}
                placeholder={user?.email}
                autoFocus
                disabled={deleting}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface font-label text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary transition-colors disabled:opacity-50"
                onKeyDown={e => e.key === 'Enter' && deleteConfirm === user?.email && handleDeleteAccount()}
              />
            </div>

            {deleting && (
              <div className="mb-4 space-y-2">
                {[t.deletingSubscriptions, t.deletingAlerts, t.deletingAccount].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 font-label text-xs text-on-surface-variant animate-fade-in" style={{ animationDelay: `${i * 400}ms` }}>
                    <span className="w-3 h-3 border-2 border-outline-variant/30 border-t-tertiary rounded-full animate-spin flex-shrink-0" />
                    {step}
                  </div>
                ))}
              </div>
            )}

            {deleteError && (
              <div className="mb-4 flex items-center gap-2 py-2.5 px-3 bg-tertiary/5 border border-tertiary/20 animate-fade-in">
                <span className="material-symbols-outlined text-[14px] text-tertiary flex-shrink-0">error</span>
                <span className="font-label text-xs text-tertiary">{deleteError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== user?.email || deleting}
                className="flex-1 flex items-center justify-center gap-2 bg-tertiary text-white font-label font-bold text-xs uppercase tracking-widest py-2.5 hover:opacity-80 transition-opacity disabled:opacity-40"
              >
                {deleting && <span className="w-3 h-3 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
                {deleting ? t.deleting : t.deleteForever}
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); setDeleteError('') }}
                disabled={deleting}
                className="px-4 py-2.5 border border-outline-variant/30 font-label text-xs text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
              >
                {t.cancel}
              </button>
            </div>

            <p className="mt-4 font-label text-[10px] text-on-surface-variant leading-relaxed">
              {t.requiresFunction} <code className="bg-surface-container px-1 py-0.5 text-on-surface">delete_own_account</code> {t.inSupabase}{' '}
              <a href="https://github.com" className="underline hover:no-underline" target="_blank" rel="noreferrer">{t.viewSQL}</a>
            </p>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
