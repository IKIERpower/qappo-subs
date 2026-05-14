'use client'

import { useLocale } from '@/app/lib/LocaleContext'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  const { locale } = useLocale()
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <Link
            href={`/${locale}`}
            className="font-label text-xs text-primary hover:text-on-surface transition-colors mb-4 inline-block"
          >
            ← Back
          </Link>
          <h1 className="font-headline font-bold text-4xl tracking-tighter text-on-surface mb-2">
            Privacy Policy
          </h1>
          <p className="font-label text-sm text-on-surface-variant">
            Last updated: March {new Date().getFullYear()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none font-label text-on-surface-variant leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. Introduction</h2>
            <p>
              SubManager is a product of QAPPO. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal data when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. What Data We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Email address and authentication credentials</li>
              <li>Subscription information you enter</li>
              <li>Payment and billing information (processed by third parties)</li>
              <li>Usage data and analytics</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and maintain the SubManager service</li>
              <li>To send you alerts and notifications about your subscriptions</li>
              <li>To improve our service based on your usage</li>
              <li>To comply with legal obligations</li>
              <li>To communicate with you about updates and changes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. Your password is hashed and never stored in plain text. All data is encrypted in transit using HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. Your Rights</h2>
            <p>
              Under GDPR and other privacy laws, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <Link href="mailto:contact.qappo@gmail.com" className="text-primary hover:text-on-surface">
                contact.qappo@gmail.pl
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

