import { useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Check, Clock3, MapPin, Menu, ShoppingBag, Sparkles, Store } from 'lucide-react'
import { Brand, BrandWithNeighbourhood } from '../components/Brand'
import { Sheet } from '../components/Sheet'
import { formatDistance, RADIUS, vendorByCode, vendorsIn } from '../data'
import { useNeighbourhood } from '../neighbourhood'

const sections = [
  { href: '#shops', label: 'Cửa hàng quanh đây' },
  { href: '#how', label: 'Cách hoạt động' },
  { href: '#sell', label: 'Bán hàng' },
]

const orbClasses = ['orb-0', 'orb-1', 'orb-2']

function ShopCodeForm({ inputId }: { inputId: string }) {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const vendor = vendorByCode(code)
    if (!vendor) {
      setError(code.trim() ? `Không tìm thấy cửa hàng có mã “${code.trim()}”.` : 'Hãy nhập mã cửa hàng trước.')
      return
    }
    navigate({ to: '/shops/$vendorId', params: { vendorId: vendor.slug } })
  }

  return <form className="code-form" onSubmit={submit} noValidate>
    <label htmlFor={inputId} className="visually-hidden">Mã cửa hàng</label>
    <div className="code-entry">
      <input
        id={inputId}
        value={code}
        onChange={event => { setCode(event.target.value.toUpperCase()); setError('') }}
        placeholder="VD: NHAMAY"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="go"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      <button type="submit">Vào <ArrowRight size={17} /></button>
    </div>
    {error && <p className="field-error" id={`${inputId}-error`} role="alert">{error}</p>}
  </form>
}

export function HomePage() {
  const { current, isJoined, join, memberCount } = useNeighbourhood()
  const [menuOpen, setMenuOpen] = useState(false)
  const codeSectionRef = useRef<HTMLElement>(null)
  const localVendors = vendorsIn(current.id)
  const [leader, ...runnersUp] = localVendors
  const joined = isJoined(current.id)

  const focusCode = () => {
    codeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    document.getElementById('shop-code')?.focus({ preventScroll: true })
  }

  const goToSection = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault()
    setMenuOpen(false)
    requestAnimationFrame(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }))
  }

  return <main className="home">
    <section className="hero-shell" id="home">
      <nav className="nav wrap">
        <BrandWithNeighbourhood />
        <div className="nav-center">{sections.map(section => <a key={section.href} href={section.href}>{section.label}</a>)}</div>
        <div className="nav-actions">
          {leader && <Link className="pill-btn dark nav-enter" to="/shops/$vendorId" params={{ vendorId: leader.slug }} aria-label="Vào một cửa hàng"><Store size={18} /><span>Vào cửa hàng</span></Link>}
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Mở menu"><Menu size={22} /></button>
        </div>
      </nav>

      <div className="hero wrap">
        <div className="hero-text">
          <div className="eyebrow"><span></span> Khu phố {current.name} · bán kính {RADIUS}</div>
          <h1>Những điều tốt đẹp<br /><em>ngay quanh ta.</em></h1>
          <p className="hero-copy">Gặp gỡ những tiệm bánh, quầy tạp hoá, người trồng rau và đầu bếp trong vòng {RADIUS} quanh {current.address}. Không kho bãi. Không trung gian.</p>
          <div className="hero-actions">
            {joined
              ? <a href="#shops" className="primary-btn">Xem cửa hàng quanh đây <ArrowRight size={18} /></a>
              : <button className="primary-btn" onClick={() => join(current.id)}>Tham gia khu phố {current.name} <ArrowRight size={18} /></button>}
            <button className="text-btn" onClick={focusCode}>Tôi có mã cửa hàng <ArrowRight size={17} /></button>
          </div>
          <div className="hero-foot">
            <div className="avatars"><i>H</i><i>M</i><i>A</i><i>L</i></div>
            <p>{joined && <span className="joined-tag"><Check size={13} /> Bạn đã tham gia · </span>}<strong>{memberCount(current)} hàng xóm</strong> trong khu phố</p>
          </div>
        </div>
        {leader && <div className="hero-art" aria-hidden="true">
          <div className="blob blob-one"></div><div className="blob blob-two"></div>
          <div className="hero-card"><span>Hôm nay tại</span><strong>{leader.name}</strong><small>Cách {formatDistance(leader.distanceM)}</small></div>
          <div className="flower f1">✳</div><div className="flower f2">✦</div><div className="flower f3">●</div>
          <div className="scribble">ngay đầu<br />ngõ thôi</div>
        </div>}
      </div>
    </section>

    <section className="code-strip" ref={codeSectionRef}>
      <div className="wrap code-row">
        <div><span className="mini-label">Đã biết mình muốn đến đâu?</span><h2>Nhập mã cửa hàng</h2></div>
        <ShopCodeForm inputId="shop-code" />
      </div>
    </section>

    <section className="shops wrap" id="shops">
      <div className="section-title"><span className="mini-label">Trong {RADIUS} quanh {current.shortAddress}</span><h2>Hàng xóm tử tế</h2></div>
      {localVendors.length === 0
        ? <div className="empty"><Store size={32} strokeWidth={1.2} /><h3>Chưa có cửa hàng</h3><p>Khu phố này đang chờ những người bán đầu tiên.</p></div>
        : <div className="vendor-grid">{localVendors.map((vendor, index) =>
            <Link className="vendor-card" key={vendor.slug} to="/shops/$vendorId" params={{ vendorId: vendor.slug }}>
              <div className="vendor-icon" style={{ background: vendor.color }}>{vendor.emoji}</div>
              <div className="vendor-info"><span>{vendor.kind}</span><h3>{vendor.name}</h3><small>Cách {formatDistance(vendor.distanceM)} · Mã {vendor.code}</small></div>
              <ArrowRight className="vendor-arrow" size={20} />
              <div className={`vendor-orb ${orbClasses[index % orbClasses.length]}`}></div>
            </Link>)}
          </div>}
    </section>

    {leader && <section className="leaderboard" id="leaderboard">
      <div className="wrap">
        <div className="board-heading">
          <div><span className="mini-label">Bảng xếp hạng {current.name}</span><h2>Ai đang làm<br /><em>những món ngon nhất.</em></h2></div>
          <p>Cửa hàng được xếp hạng nhờ hàng xóm quay lại, lưu và chia sẻ — không bao giờ vì trả tiền quảng cáo.</p>
        </div>
        <div className="board-layout">
          <Link className="leader-feature" to="/shops/$vendorId" params={{ vendorId: leader.slug }}>
            <span className="leader-rank">01</span>
            <div className="leader-symbol" style={{ background: leader.color }}>{leader.emoji}</div>
            <div className="leader-name"><span className="mini-label">Được yêu thích nhất tuần</span><h3>{leader.name}</h3><p>{leader.kind}</p></div>
            <div className="leader-score"><strong>{leader.score}</strong><span>điểm<br />hàng xóm</span></div>
          </Link>
          <div className="board-list">
            {runnersUp.map((vendor, index) =>
              <Link key={vendor.slug} to="/shops/$vendorId" params={{ vendorId: vendor.slug }}>
                <b>{String(index + 2).padStart(2, '0')}</b>
                <span className="board-dot" style={{ background: vendor.color }}>{vendor.emoji}</span>
                <div><strong>{vendor.name}</strong><small>{vendor.kind}</small></div>
                <em>{vendor.score}</em>
              </Link>)}
            <div className="board-coming"><Sparkles size={17} /><span>Cửa hàng mới sẽ xuất hiện khi khu phố lớn dần.</span></div>
          </div>
        </div>
      </div>
    </section>}

    <section className="how wrap" id="how">
      <div className="how-intro"><span className="mini-label">Tiện lợi theo cách dễ chịu</span><h2>Mua sắm quanh nhà, đơn giản thôi.</h2></div>
      <div className="how-steps">
        <article><MapPin /><div><h3>Chọn khu phố</h3><p>Mỗi khu phố là bán kính {RADIUS} quanh một địa chỉ — nơi bạn sống hoặc làm việc.</p></div><b>01</b></article>
        <article><ShoppingBag /><div><h3>Chọn món yêu thích</h3><p>Thêm vào túi, hỏi trực tiếp chủ tiệm bất cứ điều gì.</p></div><b>02</b></article>
        <article><Clock3 /><div><h3>Nhận theo cách của bạn</h3><p>Ghé lấy hôm nay, hẹn giờ, hoặc nhờ giao tận nơi.</p></div><b>03</b></article>
      </div>
    </section>

    <section className="sell" id="sell">
      <div className="wrap sell-inner">
        <div>
          <span className="mini-label">Dành cho người bán</span>
          <h2>Khu phố là mặt tiền của bạn.</h2>
          <p>Cách bán hàng nhẹ nhàng hơn cho những gì bạn làm ra. Đăng sản phẩm, nhận đơn và trò chuyện trực tiếp với hàng xóm.</p>
          <Link to="/vendor/login" className="primary-btn">Đăng nhập bán hàng <ArrowRight size={18} /></Link>
        </div>
        <div className="sell-stats">
          <div><strong>0%</strong><span>phí nền tảng trong giai đoạn đầu</span></div>
          <div><strong>1:1</strong><span>trò chuyện trực tiếp với khách</span></div>
          <div><strong>{RADIUS}</strong><span>là đủ để có khách quen</span></div>
        </div>
      </div>
    </section>

    <footer className="site-footer wrap"><Brand as="text" /><span>Làm ra từ khu phố.</span><span>© 2026 quanhTa</span></footer>

    <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} label="Menu" className="menu-sheet">
      <nav className="menu-links">
        {sections.map(section => <a key={section.href} href={section.href} onClick={event => goToSection(event, section.href)}>{section.label}<ArrowRight size={18} /></a>)}
      </nav>
      <div className="menu-code">
        <span className="mini-label">Có mã cửa hàng?</span>
        <ShopCodeForm inputId="menu-shop-code" />
      </div>
    </Sheet>
  </main>
}
