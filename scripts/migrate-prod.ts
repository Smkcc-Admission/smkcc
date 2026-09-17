import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const localPool = new Pool({ connectionString: process.env.LOCAL_DB_URL });
const localAdapter = new PrismaPg(localPool);
const localPrisma = new PrismaClient({ adapter: localAdapter });

const prodPool = new Pool({ connectionString: process.env.PROD_DB_URL });
const prodAdapter = new PrismaPg(prodPool);
const prodPrisma = new PrismaClient({ adapter: prodAdapter });

async function main() {
  console.log('Fetching local data...');
  const localAdmins = await localPrisma.adminUser.findMany();
  const localPrograms = await localPrisma.program.findMany();
  
  console.log(`Found ${localAdmins.length} admins and ${localPrograms.length} programs locally.`);

  console.log('Writing to production database...');
  
  if (localPrograms.length > 0) {
    await prodPrisma.program.createMany({
      data: localPrograms,
      skipDuplicates: true
    });
    console.log('Programs migrated.');
  }

  if (localAdmins.length > 0) {
    await prodPrisma.adminUser.createMany({
      data: localAdmins,
      skipDuplicates: true
    });
    console.log('Admins migrated.');
  }

  console.log('Migration complete!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  });
