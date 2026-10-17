export type Unit = { label: string, count: number, price: number }

export type Product = {
  id: number
  name: string
  /** Category ids from the department down to the subcategory. */
  path: [string, string, string]
  units: Unit[]
  image: string
  tone: string
  note: string
  badge?: string
  /** Most of this product one order may hold, across all sizes. */
  maxQty?: number
}

export const DEFAULT_MAX_QTY = 10
export const maxQtyOf = (product: Product) => product.maxQty ?? DEFAULT_MAX_QTY

export type CategoryNode = {
  id: string
  name: string
  depth: 1 | 2 | 3
  parentId: string | null
  children: CategoryNode[]
  productCount: number
}

type Pack = readonly [word: string, count: number]
type RawSubcategory = { id: string, name: string, items: readonly string[] }
// Prices are in thousands of VND (12 = 12.000đ); every product in a category shares its units.
type RawCategory = { id: string, name: string, unit: string, pack: Pack, box: Pack, start: number, step: number, subs: readonly RawSubcategory[] }
type RawDepartment = { id: string, name: string, categories: readonly RawCategory[] }

const catalog: readonly RawDepartment[] = [
  {
    id: 'thuc-pham', name: 'Thực phẩm', categories: [
      {
        id: 'do-uong', name: 'Đồ uống', unit: 'chai', pack: ['lốc', 6], box: ['thùng', 24], start: 10, step: 2, subs: [
          { id: 'ca-phe-tra', name: 'Cà phê & trà', items: ['Cà phê sữa đá', 'Cà phê muối', 'Bạc xỉu', 'Trà tắc', 'Trà đào cam sả', 'Trà xanh không độ'] },
          { id: 'nuoc-giai-khat', name: 'Nước giải khát', items: ['Nước suối', 'Nước mía', 'Nước dừa xiêm', 'Sữa đậu nành', 'Nước sâm', 'Nước cam ép'] },
        ],
      },
      {
        id: 'an-vat', name: 'Ăn vặt', unit: 'gói', pack: ['bịch', 3], box: ['thùng', 12], start: 8, step: 2, subs: [
          { id: 'banh-keo', name: 'Bánh kẹo', items: ['Bánh tráng trộn', 'Snack tôm cay', 'Bánh quy bơ', 'Kẹo dừa Bến Tre', 'Bánh phồng tôm', 'Me lắc'] },
          { id: 'hat-do-say', name: 'Hạt & đồ sấy', items: ['Đậu phộng rang', 'Hạt điều rang muối', 'Khô gà lá chanh', 'Rong biển sấy', 'Mít sấy', 'Chuối sấy'] },
        ],
      },
      {
        id: 'tap-hoa', name: 'Tạp hoá', unit: 'gói', pack: ['bộ', 3], box: ['thùng', 12], start: 6, step: 3, subs: [
          { id: 'mi-bun-kho', name: 'Mì & bún khô', items: ['Mì gói', 'Phở ăn liền', 'Bún khô', 'Miến dong', 'Hủ tiếu khô', 'Bánh đa cua', 'Cháo ăn liền'] },
          { id: 'gia-vi-gao', name: 'Gia vị & gạo', items: ['Hạt nêm', 'Bột chiên giòn', 'Đường phèn', 'Muối tôm', 'Gạo ST25'] },
        ],
      },
      {
        id: 'sua-trung', name: 'Sữa & trứng', unit: 'hộp', pack: ['lốc', 4], box: ['thùng', 12], start: 9, step: 3, subs: [
          { id: 'sua', name: 'Sữa', items: ['Sữa tươi không đường', 'Sữa tươi có đường', 'Sữa đặc', 'Sữa hạt sen', 'Sữa yến mạch'] },
          { id: 'sua-chua-bo', name: 'Sữa chua & bơ', items: ['Sữa chua', 'Sữa chua nếp cẩm', 'Phô mai lát', 'Bơ lạt', 'Kem dừa'] },
          { id: 'trung', name: 'Trứng', items: ['Trứng gà ta', 'Trứng vịt muối'] },
        ],
      },
      {
        id: 'bua-sang', name: 'Bữa sáng', unit: 'cái', pack: ['hộp', 3], box: ['hộp', 10], start: 8, step: 2, subs: [
          { id: 'banh-mi-banh-ngot', name: 'Bánh mì & bánh ngọt', items: ['Bánh mì que', 'Bánh sừng bò', 'Bánh bông lan', 'Bánh chuối nướng', 'Bánh mì sandwich', 'Ngũ cốc'] },
          { id: 'mon-truyen-thong', name: 'Món truyền thống', items: ['Bánh bao', 'Xôi gấc', 'Bánh giò', 'Bánh da lợn', 'Bánh tiêu', 'Bánh cam'] },
        ],
      },
      {
        id: 'rau-cu-qua', name: 'Rau củ quả', unit: 'túi', pack: ['combo', 3], box: ['thùng', 9], start: 12, step: 3, subs: [
          { id: 'trai-cay', name: 'Trái cây', items: ['Chuối già', 'Xoài cát Hoà Lộc', 'Cam sành', 'Bơ sáp', 'Thanh long', 'Chanh không hạt'] },
          { id: 'rau-cu', name: 'Rau củ', items: ['Cà chua bi', 'Rau muống', 'Dưa leo', 'Cà rốt', 'Tỏi Lý Sơn', 'Rau thơm'] },
        ],
      },
    ],
  },
  {
    id: 'nha-cua-ca-nhan', name: 'Nhà cửa & cá nhân', categories: [
      {
        id: 'gia-dung', name: 'Gia dụng', unit: 'món', pack: ['combo', 2], box: ['thùng', 6], start: 20, step: 5, subs: [
          { id: 'giat-rua', name: 'Giặt rửa & lau chùi', items: ['Nước rửa chén', 'Nước giặt', 'Miếng rửa chén', 'Nước lau sàn', 'Nước rửa tay'] },
          { id: 'giay-tui', name: 'Giấy & túi', items: ['Khăn giấy bếp', 'Giấy vệ sinh', 'Túi rác', 'Màng bọc thực phẩm', 'Túi zip'] },
          { id: 'dien', name: 'Pin & bóng đèn', items: ['Pin AA', 'Bóng đèn LED'] },
        ],
      },
      {
        id: 'cham-soc-ca-nhan', name: 'Chăm sóc cá nhân', unit: 'món', pack: ['combo', 2], box: ['thùng', 6], start: 25, step: 5, subs: [
          { id: 'toc-co-the', name: 'Tóc & cơ thể', items: ['Dầu gội', 'Dầu xả', 'Sữa tắm', 'Lăn khử mùi', 'Kem chống nắng', 'Son dưỡng'] },
          { id: 'rang-mieng', name: 'Răng miệng', items: ['Kem đánh răng', 'Bàn chải đánh răng'] },
          { id: 've-sinh-y-te', name: 'Vệ sinh & y tế', items: ['Khăn giấy rút', 'Bông tẩy trang', 'Nước rửa tay khô', 'Băng cá nhân'] },
        ],
      },
    ],
  },
  {
    id: 'me-be-thu-cung', name: 'Mẹ, bé & thú cưng', categories: [
      {
        id: 'me-be', name: 'Mẹ & bé', unit: 'gói', pack: ['bịch', 3], box: ['thùng', 10], start: 22, step: 5, subs: [
          { id: 'an-dam-sua', name: 'Ăn dặm & sữa', items: ['Cháo ăn dặm vị táo', 'Cháo ăn dặm rau củ', 'Bánh ăn dặm', 'Sữa công thức', 'Yếm ăn'] },
          { id: 'ta-ve-sinh', name: 'Tã & vệ sinh', items: ['Khăn ướt em bé', 'Tã dán', 'Tăm bông', 'Kem chống hăm'] },
          { id: 'tam-goi-be', name: 'Tắm gội', items: ['Dầu gội em bé', 'Kem dưỡng da em bé', 'Sữa tắm em bé'] },
        ],
      },
      {
        id: 'thu-cung', name: 'Thú cưng', unit: 'gói', pack: ['bịch', 3], box: ['thùng', 12], start: 18, step: 4, subs: [
          { id: 'thuc-an-thu-cung', name: 'Thức ăn', items: ['Thức ăn cho chó', 'Thức ăn cho mèo', 'Bánh thưởng cho chó', 'Pate cho mèo'] },
          { id: 've-sinh-thu-cung', name: 'Vệ sinh', items: ['Cát vệ sinh', 'Sữa tắm thú cưng', 'Túi nhặt phân', 'Tấm lót vệ sinh', 'Khăn ướt thú cưng'] },
          { id: 'do-choi-phu-kien', name: 'Đồ chơi & phụ kiện', items: ['Đồ chơi gặm', 'Cần câu mèo', 'Bát ăn'] },
        ],
      },
    ],
  },
]

const imagePool = [
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85',
]

const roundThousand = (value: number) => Math.round(value) * 1000

function buildProducts(): Product[] {
  const built: Product[] = []
  for (const department of catalog) {
    for (const category of department.categories) {
      const [packWord, packCount] = category.pack
      const [boxWord, boxCount] = category.box
      let indexInCategory = 0
      for (const sub of category.subs) {
        for (const name of sub.items) {
          const id = built.length + 1
          const price = category.start + indexInCategory * category.step
          built.push({
            id,
            name,
            path: [department.id, category.id, sub.id],
            units: [
              { label: `1 ${category.unit}`, count: 1, price: roundThousand(price) },
              { label: `${packWord} ${packCount} ${category.unit}`, count: packCount, price: roundThousand(price * packCount * .92) },
              { label: `${boxWord} ${boxCount} ${category.unit}`, count: boxCount, price: roundThousand(price * boxCount * .82) },
            ],
            tone: ['peach', 'butter', 'lilac', 'sky', 'leaf', 'rose'][id % 6],
            image: imagePool[id % imagePool.length],
            note: `${name} thuộc nhóm ${sub.name.toLowerCase()}. Mua lẻ, mua theo ${packWord} hoặc cả ${boxWord} cho tiết kiệm.`,
            badge: indexInCategory === 0 ? 'bán chạy' : undefined,
            maxQty: indexInCategory === 0 ? 5 : undefined,
          })
          indexInCategory += 1
        }
      }
    }
  }
  return built
}

export const products: Product[] = buildProducts()
export const productById = new Map(products.map(product => [product.id, product]))

const countUnder = (id: string) => products.filter(product => product.path.includes(id)).length

export const categoryTree: CategoryNode[] = catalog.map(department => {
  const departmentNode: CategoryNode = { id: department.id, name: department.name, depth: 1, parentId: null, children: [], productCount: countUnder(department.id) }
  departmentNode.children = department.categories.map(category => {
    const categoryNode: CategoryNode = { id: category.id, name: category.name, depth: 2, parentId: department.id, children: [], productCount: countUnder(category.id) }
    categoryNode.children = category.subs.map(sub => ({ id: sub.id, name: sub.name, depth: 3, parentId: category.id, children: [], productCount: countUnder(sub.id) }))
    return categoryNode
  })
  return departmentNode
})

export const categoryById = new Map<string, CategoryNode>()
const index = (nodes: CategoryNode[]) => nodes.forEach(node => { categoryById.set(node.id, node); index(node.children) })
index(categoryTree)

/** Root-to-node chain for a category id; empty for "all products". */
export function categoryTrail(id: string | undefined): CategoryNode[] {
  const trail: CategoryNode[] = []
  let node = id ? categoryById.get(id) : undefined
  while (node) {
    trail.unshift(node)
    node = node.parentId ? categoryById.get(node.parentId) : undefined
  }
  return trail
}

export const PAGE_SIZE = 20
