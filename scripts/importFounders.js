const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const prisma = new PrismaClient();

async function importFounders() {
  try {
    console.log('Starting founders import...');

    const csvPath = path.join(__dirname, '../data/founders.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');

    Papa.parse(csvData, {
      header: true,
      complete: async results => {
        console.log(`Found ${results.data.length} records to import`);

        let imported = 0;
        let skipped = 0;

        for (const row of results.data) {
          try {
            // Check if founder already exists by email or name
            const exists = await prisma.founderProfile.findFirst({
              where: {
                OR: [
                  { email: row.email },
                  {
                    AND: [{ firstName: row.firstName }, { lastName: row.lastName }],
                  },
                ],
              },
            });

            if (exists) {
              console.log(`Skipping duplicate: ${row.firstName} ${row.lastName}`);
              skipped++;
              continue;
            }

            // Create founder profile
            await prisma.founderProfile.create({
              data: {
                firstName: row.firstName || '',
                lastName: row.lastName || '',
                company: row.company || null,
                role: row.role || null,
                skills: row.skills || null,
                experience: row.experience || null,
                location: row.location || null,
                linkedin: row.linkedin || null,
                portfolio: row.portfolio || null,
                availability: row.availability || null,
                email: row.email || null,
                phone: row.phone || null,
                education: row.education || null,
                specializations: row.specializations || null,
              },
            });

            imported++;
            console.log(`✓ Imported: ${row.firstName} ${row.lastName}`);
          } catch (error) {
            console.error(`Error importing ${row.firstName} ${row.lastName}:`, error.message);
          }
        }

        console.log('\n--- Import Summary ---');
        console.log(`✓ Successfully imported: ${imported}`);
        console.log(`⊘ Skipped (duplicates): ${skipped}`);
        console.log(`Total processed: ${results.data.length}`);
      },
    });
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importFounders();
