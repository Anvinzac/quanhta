export type Unit = { label: string, price: number }

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

export type Vendor = {
  slug: string
  name: string
  kind: string
  code: string
  color: string
  emoji: string
  line: string
  distance: string
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

export const categories: string[] = catalogGroups.map(group => group.category)

export const products: Product[] = catalogGroups.flatMap((group, groupIndex) => group.items.map((name, itemIndex) => {
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

export const productById = new Map(products.map(product => [product.id, product]))

export const vendors: Vendor[] = [
  { slug: 'little-day', name: 'Little Day', kind: 'Flowers · baking · objects', code: 'LTL-DAY', color: '#e88d77', emoji: '✳', line: 'Small, cheerful things for everyday life.', distance: '0.4 km away' },
  { slug: 'le-petit-marche', name: 'Le Petit Marché', kind: 'French pantry · prepared food', code: 'PETIT25', color: '#f3c86d', emoji: '✦', line: 'A tiny French market for slow afternoons.', distance: '0.8 km away' },
  { slug: 'the-green-table', name: 'The Green Table', kind: 'Plants · garden supplies', code: 'GREEN-T', color: '#86a889', emoji: '●', line: 'Garden-grown essentials and small green joys.', distance: '1.2 km away' },
]

export const vendorBySlug = (slug: string) => vendors.find(vendor => vendor.slug === slug)

export const vendorByCode = (code: string) => {
  const normalised = code.trim().toUpperCase()
  return vendors.find(vendor => vendor.code === normalised)
}

export const formatPrice = (amount: number) => `$${amount}`
