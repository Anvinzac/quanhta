import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function NotFound({ message = 'We couldn’t find that page.' }: { message?: string }) {
  return <main className="not-found wrap">
    <span className="mini-label">Not found</span>
    <h1>{message}</h1>
    <Link to="/" className="primary-btn"><ArrowLeft size={18} /> Back to all shops</Link>
  </main>
}
