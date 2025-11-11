// node scripts/importBankSchemes.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Readable } = require('stream');

const prisma = new PrismaClient();

// Try enhanced CSV first, fallback to original
let csvPath = path.join(__dirname, '../data/bank_schemes_enhanced.csv');
if (!fs.existsSync(csvPath)) {
  csvPath = path.join(__dirname, '../data/bank_schemes.csv');
}

if (!fs.existsSync(csvPath)) {
  console.error('Place CSV at data/bank_schemes.csv or data/bank_schemes_enhanced.csv');
  process.exit(1);
}

const rows = [];

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', r => rows.push(r))
  .on('end', async () => {
    console.log('Rows:', rows.length);
    try {
      let imported = 0;
      let updated = 0;

      for (const r of rows) {
        try {
          // Normalize and map CSV fields
          const bankName = r.bankName || r.bank_name || r.bank || '';
          const schemeName = r.schemeName || r.scheme_name || r.scheme || '';

          if (!bankName || !schemeName) {
            console.log('Skipping row with missing bankName or schemeName');
            continue;
          }

          // Check if exists by bankName + schemeName
          const existing = await prisma.bankScheme.findFirst({
            where: {
              bankName: bankName,
              schemeName: schemeName,
            },
          });

          const data = {
            bankName: bankName,
            schemeName: schemeName,
            type: r.type || r.category || null,
            minLoanAmount: r.minLoanAmount
              ? parseInt(r.minLoanAmount)
              : r.minLoanAmt
                ? parseInt(r.minLoanAmt)
                : null,
            maxLoanAmount: r.maxLoanAmount
              ? parseInt(r.maxLoanAmount)
              : r.maxLoanAmt
                ? parseInt(r.maxLoanAmt)
                : null,
            interestRate: r.interestRate || r.interest_rate || null,
            tenure: r.tenure || null,
            processingFees: r.processingFees || r.processing_fees || null,
            eligibility: r.eligibility || null,
            documentsRequired: r.documentsRequired || r.documents_required || null,
            sectors: r.sectors || r.industry || null,
            states: r.states || r.state || null,
            description: r.description || null,
            officialSource: r.officialSource || r.official_link || r.officialSource || null,
            status: r.status || 'Active',
            sourceFetchedAt: r.sourceFetchedAt ? new Date(r.sourceFetchedAt) : null,
            // Legacy fields
            benefits: r.benefits || null,
            industry: r.industry || null,
            state: r.state || null,
            region: r.region || 'National',
            collateral: r.collateral || null,
            source: r.source || 'CSV Import',
            lastUpdatedBy: r.lastUpdatedBy || 'system',
          };

          if (existing) {
            await prisma.bankScheme.update({
              where: { id: existing.id },
              data: data,
            });
            updated++;
            console.log(`↻ Updated: ${bankName} - ${schemeName}`);
          } else {
            await prisma.bankScheme.create({ data });
            imported++;
            console.log(`✓ Imported: ${bankName} - ${schemeName}`);
          }
        } catch (e) {
          console.error(`Error processing row:`, e.message);
        }
      }

      console.log(`\n--- Import Summary ---`);
      console.log(`✓ Successfully imported: ${imported}`);
      console.log(`↻ Updated: ${updated}`);
      console.log(`Total processed: ${rows.length}`);
    } catch (e) {
      console.error('Import error:', e);
    } finally {
      await prisma.$disconnect();
    }
  })
  .on('error', error => {
    console.error('CSV parsing error:', error);
    prisma.$disconnect();
    process.exit(1);
  });
