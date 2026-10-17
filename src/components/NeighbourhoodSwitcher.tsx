import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, MapPin } from 'lucide-react'
import { neighbourhoods, RADIUS, vendorsIn } from '../data'
import { useNeighbourhood } from '../neighbourhood'

const EDGE = 12
const GAP = 8
const MAX_WIDTH = 420

type Placement = { top: number, left: number, width: number, maxHeight: number, caret: number }

function place(anchor: HTMLElement): Placement {
  const rect = anchor.getBoundingClientRect()
  const width = Math.min(MAX_WIDTH, window.innerWidth - EDGE * 2)
  const center = rect.left + rect.width / 2
  const left = Math.min(Math.max(center - width / 2, EDGE), window.innerWidth - width - EDGE)
  const top = rect.bottom + GAP
  return { top, left, width, maxHeight: window.innerHeight - top - EDGE, caret: center - left }
}

export function NeighbourhoodSwitcher({ onSwitch }: { onSwitch?: (id: string) => void }) {
  const { current, setCurrent, isJoined, memberCount } = useNeighbourhood()
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<Placement | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return
    const update = () => setPlacement(place(buttonRef.current!))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [open])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
      buttonRef.current?.focus({ preventScroll: true })
    }
  }, [open])

  const choose = (id: string) => {
    setCurrent(id)
    setOpen(false)
    onSwitch?.(id)
  }

  return <>
    <button
      ref={buttonRef}
      className={`hood-switch${open ? ' open' : ''}`}
      onClick={() => setOpen(value => !value)}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label={`Khu phố ${current.name}, bán kính ${RADIUS} quanh ${current.shortAddress}. Chạm để đổi khu phố`}
    >
      <MapPin size={14} aria-hidden="true" />
      <span><strong>{current.name}</strong> · {RADIUS} quanh {current.shortAddress}</span>
      <ChevronDown size={14} aria-hidden="true" />
    </button>

    {open && placement && createPortal(<>
      <div className="hood-backdrop" onClick={() => setOpen(false)} />
      <div
        ref={panelRef}
        className="hood-dropdown"
        role="dialog"
        aria-label="Chọn khu phố"
        tabIndex={-1}
        style={{ top: placement.top, left: placement.left, width: placement.width, maxHeight: placement.maxHeight, '--caret': `${placement.caret}px` } as CSSProperties}
      >
        <div className="hood-dropdown-head">
          <span className="mini-label">Chọn khu phố</span>
          <p>Mỗi khu phố là bán kính {RADIUS} quanh một địa chỉ.</p>
        </div>
        <ul className="hood-list">{neighbourhoods.map(neighbourhood => {
          const selected = neighbourhood.id === current.id
          return <li key={neighbourhood.id}>
            <button className={selected ? 'selected' : ''} onClick={() => choose(neighbourhood.id)} aria-pressed={selected}>
              <span className="hood-pin"><MapPin size={18} /></span>
              <span className="hood-text">
                <strong>{neighbourhood.name}{isJoined(neighbourhood.id) && <em>Đã tham gia</em>}</strong>
                <span>{neighbourhood.address}, {neighbourhood.city}</span>
                <small>{memberCount(neighbourhood)} hàng xóm · {vendorsIn(neighbourhood.id).length} cửa hàng</small>
              </span>
              {selected && <Check size={20} className="hood-check" />}
            </button>
          </li>
        })}</ul>
      </div>
    </>, document.body)}
  </>
}
