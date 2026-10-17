import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Bike, Check, ChevronDown, Clock3, ShoppingBag, Store } from 'lucide-react'
import { NotFound } from '../components/NotFound'
import { formatPrice, vendorBySlug, type Vendor } from '../data'
import { useBag } from '../bag'

type Fulfilment = 'pickup_now' | 'pickup_scheduled' | 'delivery'

const fulfilmentOptions: { id: Fulfilment, title: string, detail: string, icon: ReactNode }[] = [
  { id: 'pickup_now', title: 'Pick up today', detail: 'Usually ready in about 30 minutes', icon: <Store size={22} /> },
  { id: 'pickup_scheduled', title: 'Schedule a pickup', detail: 'Choose a day and time that suits you', icon: <Clock3 size={22} /> },
  { id: 'delivery', title: 'Bring it to me', detail: 'The shop delivers nearby', icon: <Bike size={22} /> },
]

const localToday = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

type Errors = Partial<Record<'name' | 'phone' | 'date' | 'time' | 'address', string>>

export function CheckoutPage() {
  const { vendorId } = useParams({ from: '/shops/$vendorId/checkout' })
  const vendor = vendorBySlug(vendorId)
  if (!vendor) return <NotFound message="We couldn’t find that shop." />
  return <Checkout vendor={vendor} />
}

function Checkout({ vendor }: { vendor: Vendor }) {
  const bag = useBag(vendor.slug)
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
    if (!form.name.trim()) found.name = 'Add a name so the shop knows who’s coming.'
    if (form.phone.replace(/\D/g, '').length < 7) found.phone = 'Add a phone number the shop can reach.'
    if (fulfilment === 'pickup_scheduled' && !form.date) found.date = 'Pick a day.'
    if (fulfilment === 'pickup_scheduled' && !form.time) found.time = 'Pick a time.'
    if (fulfilment === 'delivery' && !form.address.trim()) found.address = 'Add the delivery address.'
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
      <Link to="/shops/$vendorId" params={{ vendorId: vendor.slug }} className="icon-btn back-btn" aria-label={`Back to ${vendor.name}`}><ArrowLeft size={22} /><span>{vendor.name}</span></Link>
      <span className="nav-title">Checkout</span>
      <span className="icon-btn" aria-hidden="true" />
    </div>
  </nav>

  if (sent) return <main className="checkout-page">
    {top}
    <section className="checkout-done wrap-narrow">
      <div className="done-mark"><Check size={30} /></div>
      <span className="mini-label">Request sent</span>
      <h1>{vendor.name} has your order.</h1>
      <p>{sent.count} {sent.count === 1 ? 'item' : 'items'} · {formatPrice(sent.total)}. They’ll confirm by phone or message shortly.</p>
      <p className="fine-print">This is a prototype — nothing has actually been sent yet.</p>
      <Link to="/shops/$vendorId" params={{ vendorId: vendor.slug }} className="primary-btn full">Back to {vendor.name}</Link>
    </section>
  </main>

  if (bag.count === 0) return <main className="checkout-page">
    {top}
    <section className="empty wrap-narrow">
      <ShoppingBag size={36} strokeWidth={1.2} />
      <h3>Your bag is empty</h3>
      <p>Add a few things from {vendor.name} first.</p>
      <Link to="/shops/$vendorId" params={{ vendorId: vendor.slug }} className="secondary-btn">Browse {vendor.name}</Link>
    </section>
  </main>

  return <main className="checkout-page has-bag">
    {top}
    <form className="checkout-form wrap-narrow" onSubmit={submit} noValidate>
      <header>
        <span className="mini-label">{vendor.name} · {vendor.distance}</span>
        <h1>How would you<br /><em>like it?</em></h1>
      </header>

      <fieldset className="fulfil-options">
        <legend className="visually-hidden">Pickup or delivery</legend>
        {fulfilmentOptions.map(option =>
          <label key={option.id} className={fulfilment === option.id ? 'selected' : ''}>
            <input type="radio" name="fulfilment" checked={fulfilment === option.id} onChange={() => setFulfilment(option.id)} />
            {option.icon}
            <span><strong>{option.title}</strong><small>{option.detail}</small></span>
            <i aria-hidden="true"><Check size={14} /></i>
          </label>)}
      </fieldset>

      {fulfilment === 'pickup_scheduled' && <div className="field-row">
        <Field id="date" label="Day" error={errors.date}><input id="checkout-date" type="date" min={localToday()} {...field('date')} /></Field>
        <Field id="time" label="Time" error={errors.time}><input id="checkout-time" type="time" {...field('time')} /></Field>
      </div>}

      {fulfilment === 'delivery' && <Field id="address" label="Delivery address" error={errors.address}>
        <textarea id="checkout-address" rows={2} autoComplete="street-address" {...field('address')} />
      </Field>}

      <h2 className="form-heading">Your details</h2>
      <Field id="name" label="Name" error={errors.name}><input id="checkout-name" autoComplete="name" {...field('name')} /></Field>
      <Field id="phone" label="Phone" error={errors.phone}><input id="checkout-phone" type="tel" inputMode="tel" autoComplete="tel" {...field('phone')} /></Field>
      <Field id="note" label="Note for the shop (optional)"><textarea id="checkout-note" rows={2} {...field('note')} placeholder="Allergies, gate code, gift message…" /></Field>

      <details className="order-summary">
        <summary><span>Order summary · {bag.count} {bag.count === 1 ? 'item' : 'items'}</span><ChevronDown size={18} /></summary>
        <ul>{bag.lines.map(line =>
          <li key={`${line.productId}-${line.unitIndex}`}><span>{line.qty} × {line.product.name} <small>{line.unit.label}</small></span><strong>{formatPrice(line.lineTotal)}</strong></li>)}
        </ul>
      </details>

      <div className="checkout-bar">
        <div className="wrap-narrow">
          <div><small>Total</small><strong>{formatPrice(bag.total)}</strong></div>
          <button type="submit" className="primary-btn grow">Send request</button>
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
