'use client'

import Link from 'next/link'

export default function GDPRPage() {
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
            GDPR & Data Rights
          </h1>
          <p className="font-label text-sm text-on-surface-variant">
            Your data rights under the General Data Protection Regulation
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none font-label text-on-surface-variant leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. Who We Are</h2>
            <p>
              SubManager is operated by QAPPO. We are committed to protecting your personal data and respecting your privacy in accordance with the General Data Protection Regulation (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. Your Data Rights</h2>
            <p>Under GDPR, you have the following rights:</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-on-surface mb-2">Right to Access</h3>
                <p>
                  You have the right to access your personal data and receive a copy of the information we hold about you.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-on-surface mb-2">Right to Rectification</h3>
                <p>
                  You have the right to correct inaccurate or incomplete personal data.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-on-surface mb-2">Right to Erasure</h3>
                <p>
                  You have the right to request deletion of your personal data (the "right to be forgotten"), subject to certain exceptions.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-on-surface mb-2">Right to Restrict Processing</h3>
                <p>
                  You have the right to request that we limit how we use your personal data.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-on-surface mb-2">Right to Data Portability</h3>
                <p>
                  You have the right to request and receive your personal data in a machine-readable format.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-on-surface mb-2">Right to Object</h3>
                <p>
                  You have the right to object to certain types of processing, including marketing communications.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-on-surface mb-2">Right to Withdraw Consent</h3>
                <p>
                  If we process your data based on your consent, you have the right to withdraw that consent at any time.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. Legal Basis for Processing</h2>
            <p>
              We process your personal data on the following legal bases:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Consent: When you explicitly agree to our data processing</li>
              <li>Contract: When necessary to provide our service to you</li>
              <li>Legal Obligation: When required by law</li>
              <li>Legitimate Interests: When necessary for our business operations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to provide our service and fulfill the purposes outlined in our Privacy Policy. When data is no longer needed, we securely delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. International Transfers</h2>
            <p>
              Your data may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from your home country. When we transfer data internationally, we implement appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">6. How to Exercise Your Rights</h2>
            <p>
              To exercise any of your rights under GDPR, please contact us at:
            </p>
            <div className="bg-surface-container-low p-4 rounded-lg my-4">
              <p className="font-label text-sm">
                Email:{' '}
                <Link href="mailto:hello@qappo.pl" className="text-primary hover:text-on-surface">
                  hello@qappo.pl
                </Link>
              </p>
              <p className="font-label text-sm mt-2">
                Website:{' '}
                <Link
                  href="https://qappo.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-on-surface"
                >
                  qappo.pl
                </Link>
              </p>
            </div>
            <p>
              We will respond to your request within 30 days. If your request is complex, we may extend this period by up to 60 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">7. Data Protection Officer</h2>
            <p>
              If you have concerns about how we handle your data, you can also file a complaint with your local data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this GDPR policy from time to time. We will notify you of any significant changes by posting the new version on our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

