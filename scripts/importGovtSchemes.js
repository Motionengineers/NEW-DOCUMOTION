const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const prisma = new PrismaClient();

async function importGovtSchemes() {
  try {
    console.log('Starting government schemes import...');

    // Try enhanced CSV first, fallback to original
    let csvPath = path.join(__dirname, '../data/govt_schemes_enhanced.csv');
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../data/govt_schemes.csv');
      console.log('Enhanced CSV not found, using original CSV');
    } else {
      console.log('Using enhanced CSV with 50 schemes');
    }

    const csvData = fs.readFileSync(csvPath, 'utf-8');

    Papa.parse(csvData, {
      header: true,
      complete: async results => {
        console.log(`Found ${results.data.length} records to import`);

        let imported = 0;
        let updated = 0;
        let skipped = 0;

        for (const row of results.data) {
          try {
            // Skip empty rows
            if (!row.scheme_name && !row.schemeName) {
              skipped++;
              continue;
            }

            const schemeName = row.scheme_name || row.schemeName || '';

            if (!schemeName.trim()) {
              skipped++;
              continue;
            }

            // Map CSV columns to database fields (support both old and new formats)
            const schemeData = {
              schemeName: schemeName,
              ministry: row.ministry_or_department || row.ministry || null,
              department: row.department || null,
              category: row.category || null,
              benefitType: row.benefitType || row.benefit_type || null,
              benefits: row.benefits || null,
              maxAssistance: row.max_assistance || row.maxAssistance || null,
              amountRange: row.amountRange || row.amount_range || null,
              eligibility: row.eligibility || null,
              sectors: row.sectors || null,
              region: row.region || null,
              applicationProcess: row.application_process || row.applicationProcess || null,
              officialLink: row.official_link || row.officialLink || null,
              applicationLink:
                row.application_link ||
                row.applicationLink ||
                row.official_link ||
                row.officialLink ||
                null,
              status: row.status || 'Active',
              description: row.description || null,
              source: row.source || 'CSV Import',
            };

            // Use upsert to update existing or create new
            const result = await prisma.govtScheme.upsert({
              where: { schemeName: schemeName },
              update: schemeData,
              create: schemeData,
            });

            // Check if it was created or updated (upsert doesn't tell us, so we check created date)
            const existing = await prisma.govtScheme.findUnique({
              where: { schemeName: schemeName },
              select: { createdAt: true },
            });

            if (existing && existing.createdAt.getTime() === result.createdAt.getTime()) {
              imported++;
              console.log(`✓ Imported: ${schemeName}`);
            } else {
              updated++;
              console.log(`↻ Updated: ${schemeName}`);
            }
          } catch (error) {
            console.error(`Error processing ${row.scheme_name || row.schemeName}:`, error.message);
            skipped++;
          }
        }

        console.log('\n--- Import Summary ---');
        console.log(`✓ Successfully imported: ${imported}`);
        console.log(`↻ Updated: ${updated}`);
        console.log(`⊘ Skipped: ${skipped}`);
        console.log(`Total processed: ${results.data.length}`);
      },
    });
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importGovtSchemes();
