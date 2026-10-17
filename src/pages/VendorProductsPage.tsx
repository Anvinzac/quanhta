import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from '@tanstack/react-router'
import { ExternalLink, LogOut, PackageOpen, Plus, RotateCcw, Search, X } from 'lucide-react'
import { Brand } from '../components/Brand'
import { Pagination } from '../components/Pagination'
import { ProductEditor } from '../components/ProductEditor'
import { Switch } from '../components/Switch'
import { categoryTrail, categoryTree, isSoldOut, isUnitAvailable, PAGE_SIZE, type Product } from '../catalog'
import { formatPrice, vendorBySlug } from '../data'
import { useCatalog, useInventoryEditor } from '../inventory'
import { useVendorAuth } from '../vendorAuth'

type Status = 'all' | 'listed' | 'soldout' | 'hidden'

const statusOf = (product: Product): Exclude<Status, 'all'> =>
  product.hidden ? 'hidden' : isSoldOut(product) ? 'soldout' : 'listed'

const statusTabs: { id: Status, label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'listed', label: 'Đang bán' },
  { id: 'soldout', label: 'Hết hàng' },
  { id: 'hidden', label: 'Đã ẩn' },
]

const statusLabel: Record<Exclude<Status, 'all'>, string> = { listed: 'Đang bán', soldout: 'Hết hàng', hidden: 'Đã ẩn' }

function priceRange(product: Product) {
  const prices = product.units.map(unit => unit.price)
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  return low === high ? formatPrice(low) : `${formatPrice(low)} – ${formatPrice(high)}`
}

export function VendorProductsPage() {
  const { session } = useVendorAuth()
  if (!session) return <Navigate to="/vendor/login" replace />
  return <Manager vendorSlug={session.vendorSlug} ownerName={session.ownerName} />
}

function Manager({ vendorSlug, ownerName }: { vendorSlug: string, ownerName: string }) {
  const vendor = vendorBySlug(vendorSlug)!
  const { signOut } = useVendorAuth()
  const { all } = useCatalog(vendorSlug)
  const inventory = useInventoryEditor(vendorSlug)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status>('all')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timer)
  }, [toast])

  const statusCounts = useMemo(() => {
    const counts: Record<Status, number> = { all: all.length, listed: 0, soldout: 0, hidden: 0 }
    for (const product of all) counts[statusOf(product)] += 1
    return counts
  }, [all])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return all.filter(product =>
      (status === 'all' || statusOf(product) === status) &&
      (!category || product.path.includes(category)) &&
      (!needle || product.name.toLowerCase().includes(needle) || String(product.id) === needle))
  }, [all, query, status, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => { setter(value); setPage(1) }

  const goToPage = (next: number) => {
    setPage(next)
    document.querySelector('.inv-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const save = (product: Product) => {
    const isNew = editing === 'new'
    inventory.save(product)
    setEditing(null)
    setToast(isNew ? `Đã thêm “${product.name}”` : `Đã lưu “${product.name}”`)
  }

  const remove = (id: number) => {
    const name = all.find(product => product.id === id)?.name
    inventory.remove(id)
    setEditing(null)
    setToast(`Đã xoá “${name}”`)
  }

  const toggleHidden = (product: Product) => {
    inventory.setHidden(product.id, !product.hidden)
    setToast(product.hidden ? `“${product.name}” đã hiện trong cửa hàng` : `Đã ẩn “${product.name}”`)
  }

  const resetDemo = () => {
    if (!window.confirm('Khôi phục danh sách sản phẩm demo ban đầu? Mọi thay đổi sẽ mất.')) return
    inventory.reset()
    setToast('Đã khôi phục dữ liệu demo')
  }

  return <main className="vendor-page">
    <header className="vendor-bar">
      <div className="wrap vendor-bar-inner">
        <Link to="/" className="vendor-brand" aria-label="quanhTa — trang chủ"><Brand as="text" /><span className="login-tag">Bán hàng</span></Link>
        <div className="vendor-bar-actions">
          <Link to="/shops/$vendorId" params={{ vendorId: vendor.slug }} className="pill-link"><ExternalLink size={16} /><span>Xem cửa hàng</span></Link>
          <button className="icon-btn" onClick={signOut} aria-label="Đăng xuất"><LogOut size={20} /></button>
        </div>
      </div>
    </header>

    <section className="wrap inv-head">
      <div className="inv-shop">
        <span className="inv-shop-symbol" style={{ background: vendor.color }} aria-hidden="true">{vendor.emoji}</span>
        <div>
          <span className="mini-label">Xin chào, {ownerName}</span>
          <h1>Sản phẩm</h1>
          <p>{vendor.name} · {statusCounts.listed} món đang bán</p>
        </div>
      </div>
      <button className="primary-btn inv-add-desktop" onClick={() => setEditing('new')}><Plus size={18} /> Thêm sản phẩm</button>
    </section>

    <div className="inv-tools">
      <div className="wrap">
        <div className="inv-filters">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <input type="search" value={query} onChange={event => resetPage(setQuery)(event.target.value)} placeholder="Tìm tên hoặc mã SP" aria-label="Tìm sản phẩm" />
            {query && <button onClick={() => resetPage(setQuery)('')} aria-label="Xoá tìm kiếm"><X size={16} /></button>}
          </label>
          <select className="inv-category" value={category} onChange={event => resetPage(setCategory)(event.target.value)} aria-label="Lọc theo danh mục">
            <option value="">Mọi danh mục</option>
            {categoryTree.map(department => <optgroup key={department.id} label={department.name}>
              <option value={department.id}>Tất cả {department.name.toLowerCase()}</option>
              {department.children.map(node => <option key={node.id} value={node.id}>{node.name}</option>)}
            </optgroup>)}
          </select>
        </div>
        <div className="chips inv-status" role="tablist" aria-label="Trạng thái">
          {statusTabs.map(tab => <button key={tab.id} role="tab" aria-selected={status === tab.id} className={status === tab.id ? 'active' : ''} onClick={() => resetPage(setStatus)(tab.id)}>
            {tab.label}<small>{statusCounts[tab.id]}</small>
          </button>)}
        </div>
      </div>
    </div>

    <section className="wrap inv-results">
      {inventory.persistFailed && <p className="storage-warning" role="alert">
        Bộ nhớ trình duyệt đã đầy nên thay đổi gần nhất chưa được lưu lâu dài. Hãy xoá bớt ảnh tự chụp hoặc dùng ảnh mẫu.
      </p>}
      <p className="result-count">{filtered.length
        ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} trong ${filtered.length} sản phẩm`
        : 'Không có sản phẩm phù hợp'}</p>

      {filtered.length === 0
        ? <div className="empty"><PackageOpen size={34} strokeWidth={1.2} /><h3>Chưa có gì ở đây</h3><p>Thử bộ lọc khác, hoặc thêm sản phẩm mới.</p>
            <button className="secondary-btn" onClick={() => { setQuery(''); setStatus('all'); setCategory(''); setPage(1) }}>Xoá bộ lọc</button></div>
        : <ul className="inv-list">{pageItems.map(product => {
            const state = statusOf(product)
            const offUnits = product.units.filter(unit => !isUnitAvailable(unit)).length
            return <li key={product.id} className={`inv-row ${state}`}>
              <button className="inv-open" onClick={() => setEditing(product)} aria-label={`Sửa ${product.name}`}>
                <img src={product.image} alt="" loading="lazy" />
                <span className="inv-main">
                  <strong>{product.name}</strong>
                  <small>{categoryTrail(product.path[2]).slice(1).map(node => node.name).join(' › ')}</small>
                  <span className="inv-price">{priceRange(product)} · {product.units.length} cỡ</span>
                </span>
              </button>
              <div className="inv-side">
                <span className={`status-pill ${state}`}>{statusLabel[state]}</span>
                {state === 'listed' && offUnits > 0 && <span className="inv-warn">Hết {offUnits} cỡ</span>}
                <Switch checked={!product.hidden} onChange={() => toggleHidden(product)} label={`Hiển thị ${product.name}`} hideLabel />
              </div>
            </li>
          })}</ul>}

      <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />

      {inventory.isCustomised && <button className="text-btn inv-reset" onClick={resetDemo}><RotateCcw size={16} /> Khôi phục dữ liệu demo</button>}
    </section>

    <button className="inv-fab" onClick={() => setEditing('new')} aria-label="Thêm sản phẩm"><Plus size={24} /></button>

    <div className="toast" role="status" aria-live="polite">{toast && <span>{toast}</span>}</div>

    {editing && <ProductEditor
      key={editing === 'new' ? 'new' : editing.id}
      product={editing === 'new' ? null : editing}
      nextId={inventory.nextId()}
      onSave={save}
      onDelete={remove}
      onClose={() => setEditing(null)}
    />}
  </main>
}
