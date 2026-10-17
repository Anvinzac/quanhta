export type Unit = { label: string, count: number, price: number }

export type Product = {
  id: number
  name: string
  category: string
  units: Unit[]
  image: string
  tone: string
  note: string
  badge?: string
}

export type Neighbourhood = {
  id: string
  name: string
  address: string
  shortAddress: string
  city: string
  members: number
}

export type Vendor = {
  slug: string
  name: string
  kind: string
  code: string
  color: string
  emoji: string
  line: string
  distanceM: number
  neighbourhoodId: string
  score: number
}

export const formatDistance = (metres: number) => `${metres}\u00a0m`
export const RADIUS = formatDistance(500)

const imagePool = [
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85',
]

// Prices are in thousands of VND (12 = 12.000đ).
const catalogGroups = [
  { category: 'Đồ uống', unit: 'chai', pack: ['lốc', 6], box: ['thùng', 24], start: 10, step: 2, items: ['Trà tắc', 'Cà phê sữa đá', 'Nước mía', 'Nước dừa xiêm', 'Trà đào cam sả', 'Nước suối', 'Sữa đậu nành', 'Nước sâm', 'Trà xanh không độ', 'Nước cam ép', 'Cà phê muối', 'Bạc xỉu'] },
  { category: 'Ăn vặt', unit: 'gói', pack: ['bịch', 3], box: ['thùng', 12], start: 8, step: 2, items: ['Bánh tráng trộn', 'Snack tôm cay', 'Đậu phộng rang', 'Hạt điều rang muối', 'Khô gà lá chanh', 'Bánh quy bơ', 'Kẹo dừa Bến Tre', 'Bánh phồng tôm', 'Me lắc', 'Rong biển sấy', 'Mít sấy', 'Chuối sấy'] },
  { category: 'Tạp hoá', unit: 'gói', pack: ['bộ', 3], box: ['thùng', 12], start: 6, step: 3, items: ['Mì gói', 'Phở ăn liền', 'Bún khô', 'Miến dong', 'Hủ tiếu khô', 'Bánh đa cua', 'Cháo ăn liền', 'Hạt nêm', 'Bột chiên giòn', 'Đường phèn', 'Muối tôm', 'Gạo ST25'] },
  { category: 'Sữa & trứng', unit: 'hộp', pack: ['lốc', 4], box: ['thùng', 12], start: 9, step: 3, items: ['Sữa tươi không đường', 'Sữa tươi có đường', 'Sữa chua', 'Sữa chua nếp cẩm', 'Phô mai lát', 'Bơ lạt', 'Trứng gà ta', 'Trứng vịt muối', 'Sữa đặc', 'Sữa hạt sen', 'Kem dừa', 'Sữa yến mạch'] },
  { category: 'Bữa sáng', unit: 'cái', pack: ['hộp', 3], box: ['hộp', 10], start: 8, step: 2, items: ['Bánh mì que', 'Bánh bao', 'Xôi gấc', 'Bánh giò', 'Bánh sừng bò', 'Bánh bông lan', 'Bánh chuối nướng', 'Bánh da lợn', 'Bánh tiêu', 'Bánh cam', 'Ngũ cốc', 'Bánh mì sandwich'] },
  { category: 'Rau củ quả', unit: 'túi', pack: ['combo', 3], box: ['thùng', 9], start: 12, step: 3, items: ['Chuối già', 'Xoài cát Hoà Lộc', 'Cam sành', 'Bơ sáp', 'Cà chua bi', 'Rau muống', 'Dưa leo', 'Cà rốt', 'Tỏi Lý Sơn', 'Chanh không hạt', 'Thanh long', 'Rau thơm'] },
  { category: 'Gia dụng', unit: 'món', pack: ['combo', 2], box: ['thùng', 6], start: 20, step: 5, items: ['Nước rửa chén', 'Nước giặt', 'Khăn giấy bếp', 'Giấy vệ sinh', 'Túi rác', 'Miếng rửa chén', 'Nước lau sàn', 'Nước rửa tay', 'Pin AA', 'Bóng đèn LED', 'Màng bọc thực phẩm', 'Túi zip'] },
  { category: 'Chăm sóc cá nhân', unit: 'món', pack: ['combo', 2], box: ['thùng', 6], start: 25, step: 5, items: ['Dầu gội', 'Dầu xả', 'Sữa tắm', 'Kem đánh răng', 'Bàn chải đánh răng', 'Lăn khử mùi', 'Khăn giấy rút', 'Bông tẩy trang', 'Kem chống nắng', 'Son dưỡng', 'Nước rửa tay khô', 'Băng cá nhân'] },
  { category: 'Thú cưng', unit: 'gói', pack: ['bịch', 3], box: ['thùng', 12], start: 18, step: 4, items: ['Thức ăn cho chó', 'Thức ăn cho mèo', 'Bánh thưởng cho chó', 'Pate cho mèo', 'Cát vệ sinh', 'Sữa tắm thú cưng', 'Đồ chơi gặm', 'Cần câu mèo', 'Bát ăn', 'Túi nhặt phân', 'Tấm lót vệ sinh', 'Khăn ướt thú cưng'] },
  { category: 'Mẹ & bé', unit: 'gói', pack: ['bịch', 3], box: ['thùng', 10], start: 22, step: 5, items: ['Khăn ướt em bé', 'Tã dán', 'Dầu gội em bé', 'Kem dưỡng da em bé', 'Cháo ăn dặm vị táo', 'Cháo ăn dặm rau củ', 'Bánh ăn dặm', 'Sữa công thức', 'Kem chống hăm', 'Sữa tắm em bé', 'Tăm bông', 'Yếm ăn'] },
] as const

export const categories: string[] = catalogGroups.map(group => group.category)

const roundThousand = (value: number) => Math.round(value) * 1000

export const products: Product[] = catalogGroups.flatMap((group, groupIndex) => group.items.map((name, itemIndex) => {
  const price = group.start + itemIndex * group.step
  const id = groupIndex * 12 + itemIndex + 1
  const [packWord, packCount] = group.pack
  const [boxWord, boxCount] = group.box
  return {
    id,
    name,
    category: group.category,
    units: [
      { label: `1 ${group.unit}`, count: 1, price: roundThousand(price) },
      { label: `${packWord} ${packCount} ${group.unit}`, count: packCount, price: roundThousand(price * packCount * .92) },
      { label: `${boxWord} ${boxCount} ${group.unit}`, count: boxCount, price: roundThousand(price * boxCount * .82) },
    ],
    tone: ['peach', 'butter', 'lilac', 'sky', 'leaf', 'rose'][id % 6],
    image: imagePool[id % imagePool.length],
    note: `${name} từ quầy ${group.category.toLowerCase()}. Mua lẻ, mua theo ${packWord} hoặc cả ${boxWord} cho tiết kiệm.`,
    badge: itemIndex === 0 ? 'bán chạy' : undefined,
  }
}))

export const productById = new Map(products.map(product => [product.id, product]))

export const neighbourhoods: Neighbourhood[] = [
  { id: 'ben-thanh', name: 'Bến Thành', address: '86 Lê Lợi, P. Bến Thành, Quận 1', shortAddress: '86 Lê Lợi, Q.1', city: 'TP.HCM', members: 342 },
  { id: 'thao-dien', name: 'Thảo Điền', address: '21 Quốc Hương, P. Thảo Điền, TP. Thủ Đức', shortAddress: '21 Quốc Hương, Thủ Đức', city: 'TP.HCM', members: 518 },
  { id: 'phan-xich-long', name: 'Phan Xích Long', address: '120 Phan Xích Long, P.2, Phú Nhuận', shortAddress: '120 Phan Xích Long, Phú Nhuận', city: 'TP.HCM', members: 276 },
  { id: 'ho-guom', name: 'Hồ Gươm', address: '2 Hàng Khay, P. Tràng Tiền, Hoàn Kiếm', shortAddress: '2 Hàng Khay, Hoàn Kiếm', city: 'Hà Nội', members: 455 },
  { id: 'quang-an', name: 'Quảng An', address: '35 Quảng An, Tây Hồ', shortAddress: '35 Quảng An, Tây Hồ', city: 'Hà Nội', members: 189 },
]

export const neighbourhoodById = (id: string) => neighbourhoods.find(neighbourhood => neighbourhood.id === id)

export const vendors: Vendor[] = [
  { slug: 'tiem-banh-nha-may', name: 'Tiệm Bánh Nhà Mây', kind: 'Bánh mì · bánh ngọt · cà phê', code: 'NHAMAY', color: '#e88d77', emoji: '✳', line: 'Bánh nướng mỗi sáng, thơm cả con hẻm.', distanceM: 120, neighbourhoodId: 'ben-thanh', score: 94 },
  { slug: 'cho-nho-co-ba', name: 'Chợ Nhỏ Cô Ba', kind: 'Tạp hoá · rau củ · đồ khô', code: 'COBA', color: '#e7b94f', emoji: '✦', line: 'Đủ thứ cần cho bữa cơm nhà.', distanceM: 260, neighbourhoodId: 'ben-thanh', score: 98 },
  { slug: 'goc-xanh', name: 'Góc Xanh', kind: 'Cây cảnh · hoa · đồ làm vườn', code: 'GOCXANH', color: '#86a889', emoji: '●', line: 'Mảng xanh nhỏ cho căn hộ của bạn.', distanceM: 410, neighbourhoodId: 'ben-thanh', score: 89 },
  { slug: 'bep-me-hien', name: 'Bếp Mẹ Hiền', kind: 'Cơm nhà · món kho · đồ ăn sẵn', code: 'MEHIEN', color: '#e0a06a', emoji: '◆', line: 'Món ăn nhà nấu, giao trong khu.', distanceM: 90, neighbourhoodId: 'thao-dien', score: 97 },
  { slug: 'kho-nha-minh', name: 'Kho Nhà Mình', kind: 'Đồ khô · gia vị · hữu cơ', code: 'KHONHA', color: '#b990a0', emoji: '✿', line: 'Gạo ngon, nước mắm chuẩn, gia vị sạch.', distanceM: 330, neighbourhoodId: 'thao-dien', score: 91 },
  { slug: 'ca-phe-hem-120', name: 'Cà Phê Hẻm 120', kind: 'Cà phê rang xay · bánh ngọt', code: 'HEM120', color: '#a07c62', emoji: '✺', line: 'Rang mỗi tuần, pha bằng cả tấm lòng.', distanceM: 60, neighbourhoodId: 'phan-xich-long', score: 93 },
  { slug: 'tiem-hoa-nho', name: 'Tiệm Hoa Nhỏ', kind: 'Hoa tươi · quà tặng', code: 'HOANHO', color: '#e58ba0', emoji: '❀', line: 'Bó hoa nhỏ cho những ngày bình thường.', distanceM: 380, neighbourhoodId: 'phan-xich-long', score: 88 },
  { slug: 'hang-banh-pho-co', name: 'Hàng Bánh Phố Cổ', kind: 'Bánh cốm · ô mai · đặc sản', code: 'PHOCO', color: '#c9a64a', emoji: '✦', line: 'Hương vị Hà Nội gói trong từng hộp.', distanceM: 210, neighbourhoodId: 'ho-guom', score: 96 },
  { slug: 'rau-sach-ba-lan', name: 'Rau Sạch Bà Lan', kind: 'Rau củ · trái cây · trứng', code: 'BALAN', color: '#7ba17d', emoji: '●', line: 'Rau từ vườn ngoại thành, về phố mỗi sáng.', distanceM: 450, neighbourhoodId: 'ho-guom', score: 90 },
  { slug: 'quang-an-deli', name: 'Quảng An Deli', kind: 'Đồ nguội · phô mai · rượu vang', code: 'QADELI', color: '#d98a6c', emoji: '✳', line: 'Góc châu Âu nhỏ bên hồ Tây.', distanceM: 150, neighbourhoodId: 'quang-an', score: 92 },
  { slug: 'vuon-sen-tay-ho', name: 'Vườn Sen Tây Hồ', kind: 'Trà sen · hoa sen · quà', code: 'VUONSEN', color: '#e3a5b5', emoji: '❀', line: 'Trà ướp sen theo cách người Hà Nội xưa.', distanceM: 300, neighbourhoodId: 'quang-an', score: 95 },
]

export const vendorBySlug = (slug: string) => vendors.find(vendor => vendor.slug === slug)

export const vendorByCode = (code: string) => {
  const normalised = code.trim().toUpperCase()
  return vendors.find(vendor => vendor.code === normalised)
}

export const vendorsIn = (neighbourhoodId: string) =>
  vendors.filter(vendor => vendor.neighbourhoodId === neighbourhoodId).sort((a, b) => b.score - a.score)

const vnd = new Intl.NumberFormat('vi-VN')
export const formatPrice = (amount: number) => `${vnd.format(amount)}đ`
