const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testQuery() {
  try {
    console.log('Testing Prisma query...');

    // Test 1: Simple query without filters
    const allFounders = await prisma.founderProfile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✓ Found ${allFounders.length} founders (first 5)`);
    console.log(
      'Sample:',
      allFounders[0]
        ? {
            id: allFounders[0].id,
            name: `${allFounders[0].firstName} ${allFounders[0].lastName}`,
            company: allFounders[0].company,
          }
        : 'none'
    );

    // Test 2: Count
    const total = await prisma.founderProfile.count();
    console.log(`✓ Total founders: ${total}`);

    // Test 3: Query with pagination (like API does)
    const [founders, count] = await Promise.all([
      prisma.founderProfile.findMany({
        skip: 0,
        take: 50,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.founderProfile.count(),
    ]);

    console.log(`✓ Paginated query: ${founders.length} founders, total: ${count}`);

    // Test 4: Response format (like API returns)
    const response = {
      founders,
      pagination: {
        page: 1,
        limit: 50,
        total: count,
        pages: Math.ceil(count / 50),
      },
    };

    console.log('✓ Response format:', {
      foundersCount: response.founders.length,
      total: response.pagination.total,
      pages: response.pagination.pages,
    });

    console.log('\n✅ All tests passed! API should work.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
