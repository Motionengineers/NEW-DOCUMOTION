const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('🔍 Verifying database connection...');
    const count = await prisma.founderProfile.count();
    console.log(`✅ Database is healthy! Found ${count} founders`);

    const sample = await prisma.founderProfile.findMany({ take: 3 });
    console.log('\n📋 Sample founders:');
    sample.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.firstName} ${f.lastName} - ${f.company || 'N/A'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
