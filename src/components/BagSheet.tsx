import { ArrowRight, ShoppingBag } from 'lucide-react'
import { Sheet } from './Sheet'
import { QtyStepper } from './QtyStepper'
import { formatPrice, type Vendor } from '../data'
import { useBag } from '../bag'

type BagSheetProps = {
  open: boolean
  vendor: Vendor
  onClose: () => void
  onCheckout: () => void
}

export function BagSheet({ open, vendor, onClose, onCheckout }: BagSheetProps) {
  const bag = useBag(vendor.slug)

  return <Sheet
    open={open}
    onClose={onClose}
    label="Your bag"
    className="bag-sheet"
    footer={bag.count > 0 && <>
      <div className="subtotal"><span>Subtotal</span><strong>{formatPrice(bag.total)}</strong></div>
      <p className="fine-print">You’ll choose pickup or delivery next. Nothing is charged yet.</p>
      <button className="primary-btn full" onClick={onCheckout}>Continue <ArrowRight size={18} /></button>
    </>}
  >
    <div className="sheet-content">
      <span className="mini-label">{vendor.name}</span>
      <h2>Your bag</h2>
      {bag.count === 0
        ? <div className="empty">
            <ShoppingBag size={36} strokeWidth={1.2} />
            <h3>Nothing here yet</h3>
            <p>Tap any item to choose a size and add it.</p>
            <button className="secondary-btn" onClick={onClose}>Keep browsing</button>
          </div>
        : <ul className="bag-lines">{bag.lines.map(line =>
            <li key={`${line.productId}-${line.unitIndex}`} className="bag-line">
              <img src={line.product.image} alt="" />
              <div>
                <h3>{line.product.name}</h3>
                <p>{line.unit.label} · {formatPrice(line.unit.price)}</p>
                <QtyStepper compact value={line.qty} onChange={qty => bag.setQty(line.productId, line.unitIndex, qty)} label={`Quantity of ${line.product.name}, ${line.unit.label}`} />
              </div>
              <strong>{formatPrice(line.lineTotal)}</strong>
            </li>)}
          </ul>}
    </div>
  </Sheet>
}
