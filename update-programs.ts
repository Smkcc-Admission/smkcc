import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.program.updateMany({
    where: { code: 'IT01' },
    data: { contactUrl: 'https://line.me/ti/g2/MockLineIT' }
  });
  await prisma.program.updateMany({
    where: { code: 'AC01' },
    data: { contactUrl: 'https://line.me/ti/g2/MockLineAC' }
  });
  await prisma.program.updateMany({
    where: { code: 'MG01' },
    data: { contactUrl: 'https://line.me/ti/g2/MockLineMG' }
  });
  await prisma.program.updateMany({
    where: { code: 'EC01' },
    data: { contactUrl: 'https://line.me/ti/g2/MockLineEC' }
  });
  console.log("Updated all existing programs with contactUrl");
  process.exit(0);
}

main().catch(console.error);
