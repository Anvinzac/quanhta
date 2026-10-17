import { useState } from 'react'
import { MessageCircle, Plus } from 'lucide-react'
import { Sheet } from './Sheet'
import { QtyStepper } from './QtyStepper'
import { categoryTrail, type Product } from '../catalog'
import { formatPrice, type Vendor } from '../data'

type ProductSheetProps = {
  product: Product
  vendor: Vendor
  onClose: () => void
  onAdd: (product: Product, unitIndex: number, qty: number) => void
}

export function ProductSheet({ product, vendor, onClose, onAdd }: ProductSheetProps) {
  const [unitIndex, setUnitIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const unit = product.units[unitIndex]
  const singlePrice = product.units[0].price

  return <Sheet
    open
    onClose={onClose}
    label={product.name}
    className="product-sheet"
    footer={<div className="sheet-actions">
      <QtyStepper value={qty} onChange={setQty} min={1} label={`Số lượng ${product.name}`} />
      <button className="primary-btn grow" onClick={() => onAdd(product, unitIndex, qty)}>
        <Plus size={18} /> Thêm · {formatPrice(unit.price * qty)}
      </button>
    </div>}
  >
    <div className={`sheet-image ${product.tone}`}><img src={product.image} alt="" /></div>
    <div className="sheet-content">
      <span className="mini-label">{categoryTrail(product.path[2]).slice(1).map(node => node.name).join(' › ')}</span>
      <h2>{product.name}</h2>
      <p className="sheet-note">{product.note}</p>

      <fieldset className="size-options">
        <legend>Chọn cỡ</legend>
        {product.units.map((option, index) => {
          const saving = singlePrice * option.count - option.price
          return <label key={option.label} className={index === unitIndex ? 'selected' : ''}>
            <input type="radio" name="size" checked={index === unitIndex} onChange={() => setUnitIndex(index)} />
            <span className="size-label">{option.label}</span>
            {saving > 0 && <span className="size-saving">tiết kiệm {formatPrice(saving)}</span>}
            <strong>{formatPrice(option.price)}</strong>
          </label>
        })}
      </fieldset>

      <button className="request-link" onClick={() => alert(`Khung chat với ${vendor.name} sẽ mở ở đây.`)}>
        <MessageCircle size={18} /> Hỏi {vendor.name} về món này
      </button>
    </div>
  </Sheet>
}
