import { redirect } from 'next/navigation'

// Middleware handles locale detection and redirects /, but this is a fallback
export default function RootPage() {
  redirect('/pl')
}
