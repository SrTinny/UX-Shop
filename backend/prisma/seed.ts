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
  const products = [
    { name: 'Notebook Dell Inspiron 15', description: 'Intel i7, 16GB RAM, SSD 512GB', price: 4500, stock: 10, imageUrl: 'https://picsum.photos/300/200?random=1' },
    { name: 'Samsung Galaxy S23', description: 'Tela 6.1", 8GB RAM, 256GB', price: 3800, stock: 15, imageUrl: 'https://picsum.photos/300/200?random=2' },
    { name: 'Fone Bluetooth JBL', description: 'Bateria até 40h', price: 350, stock: 30, imageUrl: 'https://picsum.photos/300/200?random=3' },
    { name: 'Monitor LG UltraWide 29"', description: 'IPS Full HD, 21:9', price: 1200, stock: 8, imageUrl: 'https://picsum.photos/300/200?random=4' },
    { name: 'Mouse Gamer Logitech G502', description: 'Sensor HERO 25K, RGB', price: 280, stock: 20, imageUrl: 'https://picsum.photos/300/200?random=5' },
    { name: 'Teclado Mecânico Redragon', description: 'Switch Blue, ABNT2', price: 220, stock: 18, imageUrl: 'https://picsum.photos/300/200?random=6' },
    { name: 'SSD NVMe 1TB Kingston', description: 'Leituras até 3500MB/s', price: 420, stock: 25, imageUrl: 'https://picsum.photos/300/200?random=7' },
    { name: 'Roteador TP-Link Archer AX50', description: 'Wi-Fi 6, Dual Band', price: 690, stock: 12, imageUrl: 'https://picsum.photos/300/200?random=8' },
    { name: 'Smartwatch Amazfit Bip 3', description: 'GPS, 60+ modos esportivos', price: 330, stock: 22, imageUrl: 'https://picsum.photos/300/200?random=9' },
    { name: 'Echo Dot 5ª Geração', description: 'Alexa, som melhorado', price: 280, stock: 28, imageUrl: 'https://picsum.photos/300/200?random=10' }
  ]

  for (const p of products) {
    const data = { ...p, slug: slugify(p.name) }
    const { slug, ...updateData } = data // não tente mudar slug no update

    await prisma.product.upsert({
      where: { slug },
      update: updateData,       // <- agora atualiza imageUrl/price/stock/...
      create: data,
    })
  }


  console.log('Seed OK.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
