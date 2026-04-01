'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocale } from '@/app/lib/LocaleContext'
import { useTranslation } from '@/app/lib/translations'

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const { locale } = useLocale()
  const t = useTranslation(locale)
  const backdropRef = useRef<HTMLDivElement>(null)

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // Animation states
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  // Handle open
  useEffect(() => {
    if (open) {
      setVisible(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true))
      })
      setEmail('')
      setName('')
      setSubject('')
      setMessage('')
      setSending(false)
      setSent(false)
      setError('')
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Auto-close after success
  useEffect(() => {
    if (sent) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [sent, onClose])

  // Close on Escape
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    if (open) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, handleClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) handleClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined, subject, message }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t.contactFormError)
        setSending(false)
        return
      }

      setSent(true)
      setSending(false)
    } catch {
      setError(t.contactFormError)
      setSending(false)
    }
  }

  if (!visible) return null

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 transition-all duration-300 ease-out ${
        animating ? 'bg-black/50 opacity-100' : 'bg-black/0 opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden transition-all duration-300 ease-out ${
          animating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="font-headline font-bold text-lg text-on-surface">
            {t.contactFormTitle}
          </h2>
          <button
            onClick={handleClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {sent ? (
          /* Success state */
          <div className={`px-6 pb-6 pt-4 text-center transition-all duration-300 ${
            sent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 animate-bounce" style={{ animationDuration: '1s' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="font-label text-sm text-on-surface font-semibold mb-1">{t.contactFormSent}</p>
            <p className="font-label text-xs text-on-surface-variant mb-6">{t.contactFormSentDesc}</p>
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-full bg-primary text-on-primary font-label text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {t.contactFormClose}
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-4">
            <p className="font-label text-xs text-on-surface-variant animate-fade-in">
              {t.contactFormDesc}
            </p>

            {/* Email */}
            <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
              <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5">
                Email <span className="text-error">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {/* Name (optional) */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5">
                {t.contactFormName} <span className="text-on-surface-variant/50 normal-case">({t.contactFormOptional})</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t.contactFormNamePlaceholder}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {/* Subject */}
            <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
              <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5">
                {t.contactFormSubject} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                placeholder={t.contactFormSubjectPlaceholder}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {/* Message */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5">
                {t.contactFormMessage} <span className="text-error">*</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={4}
                placeholder={t.contactFormMessagePlaceholder}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="font-label text-xs text-error animate-fade-in">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 animate-fade-in" style={{ animationDelay: '250ms' }}>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-full font-label text-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2 rounded-full bg-primary text-on-primary font-label text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? t.contactFormSending : t.contactFormSend}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

