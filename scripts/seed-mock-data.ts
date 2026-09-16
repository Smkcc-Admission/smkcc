import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
  console.log('Seeding mock data for all programs...');

  // Get all programs
  let programs = await prisma.program.findMany();
  
  // If no programs exist, create some standard ones
  if (programs.length === 0) {
    console.log('No programs found, creating default mock programs...');
    await prisma.program.createMany({
      data: [
        { code: 'MGT-01', name: 'สาขาวิชาการจัดการ', isOpen: true },
        { code: 'ACC-01', name: 'สาขาวิชาการบัญชี', isOpen: true },
        { code: 'IT-01', name: 'สาขาวิชาเทคโนโลยีสารสนเทศ', isOpen: true },
      ]
    });
    programs = await prisma.program.findMany();
  }

  // Define templates for applicants
  const templates = [
    { prefix: 'นาย', firstName: 'สมชาย', lastName: 'ใจดี', status: 'PENDING', docs: ['ID_CARD'] },
    { prefix: 'นางสาว', firstName: 'สมหญิง', lastName: 'เรียนเก่ง', status: 'APPROVED', docs: ['ID_CARD', 'HOUSE_REGISTRATION', 'TRANSCRIPT', 'PHOTO'] },
    { prefix: 'นาย', firstName: 'สมหมาย', lastName: 'รักเรียน', status: 'DOCUMENT_REQUESTED', docs: ['ID_CARD', 'HOUSE_REGISTRATION'] },
    { prefix: 'นางสาว', firstName: 'สมใจ', lastName: 'หมายปอง', status: 'PAID', docs: ['ID_CARD', 'HOUSE_REGISTRATION', 'TRANSCRIPT'] },
    { prefix: 'นาย', firstName: 'สมปอง', lastName: 'มองไกล', status: 'REJECTED', docs: ['HOUSE_REGISTRATION', 'TRANSCRIPT', 'PHOTO'] }
  ];

  let appCounter = 1;

  for (const program of programs) {
    console.log(`Creating applicants for program: ${program.name}...`);
    
    for (let i = 0; i < templates.length; i++) {
      const tpl = templates[i];
      const appId = `SMKCC-MOCK-${program.code}-${i+1}`;
      const natId = `11000000${appCounter.toString().padStart(5, '0')}`;
      appCounter++;

      // Delete if already exists
      await prisma.applicant.deleteMany({
        where: {
          OR: [
            { applicationId: appId },
            { nationalId: natId }
          ]
        }
      });

      // Create applicant
      const created = await prisma.applicant.create({
        data: {
          applicationId: appId,
          nationalId: natId,
          prefix: tpl.prefix,
          firstName: `${tpl.firstName}-${program.code}`,
          lastName: tpl.lastName,
          phone: `0812345${i.toString().padStart(3, '0')}`,
          email: `mock${appCounter}@example.com`,
          programId: program.id,
          pdpaConsent: true,
          status: tpl.status as any,
        }
      });

      // Create documents
      if (tpl.docs.length > 0) {
        await prisma.document.createMany({
          data: tpl.docs.map(type => ({
            applicantId: created.id,
            type: type as any,
            fileUrl: `https://example.com/mock-doc-${type.toLowerCase()}.pdf`
          }))
        });
      }
    }
  }

  console.log('Successfully injected mock applicants for all programs.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
