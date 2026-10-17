import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type SheetProps = {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Sheet({ open, onClose, label, children, footer, className = '' }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onCloseRef.current() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
      previousFocus?.focus({ preventScroll: true })
    }
  }, [open])

  if (!open) return null

  // Portalled so ancestors with backdrop-filter/transform can't become the containing block for the fixed overlay.
  return createPortal(<div className="sheet-overlay" onMouseDown={onClose}>
    <div
      ref={panelRef}
      className={`sheet ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      onMouseDown={event => event.stopPropagation()}
    >
      <div className="sheet-grabber" aria-hidden="true" />
      <button className="icon-btn sheet-close" onClick={onClose} aria-label="Đóng"><X size={20} /></button>
      <div className="sheet-body">{children}</div>
      {footer && <div className="sheet-footer">{footer}</div>}
    </div>
  </div>, document.body)
}
