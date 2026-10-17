import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Bike, Check, ChevronDown, Clock3, ShoppingBag, Store } from 'lucide-react'
import { NotFound } from '../components/NotFound'
import { formatDistance, formatPrice, neighbourhoodById, RADIUS, vendorBySlug, type Vendor } from '../data'
import { useBag } from '../bag'

type Fulfilment = 'pickup_now' | 'pickup_scheduled' | 'delivery'

const fulfilmentOptions: { id: Fulfilment, title: string, detail: string, icon: ReactNode }[] = [
  { id: 'pickup_now', title: 'Lấy tại tiệm hôm nay', detail: 'Thường sẵn sàng sau khoảng 30 phút', icon: <Store size={22} /> },
  { id: 'pickup_scheduled', title: 'Hẹn giờ đến lấy', detail: 'Chọn ngày giờ phù hợp với bạn', icon: <Clock3 size={22} /> },
  { id: 'delivery', title: 'Giao tận nơi', detail: `Tiệm giao trong bán kính ${RADIUS}`, icon: <Bike size={22} /> },
]

const localToday = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

type Errors = Partial<Record<'name' | 'phone' | 'date' | 'time' | 'address', string>>

export function CheckoutPage() {
  const { vendorId } = useParams({ from: '/shops/$vendorId/checkout' })
  const vendor = vendorBySlug(vendorId)
  if (!vendor) return <NotFound message="Không tìm thấy cửa hàng này." />
  return <Checkout vendor={vendor} />
}

function Checkout({ vendor }: { vendor: Vendor }) {
  const bag = useBag(vendor.slug)
  const neighbourhood = neighbourhoodById(vendor.neighbourhoodId)
  const [fulfilment, setFulfilment] = useState<Fulfilment>('pickup_now')
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '', address: '', note: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState<{ count: number, total: number } | null>(null)

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (event: { target: { value: string } }) => {
      setForm(current => ({ ...current, [key]: event.target.value }))
      setErrors(current => ({ ...current, [key]: undefined }))
    },
  })

  const validate = (): Errors => {
    const found: Errors = {}
    if (!form.name.trim()) found.name = 'Nhập tên để tiệm biết ai sẽ đến.'
    if (form.phone.replace(/\D/g, '').length < 9) found.phone = 'Nhập số điện thoại để tiệm liên lạc.'
    if (fulfilment === 'pickup_scheduled' && !form.date) found.date = 'Chọn ngày.'
    if (fulfilment === 'pickup_scheduled' && !form.time) found.time = 'Chọn giờ.'
    if (fulfilment === 'delivery' && !form.address.trim()) found.address = 'Nhập địa chỉ giao hàng.'
    return found
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      document.getElementById(`checkout-${firstInvalid}`)?.focus()
      return
    }
    setSent({ count: bag.count, total: bag.total })
    bag.clear()
    window.scrollTo({ top: 0 })
  }

  const top = <nav className="shop-nav">
    <div className="wrap shop-nav-inner">
      <Link to="/shops/$vendorId" params={{ vendorId: vendor.slug }} className="icon-btn back-btn" aria-label={`Quay lại ${vendor.name}`}><ArrowLeft size={22} /><span>{vendor.name}</span></Link>
      <span className="nav-title">Đặt hàng</span>
      <span className="icon-btn" aria-hidden="true" />
    </div>
  </nav>

  if (sent) return <main className="checkout-page">
    {top}
    <section className="checkout-done wrap-narrow">
      <div className="done-mark"><Check size={30} /></div>
      <span className="mini-label">Đã gửi yêu cầu</span>
      <h1>{vendor.name} đã nhận đơn của bạn.</h1>
      <p>{sent.count} món · {formatPrice(sent.total)}. Tiệm sẽ xác nhận qua điện thoại hoặc tin nhắn trong ít phút.</p>
      <p className="fine-print">Đây là bản thử nghiệm — chưa có gì thực sự được gửi đi.</p>
      <Link to="/shops/$vendorId" params={{ vendorId: vendor.slug }} className="primary-btn full">Quay lại {vendor.name}</Link>
    </section>
  </main>

  if (bag.count === 0) return <main className="checkout-page">
    {top}
    <section className="empty wrap-narrow">
      <ShoppingBag size={36} strokeWidth={1.2} />
      <h3>Túi đang trống</h3>
      <p>Hãy thêm vài món từ {vendor.name} trước nhé.</p>
      <Link to="/shops/$vendorId" params={{ vendorId: vendor.slug }} className="secondary-btn">Xem {vendor.name}</Link>
    </section>
  </main>

  return <main className="checkout-page has-bag">
    {top}
    <form className="checkout-form wrap-narrow" onSubmit={submit} noValidate>
      <header>
        <span className="mini-label">{vendor.name} · cách {formatDistance(vendor.distanceM)}</span>
        <h1>Bạn muốn nhận<br /><em>thế nào?</em></h1>
      </header>

      <fieldset className="fulfil-options">
        <legend className="visually-hidden">Lấy tại tiệm hoặc giao hàng</legend>
        {fulfilmentOptions.map(option =>
          <label key={option.id} className={fulfilment === option.id ? 'selected' : ''}>
            <input type="radio" name="fulfilment" checked={fulfilment === option.id} onChange={() => setFulfilment(option.id)} />
            {option.icon}
            <span><strong>{option.title}</strong><small>{option.detail}</small></span>
            <i aria-hidden="true"><Check size={14} /></i>
          </label>)}
      </fieldset>

      {fulfilment === 'pickup_scheduled' && <div className="field-row">
        <Field id="date" label="Ngày" error={errors.date}><input id="checkout-date" type="date" min={localToday()} {...field('date')} /></Field>
        <Field id="time" label="Giờ" error={errors.time}><input id="checkout-time" type="time" {...field('time')} /></Field>
      </div>}

      {fulfilment === 'delivery' && <Field id="address" label="Địa chỉ giao hàng" error={errors.address}>
        <textarea id="checkout-address" rows={2} autoComplete="street-address" placeholder={neighbourhood ? `Trong ${RADIUS} quanh ${neighbourhood.shortAddress}` : undefined} {...field('address')} />
      </Field>}

      <h2 className="form-heading">Thông tin của bạn</h2>
      <Field id="name" label="Họ tên" error={errors.name}><input id="checkout-name" autoComplete="name" {...field('name')} /></Field>
      <Field id="phone" label="Số điện thoại" error={errors.phone}><input id="checkout-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="VD: 0901 234 567" {...field('phone')} /></Field>
      <Field id="note" label="Ghi chú cho tiệm (không bắt buộc)"><textarea id="checkout-note" rows={2} {...field('note')} placeholder="Dị ứng, mã cổng, lời nhắn tặng quà…" /></Field>

      <details className="order-summary">
        <summary><span>Tóm tắt đơn · {bag.count} món</span><ChevronDown size={18} /></summary>
        <ul>{bag.lines.map(line =>
          <li key={`${line.productId}-${line.unitIndex}`}><span>{line.qty} × {line.product.name} <small>{line.unit.label}</small></span><strong>{formatPrice(line.lineTotal)}</strong></li>)}
        </ul>
      </details>

      <div className="checkout-bar">
        <div className="wrap-narrow">
          <div><small>Tổng cộng</small><strong>{formatPrice(bag.total)}</strong></div>
          <button type="submit" className="primary-btn grow">Gửi yêu cầu</button>
        </div>
      </div>
    </form>
  </main>
}

function Field({ id, label, error, children }: { id: string, label: string, error?: string, children: ReactNode }) {
  return <div className={`field${error ? ' invalid' : ''}`}>
    <label htmlFor={`checkout-${id}`}>{label}</label>
    {children}
    {error && <p className="field-error" role="alert">{error}</p>}
  </div>
}
