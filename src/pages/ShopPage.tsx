import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Heart, MessageCircle, Plus, Search, ShoppingBag, X } from 'lucide-react'
import { BagSheet } from '../components/BagSheet'
import { BrandWithNeighbourhood } from '../components/Brand'
import { NotFound } from '../components/NotFound'
import { ProductSheet } from '../components/ProductSheet'
import { categories, formatDistance, formatPrice, products, vendorBySlug, type Product } from '../data'
import { useBag } from '../bag'
import { useNeighbourhood } from '../neighbourhood'

const ALL = 'Tất cả'

export function ShopPage() {
  const { vendorId } = useParams({ from: '/shops/$vendorId' })
  const vendor = vendorBySlug(vendorId)
  if (!vendor) return <NotFound message="Không tìm thấy cửa hàng này." />
  return <Shop key={vendor.slug} vendorSlug={vendor.slug} />
}

function Shop({ vendorSlug }: { vendorSlug: string }) {
  const vendor = vendorBySlug(vendorSlug)!
  const navigate = useNavigate()
  const bag = useBag(vendor.slug)
  const { current, setCurrent } = useNeighbourhood()
  const [category, setCategory] = useState(ALL)
  const [query, setQuery] = useState('')
  const [openProduct, setOpenProduct] = useState<Product | null>(null)
  const [bagOpen, setBagOpen] = useState(false)
  const [following, setFollowing] = useState(false)
  const [toast, setToast] = useState('')

  // Opening a shop (e.g. via its code) places you in that shop's neighbourhood.
  useEffect(() => {
    if (current.id !== vendor.neighbourhoodId) setCurrent(vendor.neighbourhoodId)
  }, [vendor.slug])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(timer)
  }, [toast])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter(product =>
      (category === ALL || product.category === category) &&
      (!needle || product.name.toLowerCase().includes(needle)))
  }, [category, query])

  const addToBag = (product: Product, unitIndex: number, qty: number) => {
    bag.add(product.id, unitIndex, qty)
    setOpenProduct(null)
    setToast(`Đã thêm ${qty > 1 ? `${qty} × ` : ''}${product.units[unitIndex].label} ${product.name}`)
  }

  const onSwitchNeighbourhood = (id: string) => {
    if (id !== vendor.neighbourhoodId) navigate({ to: '/' })
  }

  return <main className={`shop-page${bag.count ? ' has-bag' : ''}`} style={{ '--vendor-color': vendor.color } as CSSProperties}>
    <nav className="shop-nav">
      <div className="wrap shop-nav-inner">
        <Link to="/" className="icon-btn back-btn" aria-label="Tất cả cửa hàng"><ArrowLeft size={22} /><span>Cửa hàng</span></Link>
        <BrandWithNeighbourhood onSwitch={onSwitchNeighbourhood} />
        <button className="icon-btn bag-nav" onClick={() => setBagOpen(true)} aria-label={`Mở túi, ${bag.count} món`}>
          <ShoppingBag size={21} />{bag.count > 0 && <span className="bag-count">{bag.count}</span>}
        </button>
      </div>
    </nav>

    <header className="vendor-hero">
      <div className="wrap vendor-hero-inner">
        <div className="vendor-hero-symbol" aria-hidden="true">{vendor.emoji}</div>
        <div className="vendor-hero-text">
          <span className="mini-label">Cách {formatDistance(vendor.distanceM)} · Mã {vendor.code}</span>
          <h1>{vendor.name}</h1>
          <p>{vendor.line}</p>
        </div>
        <button className={`follow${following ? ' on' : ''}`} onClick={() => setFollowing(value => !value)} aria-pressed={following}>
          <Heart size={18} fill={following ? 'currentColor' : 'none'} /><span>{following ? 'Đang theo dõi' : 'Theo dõi'}</span>
        </button>
      </div>
    </header>

    <div className="shop-tools">
      <div className="wrap">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={`Tìm trong ${vendor.name}`} aria-label={`Tìm trong ${vendor.name}`} enterKeyHint="search" />
          {query && <button onClick={() => setQuery('')} aria-label="Xoá tìm kiếm"><X size={16} /></button>}
        </label>
        <div className="chips" role="tablist" aria-label="Danh mục">
          {[ALL, ...categories].map(name =>
            <button key={name} role="tab" aria-selected={category === name} className={category === name ? 'active' : ''} onClick={() => setCategory(name)}>{name}</button>)}
        </div>
      </div>
    </div>

    <section className="storefront">
      <div className="wrap">
        <p className="result-count">{visible.length} sản phẩm{category !== ALL ? ` trong ${category}` : ''}</p>
        {visible.length === 0
          ? <div className="empty"><Search size={32} strokeWidth={1.2} /><h3>Không tìm thấy</h3><p>Thử từ khoá hoặc danh mục khác.</p><button className="secondary-btn" onClick={() => { setQuery(''); setCategory(ALL) }}>Xem tất cả</button></div>
          : <div className="product-grid">{visible.map(product => {
              const inBag = bag.qtyOfProduct(product.id)
              return <button className="product-card" key={product.id} onClick={() => setOpenProduct(product)}>
                <div className={`product-image ${product.tone}`}>
                  <img src={product.image} alt="" loading="lazy" />
                  {product.badge && <span className="badge">{product.badge}</span>}
                  {inBag > 0 && <span className="in-bag">{inBag} trong túi</span>}
                  <span className="add-btn" aria-hidden="true"><Plus size={20} /></span>
                </div>
                <h3>{product.name}</h3>
                <p><strong>từ {formatPrice(product.units[0].price)}</strong> · 3 cỡ</p>
              </button>
            })}</div>}

        <div className="store-note">
          <MessageCircle size={20} />
          <p>Cần món theo yêu cầu? <button onClick={() => alert(`Khung chat với ${vendor.name} sẽ mở ở đây.`)}>Nhắn {vendor.name}</button> — chủ tiệm sẽ trả lời ngay.</p>
        </div>
      </div>
    </section>

    <div className="toast" role="status" aria-live="polite">{toast && <span>{toast}</span>}</div>

    {bag.count > 0 && <div className="bag-bar">
      <button onClick={() => setBagOpen(true)}>
        <span className="bag-bar-count">{bag.count}</span>
        <span>Xem túi</span>
        <strong>{formatPrice(bag.total)}</strong>
      </button>
    </div>}

    {openProduct && <ProductSheet key={openProduct.id} product={openProduct} vendor={vendor} onClose={() => setOpenProduct(null)} onAdd={addToBag} />}
    <BagSheet open={bagOpen} vendor={vendor} onClose={() => setBagOpen(false)} onCheckout={() => navigate({ to: '/shops/$vendorId/checkout', params: { vendorId: vendor.slug } })} />
  </main>
}
