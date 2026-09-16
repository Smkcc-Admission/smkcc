import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
  console.log('Deleting mock applicants...');
  
  const result = await prisma.applicant.deleteMany({
    where: {
      applicationId: {
        startsWith: 'SMKCC-MOCK-'
      }
    }
  });

  console.log(`Successfully deleted ${result.count} mock applicants.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
