import { useEffect, useMemo, useState } from 'react'
import { Navigate } from '@tanstack/react-router'
import { ChevronDown, CircleCheck, CircleSlash, EyeOff, Layers, PackageOpen, Plus, RotateCcw, Search, SlidersHorizontal, X, type LucideIcon } from 'lucide-react'
import { Pagination } from '../components/Pagination'
import { ProductEditor } from '../components/ProductEditor'
import { Switch } from '../components/Switch'
import { VendorShell } from '../components/VendorShell'
import { categoryTrail, categoryTree, isSoldOut, isUnitAvailable, PAGE_SIZE, type Product } from '../catalog'
import { formatPrice, vendorBySlug } from '../data'
import { useCatalog, useInventoryEditor } from '../inventory'
import { useVendorAuth } from '../vendorAuth'

type Status = 'all' | 'listed' | 'soldout' | 'hidden'

const statusOf = (product: Product): Exclude<Status, 'all'> =>
  product.hidden ? 'hidden' : isSoldOut(product) ? 'soldout' : 'listed'

const statusCards: { id: Status, label: string, caption: string, icon: LucideIcon }[] = [
  { id: 'all', label: 'Tất cả', caption: 'Sản phẩm trong danh mục của tiệm', icon: Layers },
  { id: 'listed', label: 'Đang bán', caption: '', icon: CircleCheck },
  { id: 'soldout', label: 'Hết hàng', caption: 'Khách thấy nhưng không đặt được', icon: CircleSlash },
  { id: 'hidden', label: 'Đã ẩn', caption: 'Khách không thấy trong tiệm', icon: EyeOff },
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

  const partialCount = useMemo(() => all.filter(product =>
    statusOf(product) === 'listed' && product.units.some(unit => !isUnitAvailable(unit))).length, [all])

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

  const clearFilters = () => { setQuery(''); setStatus('all'); setCategory(''); setPage(1) }
  const hasFilters = Boolean(query || category || status !== 'all')

  return <VendorShell vendor={vendor} ownerName={ownerName} productCount={all.length}>
    <header className="adm-head">
      <div>
        <span className="adm-eyebrow">Xin chào, {ownerName}</span>
        <h1>Sản phẩm</h1>
        <p>Thêm món, chụp ảnh, đổi giá và bật tắt hàng. Khách thấy ngay thay đổi.</p>
      </div>
      <button className="adm-btn primary adm-add" onClick={() => setEditing('new')}><Plus size={18} /> Thêm sản phẩm</button>
    </header>

    {inventory.persistFailed && <p className="storage-warning" role="alert">
      Bộ nhớ trình duyệt đã đầy nên thay đổi gần nhất chưa được lưu lâu dài. Hãy xoá bớt ảnh tự chụp hoặc dùng ảnh mẫu.
    </p>}

    <div className="adm-stats" role="tablist" aria-label="Lọc theo trạng thái">
      {statusCards.map(card => <button
        key={card.id}
        role="tab"
        aria-selected={status === card.id}
        className={`adm-stat ${card.id}${status === card.id ? ' active' : ''}`}
        onClick={() => resetPage(setStatus)(status === card.id && card.id !== 'all' ? 'all' : card.id)}
      >
        <span className="adm-stat-icon"><card.icon size={18} /></span>
        <span className="adm-stat-label">{card.label}</span>
        <strong>{statusCounts[card.id]}</strong>
        <small>{card.id === 'listed'
          ? partialCount ? `${partialCount} món thiếu cỡ` : 'Đủ hàng mọi cỡ'
          : card.caption}</small>
      </button>)}
    </div>

    <section className="adm-panel inv-results">
      <div className="adm-toolbar">
        <label className="adm-search">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={query} onChange={event => resetPage(setQuery)(event.target.value)} placeholder="Tìm tên hoặc mã sản phẩm" aria-label="Tìm sản phẩm" />
          {query && <button onClick={() => resetPage(setQuery)('')} aria-label="Xoá tìm kiếm"><X size={15} /></button>}
        </label>
        <label className="adm-select">
          <SlidersHorizontal size={16} aria-hidden="true" />
          <select value={category} onChange={event => resetPage(setCategory)(event.target.value)} aria-label="Lọc theo danh mục">
            <option value="">Mọi danh mục</option>
            {categoryTree.map(department => <optgroup key={department.id} label={department.name}>
              <option value={department.id}>Tất cả {department.name.toLowerCase()}</option>
              {department.children.map(node => <option key={node.id} value={node.id}>{node.name}</option>)}
            </optgroup>)}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </label>
        {hasFilters && <button className="adm-clear" onClick={clearFilters}>Xoá lọc</button>}
      </div>

      {filtered.length === 0
        ? <div className="adm-empty">
            <span><PackageOpen size={28} strokeWidth={1.5} /></span>
            <h3>Không có sản phẩm phù hợp</h3>
            <p>Thử từ khoá hoặc bộ lọc khác, hoặc thêm sản phẩm mới.</p>
            <button className="adm-btn" onClick={clearFilters}>Xoá bộ lọc</button>
          </div>
        : <>
          <div className="inv-thead" aria-hidden="true">
            <span>Sản phẩm</span><span>Danh mục</span><span>Giá bán</span><span>Cỡ còn hàng</span><span>Trạng thái</span><span>Hiển thị</span>
          </div>
          <ul className="inv-list">{pageItems.map(product => {
            const state = statusOf(product)
            const availableUnits = product.units.filter(isUnitAvailable).length
            const pill = state === 'listed' && availableUnits < product.units.length ? 'partial' : state
            const trail = categoryTrail(product.path[2]).slice(1).map(node => node.name)
            return <li key={product.id} className={`inv-row ${state}`}>
              <button className="inv-open" onClick={() => setEditing(product)} aria-label={`Sửa ${product.name}`}>
                <img src={product.image} alt="" loading="lazy" />
                <span className="inv-name">
                  <strong>{product.name}</strong>
                  <small><span className="inv-id">#{product.id}</span><span className="inv-trail"> · {trail.join(' › ')}</span></small>
                </span>
                <span className="inv-cat">{trail[trail.length - 1]}<small>{trail[0]}</small></span>
                <span className="inv-price">{priceRange(product)}</span>
                <span className="inv-sizes" title={product.units.map(unit => `${unit.label}${isUnitAvailable(unit) ? '' : ' (hết)'}`).join(', ')}>
                  <span className="inv-dots">{product.units.map((unit, index) => <i key={index} className={isUnitAvailable(unit) ? '' : 'off'} />)}</span>
                  {availableUnits}/{product.units.length}
                </span>
                <span className={`status-pill ${pill}`}>{pill === 'partial' ? `Thiếu ${product.units.length - availableUnits} cỡ` : statusLabel[state]}</span>
              </button>
              <div className="inv-toggle">
                <Switch checked={!product.hidden} onChange={() => toggleHidden(product)} label={`Hiển thị ${product.name}`} hideLabel />
              </div>
            </li>
          })}</ul>
          <footer className="adm-panel-foot">
            <span>{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} trong {filtered.length} sản phẩm</span>
            <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
          </footer>
        </>}
    </section>

    {inventory.isCustomised && <button className="adm-reset" onClick={resetDemo}><RotateCcw size={15} /> Khôi phục dữ liệu demo</button>}

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
  </VendorShell>
}
