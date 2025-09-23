import { prisma } from '../src/config/prisma';
import bcryptjs from 'bcryptjs';

async function main() {
  const passwordHash = await bcryptjs.hash('admin123', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ux.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@ux.com',
      password: passwordHash,
      isAdmin: true,
      isActive: true
    }
  });

  // Produtos
  await prisma.product.createMany({
    data: [
      { name: 'Teclado Mecânico', description: 'Switch azul', price: 299.9, stock: 10 },
      { name: 'Mouse Gamer', description: '16000 DPI', price: 149.9, stock: 25 }
    ],
    skipDuplicates: true
  });

  console.log('Seed ok! Admin:', admin.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
