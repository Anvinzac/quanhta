import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { CornerLeftUp, Ellipsis, MapPin } from 'lucide-react'
import type { CategoryNode } from '../catalog'

const EDGE = 12

type CategoryUpChipProps = {
  /** Levels above the one the chips are showing, from the top down. */
  ancestors: CategoryNode[]
  current: CategoryNode
  onSelect: (id: string | undefined) => void
}

export function CategoryUpChip({ ancestors, current, onSelect }: CategoryUpChipProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<CSSProperties | null>(null)
  const chipRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open || !chipRef.current) return
    const update = () => {
      const rect = chipRef.current!.getBoundingClientRect()
      const left = Math.min(Math.max(rect.left, EDGE), window.innerWidth - 260 - EDGE)
      setPosition({ top: rect.bottom + 6, left: Math.max(EDGE, left), maxWidth: window.innerWidth - EDGE * 2 })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [open])

  useEffect(() => {
    if (!open) return
    menuRef.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    const onScroll = () => setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
      chipRef.current?.focus({ preventScroll: true })
    }
  }, [open])

  const choose = (id: string | undefined) => {
    setOpen(false)
    onSelect(id)
  }

  return <>
    <button
      ref={chipRef}
      className={`up-chip${open ? ' active' : ''}`}
      onClick={() => setOpen(value => !value)}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-label="Quay lại danh mục cấp trên"
    >
      <Ellipsis size={18} />
    </button>

    {open && position && createPortal(<>
      <div className="up-backdrop" onClick={() => setOpen(false)} />
      <div ref={menuRef} className="up-menu" role="menu" aria-label="Danh mục cấp trên" tabIndex={-1} style={position}>
        <span className="mini-label">Quay lại</span>
        <ol>
          <li><button role="menuitem" onClick={() => choose(undefined)}><CornerLeftUp size={16} aria-hidden="true" />Tất cả sản phẩm</button></li>
          {ancestors.map((node, index) =>
            <li key={node.id} style={{ '--depth': index + 1 } as CSSProperties}>
              <button role="menuitem" onClick={() => choose(node.id)}><CornerLeftUp size={16} aria-hidden="true" />{node.name}</button>
            </li>)}
          <li className="up-current" style={{ '--depth': ancestors.length + 1 } as CSSProperties} aria-current="true">
            <MapPin size={16} aria-hidden="true" />{current.name}<small>Đang xem</small>
          </li>
        </ol>
      </div>
    </>, document.body)}
  </>
}
