import { useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Clock3, MapPin, Menu, ShoppingBag, Sparkles, Store } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { vendorByCode, vendors } from '../data'

const sections = [
  { href: '#shops', label: 'Explore shops' },
  { href: '#how', label: 'How it works' },
  { href: '#sell', label: 'Sell here' },
]

function ShopCodeForm({ inputId }: { inputId: string }) {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const vendor = vendorByCode(code)
    if (!vendor) {
      setError(code.trim() ? `We couldn’t find a shop with code “${code.trim()}”.` : 'Enter a shop code first.')
      return
    }
    navigate({ to: '/shops/$vendorId', params: { vendorId: vendor.slug } })
  }

  return <form className="code-form" onSubmit={submit} noValidate>
    <label htmlFor={inputId} className="visually-hidden">Shop code</label>
    <div className="code-entry">
      <input
        id={inputId}
        value={code}
        onChange={event => { setCode(event.target.value.toUpperCase()); setError('') }}
        placeholder="e.g. LTL-DAY"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="go"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      <button type="submit">Visit <ArrowRight size={17} /></button>
    </div>
    {error && <p className="field-error" id={`${inputId}-error`} role="alert">{error}</p>}
  </form>
}

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const codeSectionRef = useRef<HTMLElement>(null)

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
        <Link to="/" className="brand"><span>n</span>eighbourhood</Link>
        <div className="nav-center">{sections.map(section => <a key={section.href} href={section.href}>{section.label}</a>)}</div>
        <div className="nav-actions">
          <Link className="pill-btn dark nav-enter" to="/shops/$vendorId" params={{ vendorId: vendors[0].slug }}><Store size={18} /><span>Enter a shop</span></Link>
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
        </div>
      </nav>

      <div className="hero wrap">
        <div className="hero-text">
          <div className="eyebrow"><span></span> Made for the people nearby</div>
          <h1>Things worth<br /><em>walking for.</em></h1>
          <p className="hero-copy">Meet the brilliant bakers, makers, growers and cooks in your neighbourhood. No warehouses. No middlemen. Just really good things, nearby.</p>
          <div className="hero-actions">
            <a href="#shops" className="primary-btn">Find something lovely <ArrowRight size={18} /></a>
            <button className="text-btn" onClick={focusCode}>I have a shop code <ArrowRight size={17} /></button>
          </div>
          <div className="hero-foot"><div className="avatars"><i>J</i><i>M</i><i>A</i><i>R</i></div><p><strong>150+ neighbours</strong> already shopping local</p></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="blob blob-one"></div><div className="blob blob-two"></div>
          <div className="hero-card"><span>Today at</span><strong>Little<br />Day</strong><small>0.4 km away</small></div>
          <div className="flower f1">✳</div><div className="flower f2">✦</div><div className="flower f3">●</div>
          <div className="scribble">made around<br />the corner</div>
        </div>
      </div>
    </section>

    <section className="code-strip" ref={codeSectionRef}>
      <div className="wrap code-row">
        <div><span className="mini-label">Already know where you’re going?</span><h2>Enter your shop code</h2></div>
        <ShopCodeForm inputId="shop-code" />
      </div>
    </section>

    <section className="shops wrap" id="shops">
      <div className="section-title"><span className="mini-label">Fresh around you</span><h2>A few good neighbours</h2></div>
      <div className="vendor-grid">{vendors.map((vendor, index) =>
        <Link className="vendor-card" key={vendor.slug} to="/shops/$vendorId" params={{ vendorId: vendor.slug }}>
          <div className="vendor-icon" style={{ background: vendor.color }}>{vendor.emoji}</div>
          <div className="vendor-info"><span>{vendor.kind}</span><h3>{vendor.name}</h3><small>{vendor.distance} · Code {vendor.code}</small></div>
          <ArrowRight className="vendor-arrow" size={20} />
          <div className={`vendor-orb orb-${index}`}></div>
        </Link>)}
      </div>
    </section>

    <section className="leaderboard" id="leaderboard">
      <div className="wrap">
        <div className="board-heading">
          <div><span className="mini-label">The neighbourhood board</span><h2>Who’s making<br /><em>the good stuff.</em></h2></div>
          <p>Shops rise here because neighbours return, save and share them — never because they pay for placement.</p>
        </div>
        <div className="board-layout">
          <Link className="leader-feature" to="/shops/$vendorId" params={{ vendorId: 'le-petit-marche' }}>
            <span className="leader-rank">01</span>
            <div className="leader-symbol">✦</div>
            <div className="leader-name"><span className="mini-label">This week’s favourite</span><h3>Le Petit Marché</h3><p>French pantry · prepared food</p></div>
            <div className="leader-score"><strong>98</strong><span>neighbour<br />score</span></div>
          </Link>
          <div className="board-list">
            <Link to="/shops/$vendorId" params={{ vendorId: 'little-day' }}><b>02</b><span className="board-dot coral">✳</span><div><strong>Little Day</strong><small>Flowers · baking · objects</small></div><em>94</em></Link>
            <Link to="/shops/$vendorId" params={{ vendorId: 'the-green-table' }}><b>03</b><span className="board-dot green">●</span><div><strong>The Green Table</strong><small>Plants · garden supplies</small></div><em>89</em></Link>
            <div className="board-coming"><Sparkles size={17} /><span>New shops appear here as your neighbourhood grows.</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="how wrap" id="how">
      <div className="how-intro"><span className="mini-label">The good kind of convenient</span><h2>Local doesn’t have to be complicated.</h2></div>
      <div className="how-steps">
        <article><MapPin /><div><h3>Find a local gem</h3><p>Browse what’s close, or use a shop’s personal code.</p></div><b>01</b></article>
        <article><ShoppingBag /><div><h3>Reserve your picks</h3><p>Add what you love. Ask the maker anything directly.</p></div><b>02</b></article>
        <article><Clock3 /><div><h3>Get it your way</h3><p>Pop by today, schedule a time, or have it brought to you.</p></div><b>03</b></article>
      </div>
    </section>

    <section className="sell" id="sell">
      <div className="wrap sell-inner">
        <div>
          <span className="mini-label">For vendors</span>
          <h2>Your neighbourhood is your storefront.</h2>
          <p>A softer, simpler way to sell what you make. List your goods, take orders and talk directly to your people.</p>
          <button className="primary-btn" onClick={() => alert('Vendor sign-up is coming soon.')}>Start selling <ArrowRight size={18} /></button>
        </div>
        <div className="sell-stats">
          <div><strong>0%</strong><span>platform commission while we’re growing</span></div>
          <div><strong>1:1</strong><span>conversations with your customers</span></div>
          <div><strong>∞</strong><span>reasons to make good things</span></div>
        </div>
      </div>
    </section>

    <footer className="site-footer wrap"><span className="brand"><i>n</i>eighbourhood</span><span>Built close to home.</span><span>© 2025 Neighbourhood</span></footer>

    <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} label="Menu" className="menu-sheet">
      <nav className="menu-links">
        {sections.map(section => <a key={section.href} href={section.href} onClick={event => goToSection(event, section.href)}>{section.label}<ArrowRight size={18} /></a>)}
      </nav>
      <div className="menu-code">
        <span className="mini-label">Have a shop code?</span>
        <ShopCodeForm inputId="menu-shop-code" />
      </div>
    </Sheet>
  </main>
}
