import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function NotFound({ message = 'Không tìm thấy trang này.' }: { message?: string }) {
  return <main className="not-found wrap">
    <span className="mini-label">Không tìm thấy</span>
    <h1>{message}</h1>
    <Link to="/" className="primary-btn"><ArrowLeft size={18} /> Về trang chủ</Link>
  </main>
}
