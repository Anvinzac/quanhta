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
    label="Túi của bạn"
    className="bag-sheet"
    footer={bag.count > 0 && <>
      <div className="subtotal"><span>Tạm tính</span><strong>{formatPrice(bag.total)}</strong></div>
      <p className="fine-print">Bạn sẽ chọn lấy tại tiệm hoặc giao hàng ở bước sau. Chưa thanh toán gì cả.</p>
      <button className="primary-btn full" onClick={onCheckout}>Tiếp tục <ArrowRight size={18} /></button>
    </>}
  >
    <div className="sheet-content">
      <span className="mini-label">{vendor.name}</span>
      <h2>Túi của bạn</h2>
      {bag.count === 0
        ? <div className="empty">
            <ShoppingBag size={36} strokeWidth={1.2} />
            <h3>Túi đang trống</h3>
            <p>Chạm vào món bất kỳ để chọn cỡ và thêm vào túi.</p>
            <button className="secondary-btn" onClick={onClose}>Tiếp tục xem</button>
          </div>
        : <ul className="bag-lines">{bag.lines.map(line =>
            <li key={`${line.productId}-${line.unitIndex}`} className="bag-line">
              <img src={line.product.image} alt="" />
              <div>
                <h3>{line.product.name}</h3>
                <p>{line.unit.label} · {formatPrice(line.unit.price)}</p>
                <QtyStepper compact value={line.qty} max={line.qty + bag.roomFor(line.productId)} onChange={qty => bag.setQty(line.productId, line.unitIndex, qty)} label={`Số lượng ${line.product.name}, ${line.unit.label}`} />
              </div>
              <strong>{formatPrice(line.lineTotal)}</strong>
            </li>)}
          </ul>}
    </div>
  </Sheet>
}
