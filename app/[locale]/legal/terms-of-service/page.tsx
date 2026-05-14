'use client'

import { useLocale } from '@/app/lib/LocaleContext'
import Link from 'next/link'

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="font-label text-sm text-on-surface-variant">
            Last updated: March {new Date().getFullYear()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none font-label text-on-surface-variant leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using SubManager, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on SubManager for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. Disclaimer</h2>
            <p>
              The materials on SubManager are provided on an 'as is' basis. QAPPO makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. Limitations</h2>
            <p>
              In no event shall QAPPO or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SubManager.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on SubManager could include technical, typographical, or photographic errors. QAPPO does not warrant that any of the materials on SubManager are accurate, complete, or current. QAPPO may make changes to the materials contained on SubManager at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">6. Links</h2>
            <p>
              QAPPO has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by QAPPO of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">7. Modifications</h2>
            <p>
              QAPPO may revise these terms of service for SubManager at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which QAPPO operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

