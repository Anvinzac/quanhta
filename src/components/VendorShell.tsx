import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ClipboardList, ExternalLink, LogOut, Package } from 'lucide-react'
import { Brand } from './Brand'
import { type Vendor } from '../data'
import { useVendorAuth } from '../vendorAuth'

type VendorShellProps = {
  vendor: Vendor
  ownerName: string
  productCount: number
  children: ReactNode
}

export function VendorShell({ vendor, ownerName, productCount, children }: VendorShellProps) {
  const { signOut } = useVendorAuth()
  const initial = ownerName.split(' ').pop()?.[0] ?? '?'

  return <div className="adm">
    <aside className="adm-side" aria-label="Quản lý cửa hàng">
      <Link to="/" className="adm-brand" aria-label="quanhTa — trang chủ"><Brand as="text" /><span className="adm-tag">Bán hàng</span></Link>

      <div className="adm-shop">
        <span className="adm-shop-mark" style={{ background: vendor.color }} aria-hidden="true">{vendor.emoji}</span>
        <div>
          <strong>{vendor.name}</strong>
          <small><i aria-hidden="true" /> Đang mở cửa</small>
        </div>
      </div>

      <nav className="adm-nav">
        <span className="adm-nav-label">Quản lý</span>
        <a className="active" aria-current="page"><Package size={18} /> Sản phẩm <b>{productCount}</b></a>
        <span className="adm-nav-soon" aria-disabled="true"><ClipboardList size={18} /> Đơn hàng <em>Sắp có</em></span>
        <span className="adm-nav-label">Cửa hàng</span>
        <Link to="/shops/$vendorId" params={{ vendorId: vendor.slug }}><ExternalLink size={18} /> Xem như khách</Link>
      </nav>

      <div className="adm-owner">
        <span className="adm-avatar" aria-hidden="true">{initial}</span>
        <div><strong>{ownerName}</strong><small>Chủ tiệm</small></div>
        <button onClick={signOut} aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={18} /></button>
      </div>
    </aside>

    <header className="adm-top">
      <span className="adm-shop-mark" style={{ background: vendor.color }} aria-hidden="true">{vendor.emoji}</span>
      <div className="adm-top-title">
        <strong>{vendor.name}</strong>
        <small><i aria-hidden="true" /> Đang mở cửa · {ownerName}</small>
      </div>
      <Link to="/shops/$vendorId" params={{ vendorId: vendor.slug }} className="adm-top-btn" aria-label="Xem cửa hàng như khách"><ExternalLink size={19} /></Link>
      <button className="adm-top-btn" onClick={signOut} aria-label="Đăng xuất"><LogOut size={19} /></button>
    </header>

    <main className="adm-main">{children}</main>
  </div>
}
