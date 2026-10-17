import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { ArrowLeft, ChevronRight, Heart, ListTree, MessageCircle, Plus, Search, ShoppingBag, X } from 'lucide-react'
import { BagSheet } from '../components/BagSheet'
import { BrandWithNeighbourhood } from '../components/Brand'
import { CategoryTree } from '../components/CategoryTree'
import { NotFound } from '../components/NotFound'
import { Pagination } from '../components/Pagination'
import { ProductSheet } from '../components/ProductSheet'
import { Sheet } from '../components/Sheet'
import { categoryById, categoryTrail, categoryTree, PAGE_SIZE, products, type Product } from '../catalog'
import { formatDistance, formatPrice, vendorBySlug } from '../data'
import { useBag } from '../bag'
import { useNeighbourhood } from '../neighbourhood'

export function ShopPage() {
  const { vendorId } = useParams({ from: '/shops/$vendorId' })
  const vendor = vendorBySlug(vendorId)
  if (!vendor) return <NotFound message="Không tìm thấy cửa hàng này." />
  return <Shop key={vendor.slug} vendorSlug={vendor.slug} />
}

function Shop({ vendorSlug }: { vendorSlug: string }) {
  const vendor = vendorBySlug(vendorSlug)!
  const navigate = useNavigate({ from: '/shops/$vendorId' })
  const { cat, page: requestedPage = 1 } = useSearch({ from: '/shops/$vendorId' })
  const bag = useBag(vendor.slug)
  const { current, setCurrent } = useNeighbourhood()
  const [query, setQuery] = useState('')
  const [openProduct, setOpenProduct] = useState<Product | null>(null)
  const [bagOpen, setBagOpen] = useState(false)
  const [treeOpen, setTreeOpen] = useState(false)
  const [following, setFollowing] = useState(false)
  const [toast, setToast] = useState('')
  const resultsRef = useRef<HTMLDivElement>(null)

  // Opening a shop (e.g. via its code) places you in that shop's neighbourhood.
  useEffect(() => {
    if (current.id !== vendor.neighbourhoodId) setCurrent(vendor.neighbourhoodId)
  }, [vendor.slug])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(timer)
  }, [toast])

  const trail = categoryTrail(cat)
  const selected = trail[trail.length - 1]
  const chipScope = selected?.depth === 3 ? categoryById.get(selected.parentId!) : selected
  const chipNodes = chipScope ? chipScope.children : categoryTree

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter(product =>
      (!cat || product.path.includes(cat)) &&
      (!needle || product.name.toLowerCase().includes(needle)))
  }, [cat, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const firstShown = filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0
  const lastShown = Math.min(page * PAGE_SIZE, filtered.length)

  const scrollToResults = (always: boolean) => requestAnimationFrame(() => {
    const results = resultsRef.current
    if (!results) return
    const stickyBottom = document.querySelector('.shop-tools')?.getBoundingClientRect().bottom ?? 0
    const offset = results.getBoundingClientRect().top - stickyBottom - 8
    if (always || offset < 0) window.scrollBy({ top: offset, behavior: 'smooth' })
  })

  const selectCategory = (id: string | undefined) => {
    setTreeOpen(false)
    navigate({ search: { cat: id }, resetScroll: false })
    scrollToResults(false)
  }

  const goToPage = (next: number) => {
    navigate({ search: previous => ({ ...previous, page: next > 1 ? next : undefined }), resetScroll: false })
    scrollToResults(true)
  }

  const changeQuery = (value: string) => {
    setQuery(value)
    if (requestedPage > 1) navigate({ search: previous => ({ ...previous, page: undefined }), replace: true, resetScroll: false })
  }

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
        <div className="tools-row">
          <button className="tree-btn" onClick={() => setTreeOpen(true)} aria-label="Mở danh mục"><ListTree size={18} /><span>Danh mục</span></button>
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <input type="search" value={query} onChange={event => changeQuery(event.target.value)} placeholder={selected ? `Tìm trong ${selected.name}` : `Tìm trong ${vendor.name}`} aria-label="Tìm sản phẩm" enterKeyHint="search" />
            {query && <button onClick={() => changeQuery('')} aria-label="Xoá tìm kiếm"><X size={16} /></button>}
          </label>
        </div>
        <div className="chips" aria-label="Danh mục con">
          <button className={!selected || selected.id === chipScope?.id ? 'active' : ''} onClick={() => selectCategory(chipScope?.id)}>Tất cả</button>
          {chipNodes.map(node =>
            <button key={node.id} className={selected?.id === node.id ? 'active' : ''} onClick={() => selectCategory(node.id)}>{node.name}</button>)}
        </div>
      </div>
    </div>

    <section className="storefront">
      <div className="wrap store-layout">
        <aside className="store-sidebar"><CategoryTree selectedId={cat} onSelect={selectCategory} /></aside>

        <div className="store-main">
          <div className="results-head" ref={resultsRef}>
            {trail.length > 0 && <nav className="crumbs" aria-label="Đường dẫn danh mục">
              <button onClick={() => selectCategory(undefined)}>Tất cả</button>
              {trail.slice(0, -1).map(node => <span key={node.id}><ChevronRight size={14} aria-hidden="true" /><button onClick={() => selectCategory(node.id)}>{node.name}</button></span>)}
            </nav>}
            <h2>{selected?.name ?? 'Tất cả sản phẩm'}</h2>
            <p className="result-count">{filtered.length
              ? `Hiển thị ${firstShown}–${lastShown} trong ${filtered.length} sản phẩm`
              : 'Không có sản phẩm phù hợp'}</p>
          </div>

          {filtered.length === 0
            ? <div className="empty"><Search size={32} strokeWidth={1.2} /><h3>Không tìm thấy</h3><p>Thử từ khoá hoặc danh mục khác.</p><button className="secondary-btn" onClick={() => { changeQuery(''); selectCategory(undefined) }}>Xem tất cả</button></div>
            : <div className="product-grid">{pageItems.map(product => {
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

          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />

          <div className="store-note">
            <MessageCircle size={20} />
            <p>Cần món theo yêu cầu? <button onClick={() => alert(`Khung chat với ${vendor.name} sẽ mở ở đây.`)}>Nhắn {vendor.name}</button> — chủ tiệm sẽ trả lời ngay.</p>
          </div>
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

    <Sheet open={treeOpen} onClose={() => setTreeOpen(false)} label="Danh mục" className="tree-sheet">
      <div className="sheet-content">
        <span className="mini-label">{vendor.name}</span>
        <h2>Danh mục</h2>
        <CategoryTree selectedId={cat} onSelect={selectCategory} />
      </div>
    </Sheet>
    {openProduct && <ProductSheet key={openProduct.id} product={openProduct} vendor={vendor} onClose={() => setOpenProduct(null)} onAdd={addToBag} />}
    <BagSheet open={bagOpen} vendor={vendor} onClose={() => setBagOpen(false)} onCheckout={() => navigate({ to: '/shops/$vendorId/checkout', params: { vendorId: vendor.slug } })} />
  </main>
}
