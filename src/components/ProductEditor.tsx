import { useRef, useState } from 'react'
import { Camera, ImagePlus, Plus, Trash2 } from 'lucide-react'
import { CameraCapture } from './CameraCapture'
import { Sheet } from './Sheet'
import { canUseWebcam, photoFromFile, prefersNativeCamera } from '../lib/photo'
import { Switch } from './Switch'
import { DEFAULT_MAX_QTY, imagePool, subcategoryOptions, type Product } from '../catalog'

const MAX_UNITS = 5

type UnitDraft = { label: string, count: string, price: string, available: boolean }
type Draft = {
  name: string
  subId: string
  note: string
  image: string
  badge: boolean
  maxQty: string
  hidden: boolean
  units: UnitDraft[]
}
type Errors = Partial<Record<'name' | 'subId' | 'maxQty', string>> & { unitRows?: Record<number, string> }

const digits = (value: string) => value.replace(/\D/g, '')
const groupThousands = (value: string) => value ? Number(value).toLocaleString('vi-VN') : ''

function toDraft(product: Product | null): Draft {
  if (!product) return {
    name: '', subId: '', note: '', image: imagePool[0], badge: false, maxQty: String(DEFAULT_MAX_QTY), hidden: false,
    units: [{ label: '1 cái', count: '1', price: '', available: true }],
  }
  return {
    name: product.name,
    subId: product.path[2],
    note: product.note,
    image: product.image,
    badge: Boolean(product.badge),
    maxQty: String(product.maxQty ?? DEFAULT_MAX_QTY),
    hidden: Boolean(product.hidden),
    units: product.units.map(unit => ({ label: unit.label, count: String(unit.count), price: String(unit.price), available: unit.available !== false })),
  }
}

function validate(draft: Draft): Errors {
  const errors: Errors = {}
  if (!draft.name.trim()) errors.name = 'Nhập tên sản phẩm.'
  if (!draft.subId) errors.subId = 'Chọn danh mục.'
  const max = Number(draft.maxQty)
  if (!Number.isInteger(max) || max < 1 || max > 99) errors.maxQty = 'Từ 1 đến 99.'
  const unitRows: Record<number, string> = {}
  draft.units.forEach((unit, index) => {
    if (!unit.label.trim()) unitRows[index] = 'Nhập tên cỡ, ví dụ “lốc 6 chai”.'
    else if (!(Number(unit.count) >= 1)) unitRows[index] = 'Số lượng mỗi cỡ ít nhất là 1.'
    else if (!unit.price) unitRows[index] = 'Nhập giá bán.'
  })
  if (Object.keys(unitRows).length) errors.unitRows = unitRows
  return errors
}

type ProductEditorProps = {
  product: Product | null
  nextId: number
  onSave: (product: Product) => void
  onDelete: (id: number) => void
  onClose: () => void
}

export function ProductEditor({ product, nextId, onSave, onDelete, onClose }: ProductEditorProps) {
  const [initial] = useState(() => toDraft(product))
  const [draft, setDraft] = useState(initial)
  const [errors, setErrors] = useState<Errors>({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const captureInputRef = useRef<HTMLInputElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const isNew = product === null
  const ownPhoto = !imagePool.includes(draft.image)

  const takePhoto = () => {
    setPhotoError('')
    if (prefersNativeCamera() || !canUseWebcam()) captureInputRef.current?.click()
    else setCameraOpen(true)
  }

  const handlePhotoFile = async (input: HTMLInputElement) => {
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    setPhotoBusy(true)
    setPhotoError('')
    try {
      set('image', await photoFromFile(file))
    } catch {
      setPhotoError('Không đọc được ảnh này. Hãy thử ảnh JPG hoặc PNG khác.')
    } finally {
      setPhotoBusy(false)
    }
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(current => ({ ...current, [key]: value }))
  const setUnits = (update: (units: UnitDraft[]) => UnitDraft[]) => setDraft(current => ({ ...current, units: update(current.units) }))
  const setUnit = (index: number, patch: Partial<UnitDraft>) =>
    setUnits(units => units.map((unit, i) => i === index ? { ...unit, ...patch } : unit))

  const requestClose = () => {
    if (JSON.stringify(draft) !== JSON.stringify(initial) && !window.confirm('Bỏ các thay đổi chưa lưu?')) return
    onClose()
  }

  const save = () => {
    const found = validate(draft)
    setErrors(found)
    if (Object.keys(found).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('.editor-sheet .invalid input, .editor-sheet .invalid select, .editor-sheet .unit-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
      return
    }
    const option = subcategoryOptions.find(item => item.path[2] === draft.subId)!
    const maxQty = Number(draft.maxQty)
    onSave({
      id: product?.id ?? nextId,
      name: draft.name.trim(),
      path: option.path,
      units: draft.units.map(unit => ({ label: unit.label.trim(), count: Number(unit.count), price: Number(unit.price), available: unit.available })),
      image: draft.image,
      tone: product?.tone ?? 'leaf',
      note: draft.note.trim(),
      badge: draft.badge ? 'bán chạy' : undefined,
      maxQty: maxQty === DEFAULT_MAX_QTY ? undefined : maxQty,
      hidden: draft.hidden,
    })
  }

  const groups = [...new Set(subcategoryOptions.map(option => option.group))]

  return <Sheet
    open
    onClose={requestClose}
    label={isNew ? 'Thêm sản phẩm' : `Sửa ${product.name}`}
    className="editor-sheet"
    footer={<div className="editor-actions">
      {!isNew && <button
        className={`delete-btn${confirmDelete ? ' confirm' : ''}`}
        onClick={() => confirmDelete ? onDelete(product.id) : setConfirmDelete(true)}
        onBlur={() => setConfirmDelete(false)}
      >
        <Trash2 size={18} /><span>{confirmDelete ? 'Chạm lần nữa để xoá' : 'Xoá'}</span>
      </button>}
      <button className="primary-btn grow" onClick={save}>{isNew ? 'Thêm sản phẩm' : 'Lưu thay đổi'}</button>
    </div>}
  >
    <div className="sheet-content editor">
      <header className="editor-head">
        <span className="adm-eyebrow">{isNew ? 'Sản phẩm mới' : `Mã SP #${product.id}`}</span>
        <h2>{isNew ? 'Thêm sản phẩm' : product.name}</h2>
      </header>

      <section className="ed-card">
        <h3 className="ed-title">Thông tin</h3>
        <div className={`field${errors.name ? ' invalid' : ''}`}>
          <label htmlFor="edit-name">Tên sản phẩm</label>
          <input id="edit-name" value={draft.name} maxLength={80} onChange={event => set('name', event.target.value)} placeholder="Ví dụ: Bánh mì hoa cúc" />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className={`field${errors.subId ? ' invalid' : ''}`}>
          <label htmlFor="edit-category">Danh mục</label>
          <select id="edit-category" value={draft.subId} onChange={event => set('subId', event.target.value)}>
            <option value="" disabled>Chọn danh mục…</option>
            {groups.map(group => <optgroup key={group} label={group}>
              {subcategoryOptions.filter(option => option.group === group).map(option =>
                <option key={option.path[2]} value={option.path[2]}>{option.label}</option>)}
            </optgroup>)}
          </select>
          {errors.subId && <p className="field-error">{errors.subId}</p>}
        </div>

        <div className="field">
          <label htmlFor="edit-note">Mô tả</label>
          <textarea id="edit-note" rows={3} value={draft.note} maxLength={300} onChange={event => set('note', event.target.value)} placeholder="Nguyên liệu, hạn dùng, cách bảo quản…" />
        </div>
      </section>

      <fieldset className="ed-card image-picker">
        <legend className="ed-title">Ảnh sản phẩm</legend>
        <div className="photo-main">
          <div className="photo-preview">
            <img src={draft.image} alt="Ảnh sản phẩm đang chọn" />
            {photoBusy && <span className="photo-busy">Đang xử lý…</span>}
            {ownPhoto && !photoBusy && <span className="photo-tag">Ảnh của bạn</span>}
          </div>
          <div className="photo-actions">
            <button type="button" className="primary-btn" onClick={takePhoto} disabled={photoBusy}><Camera size={18} /> Chụp ảnh</button>
            <button type="button" className="secondary-btn" onClick={() => uploadInputRef.current?.click()} disabled={photoBusy}><ImagePlus size={18} /> Tải ảnh lên</button>
            <input ref={captureInputRef} type="file" accept="image/*" capture="environment" hidden onChange={event => handlePhotoFile(event.currentTarget)} />
            <input ref={uploadInputRef} type="file" accept="image/*" hidden onChange={event => handlePhotoFile(event.currentTarget)} />
          </div>
        </div>
        {photoError && <p className="field-error">{photoError}</p>}
        <span className="photo-pool-label">Hoặc dùng ảnh mẫu</span>
        <div className="image-options">
          {imagePool.map((url, index) => <label key={url} className={draft.image === url ? 'selected' : ''}>
            <input type="radio" name="edit-image" checked={draft.image === url} onChange={() => set('image', url)} aria-label={`Ảnh mẫu ${index + 1}`} />
            <img src={url} alt="" />
          </label>)}
        </div>
      </fieldset>
      {cameraOpen && <CameraCapture
        onCapture={dataUrl => { set('image', dataUrl); setCameraOpen(false) }}
        onClose={() => setCameraOpen(false)}
        onFallback={() => { setCameraOpen(false); uploadInputRef.current?.click() }}
      />}

      <section className="ed-card">
        <h3 className="ed-title">Cỡ & giá</h3>
        <p className="editor-hint">Mỗi cỡ là một cách bán: lẻ, theo lốc, theo thùng…</p>
        <ol className="unit-rows">
          {draft.units.map((unit, index) => {
            const rowError = errors.unitRows?.[index]
            return <li key={index} className={`unit-row${rowError ? ' invalid' : ''}${unit.available ? '' : ' off'}`}>
              <div className="unit-row-head">
                <span>Cỡ {index + 1}</span>
                <Switch checked={unit.available} onChange={available => setUnit(index, { available })} label={unit.available ? 'Còn hàng' : 'Hết hàng'} />
                {draft.units.length > 1 && <button className="icon-btn unit-remove" onClick={() => setUnits(units => units.filter((_, i) => i !== index))} aria-label={`Xoá cỡ ${index + 1}`}><Trash2 size={17} /></button>}
              </div>
              <div className="field">
                <label htmlFor={`unit-label-${index}`}>Tên cỡ</label>
                <input id={`unit-label-${index}`} value={unit.label} onChange={event => setUnit(index, { label: event.target.value })} placeholder="lốc 6 chai" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor={`unit-count-${index}`}>Gồm (món)</label>
                  <input id={`unit-count-${index}`} inputMode="numeric" value={unit.count} onChange={event => setUnit(index, { count: digits(event.target.value).slice(0, 3) })} />
                </div>
                <div className="field price-input">
                  <label htmlFor={`unit-price-${index}`}>Giá bán</label>
                  <div className="price-box">
                    <input id={`unit-price-${index}`} inputMode="numeric" value={groupThousands(unit.price)} onChange={event => setUnit(index, { price: digits(event.target.value).slice(0, 9) })} placeholder="0" />
                    <span aria-hidden="true">đ</span>
                  </div>
                </div>
              </div>
              {rowError && <p className="field-error unit-error">{rowError}</p>}
            </li>
          })}
        </ol>
        {!draft.units.some(unit => unit.available) && <p className="editor-hint sold-out-hint">Mọi cỡ đều hết hàng: khách vẫn thấy món này nhưng không đặt được.</p>}
        {draft.units.length < MAX_UNITS && <button className="add-unit" onClick={() => setUnits(units => [...units, { label: '', count: '', price: '', available: true }])}>
          <Plus size={18} /> Thêm cỡ
        </button>}
      </section>

      <section className="ed-card">
        <h3 className="ed-title">Bán hàng</h3>
        <div className={`field compact-field${errors.maxQty ? ' invalid' : ''}`}>
          <label htmlFor="edit-max">Tối đa mỗi đơn</label>
          <input id="edit-max" inputMode="numeric" value={draft.maxQty} onChange={event => set('maxQty', digits(event.target.value).slice(0, 2))} />
          {errors.maxQty && <p className="field-error">{errors.maxQty}</p>}
        </div>
        <div className="toggle-list">
          <Switch checked={draft.badge} onChange={value => set('badge', value)} label="Gắn nhãn “bán chạy”" />
          <Switch checked={!draft.hidden} onChange={value => set('hidden', !value)} label="Hiển thị trong cửa hàng" />
        </div>
      </section>
    </div>
  </Sheet>
}
