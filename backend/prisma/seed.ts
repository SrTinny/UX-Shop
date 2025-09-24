import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ux.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@ux.com',
      password: passwordHash,
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('Seed OK. Admin:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
