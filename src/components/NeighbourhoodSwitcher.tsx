import { useState } from 'react'
import { Check, ChevronDown, MapPin } from 'lucide-react'
import { Sheet } from './Sheet'
import { neighbourhoods, RADIUS, vendorsIn } from '../data'
import { useNeighbourhood } from '../neighbourhood'

export function NeighbourhoodSwitcher({ onSwitch }: { onSwitch?: (id: string) => void }) {
  const { current, setCurrent, isJoined, memberCount } = useNeighbourhood()
  const [open, setOpen] = useState(false)

  const choose = (id: string) => {
    setCurrent(id)
    setOpen(false)
    onSwitch?.(id)
  }

  return <>
    <button className="hood-switch" onClick={() => setOpen(true)} aria-label={`Khu phố ${current.name}, bán kính ${RADIUS} quanh ${current.shortAddress}. Chạm để đổi khu phố`}>
      <MapPin size={14} aria-hidden="true" />
      <span><strong>{current.name}</strong> · {RADIUS} quanh {current.shortAddress}</span>
      <ChevronDown size={14} aria-hidden="true" />
    </button>

    <Sheet open={open} onClose={() => setOpen(false)} label="Chọn khu phố" className="hood-sheet">
      <div className="sheet-content">
        <span className="mini-label">Khu phố của bạn</span>
        <h2>Chọn khu phố</h2>
        <p className="sheet-note">Mỗi khu phố là bán kính {RADIUS} quanh một địa chỉ. Bạn sẽ thấy các cửa hàng trong vòng đó.</p>
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
    </Sheet>
  </>
}
