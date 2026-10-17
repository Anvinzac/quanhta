import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { categoryTrail, categoryTree, type CategoryNode } from '../catalog'

type CategoryTreeProps = {
  selectedId?: string
  onSelect: (id: string | undefined) => void
  /** Products per category id; categories without any are left out. */
  counts: Map<string, number>
  total: number
}

export function CategoryTree({ selectedId, onSelect, counts, total }: CategoryTreeProps) {
  const has = (node: CategoryNode) => (counts.get(node.id) ?? 0) > 0
  const selectedCategory = categoryTrail(selectedId)[1]?.id
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(selectedCategory ? [selectedCategory] : []))

  useEffect(() => {
    if (selectedCategory) setExpanded(current => current.has(selectedCategory) ? current : new Set(current).add(selectedCategory))
  }, [selectedCategory])

  const toggle = (id: string) => setExpanded(current => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const item = (id: string | undefined, name: string, count: number, className: string) =>
    <button className={`${className}${selectedId === id ? ' active' : ''}`} onClick={() => onSelect(id)} aria-current={selectedId === id ? 'true' : undefined}>
      <span>{name}</span><small>{count}</small>
    </button>

  return <nav className="cat-tree" aria-label="Danh mục sản phẩm">
    {item(undefined, 'Tất cả sản phẩm', total, 'cat-all')}
    {categoryTree.filter(has).map(department => <section key={department.id}>
      {item(department.id, department.name, counts.get(department.id)!, 'cat-dept')}
      <ul>{department.children.filter(has).map(category => {
        const open = expanded.has(category.id)
        return <li key={category.id}>
          <div className="cat-row">
            {item(category.id, category.name, counts.get(category.id)!, 'cat-name')}
            <button className={`cat-toggle${open ? ' open' : ''}`} onClick={() => toggle(category.id)} aria-expanded={open} aria-label={`${open ? 'Thu gọn' : 'Mở'} ${category.name}`}>
              <ChevronDown size={18} />
            </button>
          </div>
          {open && <ul className="cat-subs">{category.children.filter(has).map(sub =>
            <li key={sub.id}>{item(sub.id, sub.name, counts.get(sub.id)!, 'cat-sub')}</li>)}
          </ul>}
        </li>
      })}</ul>
    </section>)}
  </nav>
}
