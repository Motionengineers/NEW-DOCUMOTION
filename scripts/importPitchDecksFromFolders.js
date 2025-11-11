const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Folder to stage mapping
const STAGE_MAP = {
  PRE_SEED: 'pre_seed',
  SEED: 'seed',
  'SERIES A': 'series_a',
  'Y Combinator-backed startups': 'yc',
};

async function importPitchDecks() {
  try {
    console.log('🚀 Starting pitch deck import from folders...\n');

    const baseDir = path.join(__dirname, '../public/uploads/PDF');

    if (!fs.existsSync(baseDir)) {
      console.error('❌ PDF directory not found:', baseDir);
      process.exit(1);
    }

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Process each folder
    for (const [folderName, stage] of Object.entries(STAGE_MAP)) {
      const folderPath = path.join(baseDir, folderName);

      if (!fs.existsSync(folderPath)) {
        console.log(`⚠️  Folder not found: ${folderName}, skipping...`);
        continue;
      }

      console.log(`\n📁 Processing folder: ${folderName} → stage: ${stage}`);

      const files = fs
        .readdirSync(folderPath)
        .filter(file => file.toLowerCase().endsWith('.pdf') && !file.startsWith('._'));

      console.log(`   Found ${files.length} PDF files`);

      for (const file of files) {
        try {
          const filePath = path.join(folderPath, file);
          const fileUrl = `/uploads/PDF/${folderName}/${file}`;

          // Extract title from filename (remove extension)
          const title = path.parse(file).name;

          // Check if already exists
          const exists = await prisma.pitchDeck.findFirst({
            where: {
              fileUrl: fileUrl,
            },
          });

          if (exists) {
            console.log(`   ⏭️  Skipping duplicate: ${file}`);
            totalSkipped++;
            continue;
          }

          // Create pitch deck record
          await prisma.pitchDeck.create({
            data: {
              title: title.replace(/_/g, ' ').replace(/-/g, ' '),
              companyName: null, // Can be manually updated later
              stage: stage,
              category: null,
              industry: null,
              source: folderName,
              fileUrl: fileUrl,
              thumbnail: null,
              year: null,
              description: `Pitch deck from ${folderName} stage`,
              tags: stage,
            },
          });

          console.log(`   ✅ Imported: ${file}`);
          totalImported++;
        } catch (error) {
          console.error(`   ❌ Error importing ${file}:`, error.message);
          totalErrors++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Import Summary');
    console.log('='.repeat(50));
    console.log(`✅ Imported: ${totalImported}`);
    console.log(`⏭️  Skipped: ${totalSkipped}`);
    console.log(`❌ Errors: ${totalErrors}`);
    console.log(`📦 Total: ${totalImported + totalSkipped + totalErrors}`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importPitchDecks()
  .then(() => {
    console.log('\n🎉 Import completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });
