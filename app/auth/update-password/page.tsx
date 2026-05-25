'use client'

import { Suspense } from 'react'
import UpdatePasswordClient from './UpdatePasswordClient'

function UpdatePasswordLoading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<UpdatePasswordLoading />}>
      <UpdatePasswordClient />
    </Suspense>
  )
}
