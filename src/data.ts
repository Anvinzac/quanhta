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
