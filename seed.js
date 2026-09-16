require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding programs...");
  const programs = [
    { code: 'IT01', name: 'เทคโนโลยีสารสนเทศ', contactUrl: 'https://line.me/ti/g2/MockLineIT' },
    { code: 'AC01', name: 'การบัญชี', contactUrl: 'https://line.me/ti/g2/MockLineAC' },
    { code: 'MK01', name: 'การตลาด', contactUrl: 'https://line.me/ti/g2/MockLineMK' },
    { code: 'HM01', name: 'การโรงแรม', contactUrl: 'https://line.me/ti/g2/MockLineHM' },
    { code: 'FL01', name: 'ภาษาต่างประเทศ', contactUrl: 'https://line.me/ti/g2/MockLineFL' },
  ];
  await prisma.program.createMany({
    data: programs,
    skipDuplicates: true,
  });
  console.log("Programs seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
