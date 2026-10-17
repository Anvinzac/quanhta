/**
 * Where neighbourhood shops commonly restock. Kept apart from brands: a brand says what the product is,
 * a supplier says who this shop buys it from, and the two come from different sources.
 */
export const commonSuppliers = [
  'Tự làm tại tiệm',
  'Chợ đầu mối Bình Điền',
  'Chợ đầu mối Hóc Môn',
  'Chợ đầu mối Thủ Đức',
  'Chợ đầu mối Long Biên',
  'MM Mega Market',
  'Đại lý Vinamilk',
  'Nhà phân phối Unilever',
  'Nhà phân phối Masan',
  'Nhà phân phối Acecook',
  'Nhà phân phối Coca-Cola',
  'Nhà phân phối Suntory PepsiCo',
  'Nhà phân phối P&G',
  'Đại lý bia Sabeco',
  'Đại lý bia Heineken',
  'Vựa rau Đà Lạt',
]

/** The shop's own suppliers first (most used first), then common ones it hasn't used yet. */
export function supplierOptions(used: (string | undefined)[]): string[] {
  const counts = new Map<string, number>()
  for (const supplier of used) if (supplier) counts.set(supplier, (counts.get(supplier) ?? 0) + 1)
  const own = [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)! || a.localeCompare(b, 'vi'))
  return [...own, ...commonSuppliers.filter(supplier => !counts.has(supplier))]
}
