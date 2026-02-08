import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Example: Create a default admin user
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      wallet: '0x0000000000000000000000000000000000000000',
      role: 'admin',
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });