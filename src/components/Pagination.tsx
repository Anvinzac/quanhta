import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

function pageItems(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const start = Math.max(2, Math.min(page - 1, totalPages - 4))
  const end = Math.min(totalPages - 1, Math.max(page + 1, 5))
  const middle = Array.from({ length: end - start + 1 }, (_, index) => start + index)
  return [1, ...(start > 2 ? ['gap' as const] : []), ...middle, ...(end < totalPages - 1 ? ['gap' as const] : []), totalPages]
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return <nav className="pagination" aria-label="Phân trang">
    <button className="page-step" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Trang trước"><ChevronLeft size={18} /><span>Trước</span></button>
    <span className="page-status" aria-live="polite">Trang <strong>{page}</strong> / {totalPages}</span>
    <ol>{pageItems(page, totalPages).map((item, index) => item === 'gap'
      ? <li key={`gap-${index}`} className="page-gap" aria-hidden="true">…</li>
      : <li key={item}><button className={item === page ? 'active' : ''} onClick={() => onChange(item)} aria-current={item === page ? 'page' : undefined} aria-label={`Trang ${item}`}>{item}</button></li>)}
    </ol>
    <button className="page-step" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Trang sau"><span>Sau</span><ChevronRight size={18} /></button>
  </nav>
}
