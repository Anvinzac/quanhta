import { useMemo, useState, type CSSProperties, type Dispatch, type SetStateAction } from 'react'
import { createRootRoute, createRoute, createRouter, Link, Outlet, RouterProvider, useParams } from '@tanstack/react-router'
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, Clock3, Heart, MapPin, Menu, MessageCircle,
  Minus, Package, Plus, Search, ShoppingBag, Sparkles, Store, X,
} from 'lucide-react'
import './styles.css'

type Product = {
  id: number
  name: string
  category: string
  units: { label: string, price: number }[]
  image: string
  tone: string
  note: string
  badge?: string
}

const imagePool = [
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85',
]

const catalogGroups = [
  { category: 'Drinks', unit: 'can', pack: 6, box: 24, start: 2, step: 1, items: ['Sparkling Water Lime', 'Cola Classic', 'Orange Soda', 'Iced Tea Peach', 'Still Water', 'Energy Drink', 'Ginger Ale', 'Lemonade', 'Coconut Water', 'Apple Juice', 'Cold Brew Coffee', 'Oat Latte'] },
  { category: 'Snacks', unit: 'bag', pack: 3, box: 12, start: 3, step: 1, items: ['Sea Salt Chips', 'Chili Lime Chips', 'Pretzel Twists', 'Popcorn', 'Trail Mix', 'Roasted Almonds', 'Cheese Crackers', 'Chocolate Wafer', 'Peanut Butter Bites', 'Rice Crackers', 'Fruit Gummies', 'Corn Nuts'] },
  { category: 'Pantry', unit: 'jar', pack: 3, box: 12, start: 4, step: 1, items: ['Instant Noodles', 'Tomato Soup', 'Baked Beans', 'Pasta Sauce', 'Olive Oil', 'Peanut Butter', 'Strawberry Jam', 'Wildflower Honey', 'Granola', 'Oatmeal', 'Jasmine Rice', 'Coconut Milk'] },
  { category: 'Dairy', unit: 'carton', pack: 2, box: 8, start: 4, step: 1, items: ['Whole Milk', 'Oat Milk', 'Greek Yogurt', 'Vanilla Yogurt', 'Cheddar Slices', 'Mozzarella', 'Salted Butter', 'Free Range Eggs', 'Cream Cheese', 'Kefir', 'Vanilla Ice Cream', 'Salted Caramel Ice Cream'] },
  { category: 'Breakfast', unit: 'pack', pack: 3, box: 10, start: 3, step: 1, items: ['Croissant', 'Pain au Chocolat', 'Bagel', 'English Muffin', 'Banana Bread', 'Blueberry Muffin', 'Cereal Flakes', 'Cocoa Cereal', 'Waffle Mix', 'Pancake Mix', 'Maple Syrup', 'Breakfast Bar'] },
  { category: 'Fresh', unit: 'bag', pack: 3, box: 9, start: 3, step: 1, items: ['Bananas', 'Pink Lady Apples', 'Navel Oranges', 'Avocados', 'Cherry Tomatoes', 'Baby Spinach', 'Cucumber', 'Carrots', 'Garlic', 'Lemons', 'Strawberries', 'Mixed Salad'] },
  { category: 'Home', unit: 'bottle', pack: 2, box: 6, start: 5, step: 1, items: ['Dish Soap', 'Laundry Liquid', 'Paper Towels', 'Toilet Paper', 'Bin Liners', 'Sponges', 'All Purpose Spray', 'Hand Soap', 'AA Batteries', 'Light Bulb', 'Aluminum Foil', 'Zip Bags'] },
  { category: 'Personal care', unit: 'bottle', pack: 2, box: 6, start: 4, step: 1, items: ['Shampoo', 'Conditioner', 'Body Wash', 'Toothpaste', 'Toothbrush', 'Deodorant', 'Facial Tissues', 'Cotton Pads', 'Sunscreen', 'Lip Balm', 'Hand Sanitizer', 'Bandages'] },
  { category: 'Pet', unit: 'pouch', pack: 3, box: 12, start: 4, step: 1, items: ['Dog Food', 'Cat Food', 'Dog Treats', 'Cat Treats', 'Litter', 'Pet Shampoo', 'Chew Toy', 'Feather Wand', 'Food Bowl', 'Waste Bags', 'Training Pads', 'Pet Wipes'] },
  { category: 'Baby', unit: 'pack', pack: 3, box: 10, start: 4, step: 1, items: ['Baby Wipes', 'Diapers', 'Baby Shampoo', 'Baby Lotion', 'Apple Baby Food', 'Vegetable Baby Food', 'Teething Biscuits', 'Formula', 'Nappy Cream', 'Baby Wash', 'Cotton Swabs', 'Bibs'] },
] as const

const products: Product[] = catalogGroups.flatMap((group, groupIndex) => group.items.map((name, itemIndex) => {
  const price = group.start + itemIndex * group.step
  const id = groupIndex * 12 + itemIndex + 1
  return {
    id,
    name,
    category: group.category,
    units: [
      { label: `1 ${group.unit}`, price },
      { label: `pack of ${group.pack}`, price: price * group.pack - Math.max(1, Math.floor(price * .4)) },
      { label: `box of ${group.box}`, price: price * group.box - Math.max(3, Math.floor(price * group.box * .18)) },
    ],
    tone: ['peach', 'butter', 'lilac', 'sky', 'leaf', 'rose'][id % 6],
    image: imagePool[id % imagePool.length],
    note: `${name} from the ${group.category.toLowerCase()} aisle. Pick a single, value pack, or pantry box.`,
    badge: itemIndex === 0 ? 'popular' : undefined,
  }
}))

const vendors = [
  { slug: 'little-day', name: 'Little Day', kind: 'Flowers · baking · objects', code: 'LTL-DAY', color: '#e88d77', emoji: '✳', line: 'Small, cheerful things for everyday life.', distance: '0.4 km away' },
  { slug: 'le-petit-marche', name: 'Le Petit Marché', kind: 'French pantry · prepared food', code: 'PETIT25', color: '#f3c86d', emoji: '✦', line: 'A tiny French market for slow afternoons.', distance: '0.8 km away' },
  { slug: 'the-green-table', name: 'The Green Table', kind: 'Plants · garden supplies', code: 'GREEN-T', color: '#86a889', emoji: '●', line: 'Garden-grown essentials and small green joys.', distance: '1.2 km away' },
]

function App() {
  const [code, setCode] = useState('')

  return <main>
    <section className="hero-shell" id="home">
      <nav className="nav wrap">
        <Link to="/" className="brand"><span>n</span>eighbourhood</Link>
        <div className="nav-center"><a href="#shops">Explore shops</a><a href="#how">How it works</a><a href="#sell">Sell here</a></div>
        <div className="nav-actions"><button className="search-btn" aria-label="Search"><Search size={19}/></button><Link className="cart-nav" to="/shops/$vendorId" params={{ vendorId: 'little-day' }}><Store size={18}/><span>Enter a shop</span></Link><button className="menu-btn"><Menu size={20}/></button></div>
      </nav>
      <div className="hero wrap">
        <div className="eyebrow"><span></span> Made for the people nearby</div>
        <h1>Things worth<br/><em>walking for.</em></h1>
        <p className="hero-copy">Meet the brilliant bakers, makers, growers and cooks in your neighbourhood. No warehouses. No middlemen. Just really good things, nearby.</p>
        <div className="hero-actions"><a href="#shops" className="primary-btn">Find something lovely <ArrowRight size={18}/></a><button className="text-btn" onClick={() => document.getElementById('code')?.focus()}>I have a store code <ArrowRight size={17}/></button></div>
        <div className="hero-foot"><div className="avatars"><i>J</i><i>M</i><i>A</i><i>R</i></div><p><strong>150+ neighbours</strong> already shopping local</p></div>
        <div className="hero-art" aria-hidden="true"><div className="blob blob-one"></div><div className="blob blob-two"></div><div className="hero-card"><span>Today at</span><strong>Little<br/>Day</strong><small>0.4 km away</small></div><div className="flower f1">✳</div><div className="flower f2">✦</div><div className="flower f3">●</div><div className="scribble">made around<br/>the corner</div></div>
      </div>
    </section>

    <section className="code-strip"><div className="wrap code-row"><div><span className="mini-label">Already know where you’re going?</span><h2>Enter your shop code</h2></div><div className="code-entry"><input id="code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. LTL-DAY"/><Link to="/shops/$vendorId" params={{ vendorId: vendors.find(v => v.code === code)?.slug || 'little-day' }}>Visit shop <ArrowRight size={17}/></Link></div></div></section>

    <section className="shops wrap" id="shops">
      <div className="section-title"><div><span className="mini-label">FRESH AROUND YOU</span><h2>A few good neighbours</h2></div><Link to="/shops/$vendorId" params={{ vendorId: 'little-day' }}>See all shops <ArrowRight size={17}/></Link></div>
      <div className="vendor-grid">{vendors.map((v, i) => <Link className="vendor-card" key={v.name} to="/shops/$vendorId" params={{ vendorId: v.slug }}><div className="vendor-icon" style={{ background: v.color }}>{v.emoji}</div><div className="vendor-info"><span>{v.kind}</span><h3>{v.name}</h3><small>Code {v.code}</small></div><ArrowRight className="vendor-arrow" size={19}/><div className={`vendor-orb orb-${i}`}></div></Link>)}</div>
    </section>

    <section className="leaderboard" id="leaderboard"><div className="wrap"><div className="board-heading"><div><span className="mini-label">THE NEIGHBOURHOOD BOARD</span><h2>Who’s making<br/><em>the good stuff.</em></h2></div><p>Shops rise here because neighbours return, save and share them — never because they pay for placement.</p></div><div className="board-layout"><Link className="leader-feature" to="/shops/$vendorId" params={{ vendorId: 'le-petit-marche' }}><span className="leader-rank">01</span><div className="leader-symbol">✦</div><div><span className="mini-label">THIS WEEK’S FAVOURITE</span><h3>Le Petit<br/>Marché</h3><p>French pantry · prepared food</p></div><div className="leader-score"><strong>98</strong><span>neighbour<br/>score</span></div><ArrowRight size={23}/></Link><div className="board-list"><Link to="/shops/$vendorId" params={{ vendorId: 'little-day' }}><b>02</b><span className="board-dot coral">✳</span><div><strong>Little Day</strong><small>Flowers · baking · objects</small></div><em>94</em><ArrowRight size={18}/></Link><Link to="/shops/$vendorId" params={{ vendorId: 'the-green-table' }}><b>03</b><span className="board-dot green">●</span><div><strong>The Green Table</strong><small>Plants · garden supplies</small></div><em>89</em><ArrowRight size={18}/></Link><div className="board-coming"><Sparkles size={17}/><span>New shops appear here as your neighbourhood grows.</span></div></div></div></div></section>

    <section className="how wrap" id="how"><div className="how-intro"><span className="mini-label">THE GOOD KIND OF CONVENIENT</span><h2>Local doesn’t have<br/>to be complicated.</h2></div><div className="how-steps"><article><b>01</b><MapPin/><h3>Find a local gem</h3><p>Browse what’s close, or use a shop’s personal code.</p></article><article><b>02</b><ShoppingBag/><h3>Reserve your picks</h3><p>Add what you love. Ask the maker anything directly.</p></article><article><Clock3/><b>03</b><h3>Get it your way</h3><p>Pop by today, schedule a time, or have it brought to you.</p></article></div></section>

    <section className="sell" id="sell"><div className="wrap sell-inner"><div><span className="mini-label">FOR VENDORS</span><h2>Your neighbourhood<br/>is your storefront.</h2><p>A softer, simpler way to sell what you make. List your goods, take orders and talk directly to your people.</p><button className="primary-btn">Start selling <ArrowRight size={18}/></button></div><div className="sell-stats"><div><strong>0%</strong><span>platform commission<br/>while we’re growing</span></div><div><strong>1:1</strong><span>conversations with<br/>your customers</span></div><div><strong>∞</strong><span>reasons to make<br/>good things</span></div></div></div></section>
    <footer className="wrap"><span className="brand"><i>n</i>eighbourhood</span><span>Built close to home.</span><span>© 2025 Neighbourhood</span></footer>
  </main>
}

type UnitSelectionSetter = Dispatch<SetStateAction<Record<number, number>>>

function UnitChoices({ product, selected, onSelect }: { product: Product, selected: number, onSelect: (index: number) => void }) {
  return <div className="unit-choices" aria-label={`Choose a size for ${product.name}`}>
    {product.units.map((unit, index) => <button key={unit.label} className={selected === index ? 'selected' : ''} onClick={() => onSelect(index)}><span>{unit.label}</span><b>${unit.price}</b></button>)}
  </div>
}

function Catalog({ products, selectedUnits, setSelectedUnits, onOpen, onAdd }: { products: Product[], selectedUnits: Record<number, number>, setSelectedUnits: UnitSelectionSetter, onOpen: (product: Product) => void, onAdd: (id: number) => void }) {
  return <div className="product-grid">{products.map(p => {
    const selected = selectedUnits[p.id] || 0
    return <article className="product-card" key={p.id}>
      <button className={`product-image ${p.tone}`} onClick={() => onOpen(p)}><img src={p.image} alt={p.name}/>{p.badge && <span className="badge">{p.badge}</span>}<span className="view-product">View item <ArrowRight size={16}/></span></button>
      <div className="product-info"><button onClick={() => onOpen(p)}><h3>{p.name}</h3><p>Available in 3 sizes</p></button><div className="price-row"><strong>from ${p.units[0].price}</strong><button className="add-btn" onClick={() => onAdd(p.id)} aria-label={`Add ${p.name}`}><Plus size={19}/></button></div></div>
      <UnitChoices product={p} selected={selected} onSelect={index => setSelectedUnits(prev => ({ ...prev, [p.id]: index }))}/>
    </article>
  })}</div>
}

function StorePage() {
  const { vendorId } = useParams({ from: '/shops/$vendorId' })
  const vendor = vendors.find(item => item.slug === vendorId) || vendors[0]
  const [selectedUnits, setSelectedUnits] = useState<Record<number, number>>({})
  const [product, setProduct] = useState<Product | null>(null)
  const [items, setItems] = useState(0)
  const unitFor = (p: Product) => p.units[selectedUnits[p.id] || 0]

  return <main className="shop-page">
    <nav className="nav wrap shop-nav"><Link to="/" className="brand"><span>n</span>eighbourhood</Link><Link to="/" className="back-shop"><ArrowLeft size={17}/> All local shops</Link><button className="cart-nav"><ShoppingBag size={18}/><span>Bag{items ? ` · ${items}` : ''}</span></button></nav>
    <header className="vendor-hero" style={{ '--vendor-color': vendor.color } as CSSProperties}><div className="wrap vendor-hero-inner"><div className="vendor-hero-symbol">{vendor.emoji}</div><div><span className="mini-label">{vendor.kind} · {vendor.distance}</span><h1>{vendor.name}</h1><p>{vendor.line}</p><span className="shop-code">SHOP CODE · {vendor.code}</span></div><div className="vendor-hero-note">Made nearby<br/>for today <ArrowRight size={17}/></div></div></header>
    <section className="storefront store-pagefront"><div className="wrap"><div className="store-head"><div><span className="mini-label">SHOP THE EDIT</span><h2>Choose your size.</h2><p>Every listing has three simple ways to bring home more or less.</p></div><button className="follow"><Heart size={17}/> Follow shop</button></div><div className="filters"><button className="active">Everything</button><button>Food & drink</button><button>Flowers</button><button>Home objects</button><button className="filter-drop">Sort by <ChevronDown size={16}/></button></div><Catalog products={products} selectedUnits={selectedUnits} setSelectedUnits={setSelectedUnits} onOpen={setProduct} onAdd={() => setItems(value => value + 1)}/><div className="store-note"><Sparkles size={17}/><p>Need a custom version? <button onClick={() => alert(`Your direct chat with ${vendor.name} would open here.`)}>Send {vendor.name} a request</button> — you’ll hear straight back.</p><MessageCircle size={18}/></div></div></section>
    {product && <div className="overlay" onMouseDown={() => setProduct(null)}><aside className="product-modal" onMouseDown={event => event.stopPropagation()}><button className="close" onClick={() => setProduct(null)}><X size={21}/></button><div className={`modal-image ${product.tone}`}><img src={product.image} alt={product.name}/></div><div className="modal-body"><span className="mini-label">{vendor.name}</span><h2>{product.name}</h2><strong>${unitFor(product).price} <small>· {unitFor(product).label}</small></strong><p>{product.note}</p><UnitChoices product={product} selected={selectedUnits[product.id] || 0} onSelect={index => setSelectedUnits(prev => ({ ...prev, [product.id]: index }))}/><div className="modal-action"><button className="primary-btn" onClick={() => { setItems(value => value + 1); setProduct(null) }}>Add {unitFor(product).label} <Plus size={18}/></button></div><button className="request-link"><MessageCircle size={17}/> Ask {vendor.name} about this</button></div></aside></div>}
  </main>
}

const rootRoute = createRootRoute({ component: () => <Outlet /> })
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: App })
const shopRoute = createRoute({ getParentRoute: () => rootRoute, path: '/shops/$vendorId', component: StorePage })
const routeTree = rootRoute.addChildren([indexRoute, shopRoute])
const router = createRouter({ routeTree })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }

export default function Root() { return <RouterProvider router={router} /> }
