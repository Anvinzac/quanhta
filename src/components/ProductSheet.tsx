import { useState } from 'react'
import { MessageCircle, Plus } from 'lucide-react'
import { Sheet } from './Sheet'
import { QtyStepper } from './QtyStepper'
import { formatPrice, type Product, type Vendor } from '../data'

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
      <QtyStepper value={qty} onChange={setQty} min={1} label={`Quantity of ${product.name}`} />
      <button className="primary-btn grow" onClick={() => onAdd(product, unitIndex, qty)}>
        <Plus size={18} /> Add · {formatPrice(unit.price * qty)}
      </button>
    </div>}
  >
    <div className={`sheet-image ${product.tone}`}><img src={product.image} alt="" /></div>
    <div className="sheet-content">
      <span className="mini-label">{vendor.name} · {product.category}</span>
      <h2>{product.name}</h2>
      <p className="sheet-note">{product.note}</p>

      <fieldset className="size-options">
        <legend>Choose a size</legend>
        {product.units.map((option, index) => {
          const count = Number(option.label.match(/\d+/)?.[0] ?? 1)
          const saving = singlePrice * count - option.price
          return <label key={option.label} className={index === unitIndex ? 'selected' : ''}>
            <input type="radio" name="size" checked={index === unitIndex} onChange={() => setUnitIndex(index)} />
            <span className="size-label">{option.label}</span>
            {saving > 0 && <span className="size-saving">save {formatPrice(saving)}</span>}
            <strong>{formatPrice(option.price)}</strong>
          </label>
        })}
      </fieldset>

      <button className="request-link" onClick={() => alert(`Your direct chat with ${vendor.name} would open here.`)}>
        <MessageCircle size={18} /> Ask {vendor.name} about this
      </button>
    </div>
  </Sheet>
}
