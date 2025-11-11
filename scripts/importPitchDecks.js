const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const prisma = new PrismaClient();

async function importPitchDecks() {
  try {
    console.log('Starting pitch decks import...');

    const csvPath = path.join(__dirname, '../data/pitch_decks.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');

    Papa.parse(csvData, {
      header: true,
      complete: async results => {
        console.log(`Found ${results.data.length} records to import`);

        let imported = 0;
        let skipped = 0;

        for (const row of results.data) {
          try {
            // Check if pitch deck already exists
            const exists = await prisma.pitchDeck.findFirst({
              where: {
                title: row.title,
                companyName: row.companyName,
              },
            });

            if (exists) {
              console.log(`Skipping duplicate: ${row.title}`);
              skipped++;
              continue;
            }

            // Create pitch deck
            await prisma.pitchDeck.create({
              data: {
                title: row.title || '',
                companyName: row.companyName || null,
                stage: row.stage || null,
                category: row.category || null,
                industry: row.industry || null,
                source: row.source || null,
                fileUrl: row.fileUrl || '',
                thumbnail: row.thumbnail || null,
                year: row.year ? parseInt(row.year) : null,
                description: row.description || null,
                tags: row.tags || null,
              },
            });

            imported++;
            console.log(`✓ Imported: ${row.title}`);
          } catch (error) {
            console.error(`Error importing ${row.title}:`, error.message);
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

importPitchDecks();
