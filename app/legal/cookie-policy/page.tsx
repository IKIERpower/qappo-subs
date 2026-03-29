'use client'

import Link from 'next/link'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="font-label text-xs text-primary hover:text-on-surface transition-colors mb-4 inline-block"
          >
            ← Back
          </Link>
          <h1 className="font-headline font-bold text-4xl tracking-tighter text-on-surface mb-2">
            Cookie Policy
          </h1>
          <p className="font-label text-sm text-on-surface-variant">
            Last updated: March {new Date().getFullYear()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none font-label text-on-surface-variant leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your browser or device when you visit websites. They allow websites to remember information about your visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Authentication:</strong> To keep you logged in and remember your session
              </li>
              <li>
                <strong>Preferences:</strong> To remember your language and theme settings
              </li>
              <li>
                <strong>Analytics:</strong> To understand how users interact with our service
              </li>
              <li>
                <strong>Security:</strong> To prevent fraud and ensure service security
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. Types of Cookies</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-on-surface mb-2">Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They include authentication cookies and security cookies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-on-surface mb-2">Functional Cookies</h3>
                <p>
                  These cookies remember your choices to provide a more personalized experience, such as language and theme preferences.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-on-surface mb-2">Analytics Cookies</h3>
                <p>
                  These cookies help us understand how you use our service and how we can improve it. They do not personally identify you.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. Third-Party Cookies</h2>
            <p>
              We use services from Supabase and other third parties that may set their own cookies. Please refer to their privacy policies for information about their cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. Managing Cookies</h2>
            <p>
              You can control and delete cookies through your browser settings. However, please note that disabling cookies may affect the functionality of our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about our cookie usage, please contact us at{' '}
              <Link href="mailto:hello@qappo.pl" className="text-primary hover:text-on-surface">
                hello@qappo.pl
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

