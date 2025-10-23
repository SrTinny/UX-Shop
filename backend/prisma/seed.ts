// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

async function main() {
  // --- Admin ---
  const passwordHash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@ux.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@ux.com',
      password: passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  })

  // --- Produtos (equipamentos eletrônicos) ---
  // categories to assign
  const categories = [
    { name: 'Informática', slug: 'informatica' },
    { name: 'Celulares', slug: 'celulares' },
    { name: 'Áudio', slug: 'audio' },
    { name: 'Acessórios', slug: 'acessorios' },
    { name: 'Periféricos', slug: 'perifericos' },
    { name: 'Casa Inteligente', slug: 'casa-inteligente' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Oficina', slug: 'oficina' },
  ]

  // upsert categories
  const createdCats: { id: string; slug: string; name: string }[] = []
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, slug: c.slug },
    })
    createdCats.push(cat)
  }

  // base product name parts to generate many products
  const adjectives = ['Pro', 'Max', 'Mini', 'Plus', 'Ultra', 'Neo', 'Prime', 'X', 'S', 'Lite']
  const nouns = [
    'Notebook', 'Monitor', 'Mouse', 'Teclado', 'SSD', 'Roteador', 'Webcam', 'Microfone', 'Placa de vídeo', 'Fonte',
    'Gabinete', 'Fone', 'Smartwatch', 'Carregador', 'Cabo HDMI', 'Cadeira', 'Hub USB', 'Adaptador', 'Suporte', 'Teclado'
  ]

  // helper to pick random
  function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)] }

  type SeedProduct = { name: string; description: string; price: number; stock: number; imageUrl: string; categorySlug?: string; tag?: 'PROMOCAO' | 'NOVO' | null }
  const products: SeedProduct[] = []

  // small helper to pick a random tag with some probability
  function pickTag(): 'PROMOCAO' | 'NOVO' | undefined {
    const r = Math.random()
    if (r < 0.12) return 'PROMOCAO'
    if (r < 0.22) return 'NOVO'
    return undefined
  }

  // seed some curated items first
  const curated = [
    { name: 'Notebook Dell Inspiron 15', description: 'Intel i7, 16GB RAM, SSD 512GB' },
    { name: 'Samsung Galaxy S23', description: 'Tela 6.1", 8GB RAM, 256GB' },
    { name: 'Fone Bluetooth JBL', description: 'Bateria até 40h' },
    { name: 'Monitor LG UltraWide 29"', description: 'IPS Full HD, 21:9' },
    { name: 'Mouse Gamer Logitech G502', description: 'Sensor HERO 25K, RGB' },
    { name: 'Teclado Mecânico Redragon', description: 'Switch Blue, ABNT2' },
  ]
  for (const [i, p] of curated.entries()) {
    const cat = pick(createdCats)!;
    products.push({ name: p.name, description: p.description, price: Math.round(100 + Math.random() * 3000), stock: 5 + Math.floor(Math.random() * 50), imageUrl: `https://picsum.photos/300/200?random=${i+1}`, categorySlug: cat.slug, tag: pickTag() ?? null })
  }

  // generate additional to reach ~100
  while (products.length < 100) {
    const adj = pick(adjectives)
    const noun = pick(nouns)
    const name = `${noun} ${adj}`
    const price = Math.round(30 + Math.random() * 5000)
    const stock = Math.floor(Math.random() * 100)
    const idx = Math.floor(Math.random() * 1000)
    const cat2 = pick(createdCats)!;
    products.push({ name, description: `${name} com especificações variadas`, price, stock, imageUrl: `https://picsum.photos/300/200?random=${idx}`, categorySlug: cat2.slug, tag: pickTag() ?? null })
  }

  for (const p of products) {
  const { categorySlug, ...rest } = p as SeedProduct
  const data = { ...rest, slug: slugify(rest.name), categoryId: createdCats.find((c) => c.slug === categorySlug)?.id ?? null }
    const { slug, ...updateData } = data
    await prisma.product.upsert({
      where: { slug },
      update: updateData,
      create: data,
    })
  }


  console.log('Seed OK.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
