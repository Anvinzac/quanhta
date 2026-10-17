import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Store } from 'lucide-react'
import { Brand } from '../components/Brand'
import { vendorBySlug } from '../data'
import { DEMO_ACCOUNT, formatPhone, useVendorAuth } from '../vendorAuth'

export function VendorLoginPage() {
  const { session, signIn } = useVendorAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const demoShop = vendorBySlug(DEMO_ACCOUNT.vendorSlug)!

  if (session) return <Navigate to="/vendor/products" replace />

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!phone.trim() || !password) return setError('Nhập số điện thoại và mật khẩu.')
    if (!signIn(phone, password)) return setError('Số điện thoại hoặc mật khẩu chưa đúng.')
    navigate({ to: '/vendor/products' })
  }

  const fillDemo = () => {
    setPhone(formatPhone(DEMO_ACCOUNT.phone))
    setPassword(DEMO_ACCOUNT.password)
    setError('')
  }

  return <main className="vendor-login">
    <nav className="wrap-narrow login-nav">
      <Link to="/" className="icon-btn" aria-label="Về trang chủ"><ArrowLeft size={22} /></Link>
      <Brand as="text" />
      <span className="login-tag">Bán hàng</span>
    </nav>

    <section className="wrap-narrow">
      <span className="mini-label">Dành cho chủ tiệm</span>
      <h1>Đăng nhập để quản lý cửa hàng</h1>

      <form onSubmit={submit} noValidate>
        <div className={`field${error ? ' invalid' : ''}`}>
          <label htmlFor="vendor-phone">Số điện thoại</label>
          <input id="vendor-phone" type="tel" inputMode="tel" autoComplete="username" value={phone} onChange={event => { setPhone(event.target.value); setError('') }} placeholder="0901 234 567" />
        </div>
        <div className={`field password-field${error ? ' invalid' : ''}`}>
          <label htmlFor="vendor-password">Mật khẩu</label>
          <input id="vendor-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => { setPassword(event.target.value); setError('') }} />
          <button type="button" className="reveal" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="primary-btn full login-submit" type="submit">Đăng nhập <ArrowRight size={18} /></button>
      </form>

      <aside className="demo-card">
        <div className="demo-card-head"><KeyRound size={18} /><strong>Tài khoản demo</strong></div>
        <dl>
          <div><dt>Số điện thoại</dt><dd>{formatPhone(DEMO_ACCOUNT.phone)}</dd></div>
          <div><dt>Mật khẩu</dt><dd>{DEMO_ACCOUNT.password}</dd></div>
          <div><dt>Cửa hàng</dt><dd><Store size={14} /> {demoShop.name}</dd></div>
        </dl>
        <button type="button" className="secondary-btn" onClick={fillDemo}>Điền tài khoản demo</button>
        <p>Bản thử nghiệm: thay đổi chỉ lưu trên trình duyệt này.</p>
      </aside>
    </section>
  </main>
}
