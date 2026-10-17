import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Camera, Eye, EyeOff, KeyRound, Store, ToggleRight } from 'lucide-react'
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

  return <main className="adm-login">
    <section className="adm-login-intro">
      <nav>
        <Link to="/" className="adm-login-back" aria-label="Về trang chủ"><ArrowLeft size={20} /></Link>
        <Brand as="text" />
        <span className="adm-tag">Bán hàng</span>
      </nav>
      <div className="adm-login-pitch">
        <h1>Quản lý tiệm của bạn, <em>ngay trên điện thoại.</em></h1>
        <ul>
          <li><Camera size={18} /> Chụp ảnh món mới, đăng bán trong một phút</li>
          <li><ToggleRight size={18} /> Bật tắt hàng theo từng cỡ khi hết hàng</li>
          <li><Store size={18} /> Khách trong khu thấy thay đổi ngay</li>
        </ul>
      </div>
    </section>

    <section className="adm-login-card">
      <span className="adm-eyebrow">Dành cho chủ tiệm</span>
      <h2>Đăng nhập</h2>
      <p className="adm-login-sub">Dùng số điện thoại đã đăng ký với quanhTa.</p>

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
        <button className="adm-btn primary block login-submit" type="submit">Đăng nhập <ArrowRight size={18} /></button>
      </form>

      <aside className="demo-card">
        <div className="demo-card-head">
          <span className="adm-shop-mark" style={{ background: demoShop.color }} aria-hidden="true">{demoShop.emoji}</span>
          <div><strong>Tài khoản demo</strong><small>{demoShop.name}</small></div>
          <KeyRound size={18} />
        </div>
        <dl>
          <div><dt>Số điện thoại</dt><dd>{formatPhone(DEMO_ACCOUNT.phone)}</dd></div>
          <div><dt>Mật khẩu</dt><dd>{DEMO_ACCOUNT.password}</dd></div>
        </dl>
        <button type="button" className="adm-btn block" onClick={fillDemo}>Điền tài khoản demo</button>
        <p>Bản thử nghiệm: thay đổi chỉ lưu trên trình duyệt này.</p>
      </aside>
    </section>
  </main>
}
