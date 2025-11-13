/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Google Sheets CSV export URL (replace with your actual export URL)
// Format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
const SHEET_ID = '1GtSQtQpxoOuQvYRjjKu78l6xs-AQMeP_';
const GID = '1831208308';
const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

const INPUT = process.env.STARTUPS_CSV || path.resolve('data/funded_startups.csv');
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 500);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function parseAmountToNumber(val) {
  if (!val) return null;
  const s = String(val).replace(/[,\s]/g, '');
  // Match patterns like $15M, €47M, $2.238094M, $725K, etc.
  const m = s.match(/([$€₹]?)([0-9]*\.?[0-9]+)([kKmMbB])?/);
  if (!m) return null;
  const num = parseFloat(m[2]);
  const mult = m[3]?.toLowerCase();
  if (mult === 'k') return num * 1e3;
  if (mult === 'm') return num * 1e6;
  if (mult === 'b') return num * 1e9;
  return num;
}

function parseCompanySize(csize) {
  if (!csize) return null;
  const s = String(csize).trim();
  // Handle formats like "11-50'", "1-10'", "51-200'", "1001-5000'"
  return s.replace(/'$/, '');
}

function extractYearFromData(val) {
  // Try to extract founding year if available, otherwise return null
  // For now, we'll leave it null as the sheet doesn't have this column
  return null;
}

async function downloadCSV(url, outputPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download CSV: ${response.statusText}`);
    }
    const text = await response.text();
    fs.writeFileSync(outputPath, text, 'utf-8');
    console.log(`Downloaded CSV to ${outputPath}`);
    return true;
  } catch (error) {
    console.error('Error downloading CSV:', error.message);
    return false;
  }
}

async function processBatch(rows) {
  return prisma.$transaction(
    async tx => {
      let inserted = 0;
      let updated = 0;

      for (const r of rows) {
        const name = (r.Name || r.name || '').trim();
        if (!name) continue;

        const industry = (r.Industry || r.industry || '').trim() || null;
        const location = (r.Location || r.location || '').trim() || null;
        const companySize = parseCompanySize(r.Csize || r.csize || r['Company Size'] || '');
        const website = (r.Website || r.website || '').trim() || null;
        const fundingStage =
          (r['Funding Stage'] || r.fundingStage || r['Funding Stage'] || '').trim() || null;
        const fundingAmount =
          (r['Funding Amount'] || r.fundingAmount || r['Funding Amount'] || '').trim() || null;
        const contactInfo =
          (r['Contact Numbers of decision-makers'] || r.contactInfo || '').trim() || null;

        const fundingAmountNumeric = parseAmountToNumber(fundingAmount);

        // Check if startup already exists by name (case-insensitive for SQLite)
        const allExisting = await tx.fundedStartup.findMany({
          where: { name: { contains: name } },
        });
        const existing = allExisting.find(s => s.name.toLowerCase() === name.toLowerCase());

        const data = {
          name,
          industry,
          location,
          companySize,
          website,
          fundingStage,
          fundingAmount,
          fundingAmountNumeric,
          foundedYear: extractYearFromData(r),
          contactInfo,
          sourceUrl: CSV_EXPORT_URL,
        };

        if (!existing) {
          await tx.fundedStartup.create({ data });
          inserted++;
        } else {
          await tx.fundedStartup.update({
            where: { id: existing.id },
            data,
          });
          updated++;
        }
      }

      return { inserted, updated };
    },
    { timeout: 60000 }
  );
}

async function main() {
  console.log('Starting funded startups import...');

  // Try to download CSV if file doesn't exist
  if (!fs.existsSync(INPUT)) {
    console.log(`CSV file not found at ${INPUT}`);
    console.log(`Attempting to download from Google Sheets...`);
    const downloaded = await downloadCSV(CSV_EXPORT_URL, INPUT);
    if (!downloaded) {
      console.error(`\nPlease download the Google Sheets as CSV and save it to: ${INPUT}`);
      console.error(`Or set STARTUPS_CSV environment variable to point to your CSV file.`);
      process.exit(1);
    }
  }

  console.log(`Reading CSV from: ${INPUT}`);
  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(INPUT)
      .pipe(csv())
      .on('data', data => rows.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Rows loaded: ${rows.length}`);

  let totalInserted = 0;
  let totalUpdated = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { inserted, updated } = await processBatch(batch);
    totalInserted += inserted;
    totalUpdated += updated;
    console.log(
      `Processed ${Math.min(i + batch.length, rows.length)}/${rows.length} (+${inserted} new, ~${updated} updated)`
    );
    await sleep(50);
  }

  console.log('\nImport complete!');
  console.log(`Total: ${totalInserted} inserted, ${totalUpdated} updated`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async err => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
