import { Link } from '@tanstack/react-router'
import { NeighbourhoodSwitcher } from './NeighbourhoodSwitcher'

export function Brand({ as = 'link' }: { as?: 'link' | 'text' }) {
  const content = <>quanh<em>Ta</em></>
  return as === 'link'
    ? <Link to="/" className="brand" aria-label="quanhTa — trang chủ">{content}</Link>
    : <span className="brand">{content}</span>
}

export function BrandWithNeighbourhood({ onSwitch }: { onSwitch?: (id: string) => void }) {
  return <div className="brand-block">
    <Brand />
    <NeighbourhoodSwitcher onSwitch={onSwitch} />
  </div>
}
