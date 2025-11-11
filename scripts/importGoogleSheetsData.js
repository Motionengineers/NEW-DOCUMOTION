const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { fetchAllSheets } = require('./fetchGoogleSheets');

const prisma = new PrismaClient();

/**
 * Map Google Sheets founder columns to FounderProfile schema
 * Columns: Name, JobTitle, Company, Location, Url (LinkedIn), Contact Numbers
 */
function mapFounderRow(row) {
  // Skip empty rows
  if (!row.Name || row.Name.trim() === '' || row.Name === 'Name') {
    return null;
  }

  const nameParts = (row.Name || '')
    .trim()
    .split(' ')
    .filter(p => p.length > 0);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Extract LinkedIn URL from Url column (filter out Chrome extension URLs)
  let linkedin = null;
  if (row.Url) {
    if (row.Url.includes('linkedin.com/in/')) {
      linkedin = row.Url;
    } else if (row.Url.includes('linkedin.com')) {
      linkedin = row.Url;
    }
  }
  if (!linkedin && row['LinkedIn URL']) {
    linkedin = row['LinkedIn URL'];
  }

  // Extract email - skip if it's a Chrome extension URL
  let email = row.Email || null;
  if (email && (!email.includes('@') || email.includes('chrome.google.com'))) {
    email = null;
  }

  // Extract phone from Contact Numbers (filter out Chrome extension URLs)
  let phone = null;
  if (row['Contact Numbers'] && !row['Contact Numbers'].includes('chrome.google.com')) {
    const phoneMatch = row['Contact Numbers'].match(/[\d+\-\s()]{10,}/);
    if (phoneMatch) {
      phone = phoneMatch[0].replace(/[^\d+]/g, '').substring(0, 15);
    }
  }

  // Build skills from job title and company
  const skills = [];
  if (row.JobTitle) {
    const jobLower = row.JobTitle.toLowerCase();
    if (jobLower.includes('ceo')) skills.push('leadership', 'strategy');
    if (jobLower.includes('founder')) skills.push('entrepreneurship');
    if (jobLower.includes('cto')) skills.push('technology');
    if (jobLower.includes('marketing')) skills.push('marketing');
    if (jobLower.includes('sales')) skills.push('sales');
  }

  if (row.Company) {
    const companyLower = row.Company.toLowerCase();
    if (companyLower.includes('tech')) skills.push('technology');
    if (companyLower.includes('digital') || companyLower.includes('marketing'))
      skills.push('digital marketing');
    if (companyLower.includes('finance') || companyLower.includes('fintech'))
      skills.push('finance');
    if (companyLower.includes('saas')) skills.push('saas');
    if (companyLower.includes('ai') || companyLower.includes('ml')) skills.push('ai/ml');
  }

  // Remove duplicates from skills
  const uniqueSkills = [...new Set(skills)];

  return {
    firstName: firstName || 'Unknown',
    lastName: lastName || 'Founder',
    company: row.Company || null,
    role: row.JobTitle || 'Founder',
    skills: uniqueSkills.join(','),
    location: row.Location || null,
    linkedin: linkedin || null,
    email: email || null,
    phone: phone || null,
    availability: 'Available',
    experience: '5+ years',
    education: 'Graduate',
    specializations: row.JobTitle || null,
  };
}

/**
 * Map Google Sheets agency columns to Agency schema
 */
function mapAgencyRow(row) {
  return {
    name: row.Name || row['Agency Name'] || 'Unknown Agency',
    location: row.Location || row.City || null,
    website: row.Website || row.URL || null,
    instagram: row.Instagram || null,
    rating: row.Rating ? parseFloat(row.Rating) : null,
    description: row.Description || row['About'] || null,
    services: row.Services || row['Service Type'] || 'branding,ads',
  };
}

/**
 * Map Google Sheets investor columns to Investor schema
 */
function mapInvestorRow(row) {
  return {
    name: row.Name || row['Investor Name'] || 'Unknown',
    firm: row.Firm || row.Company || null,
    stageFocus: row['Stage Focus'] || row.Stage || 'Seed',
    sectors: row.Sectors || row.Industry || null,
    location: row.Location || row.City || null,
    email: row.Email || null,
    linkedin: row.LinkedIn || row.URL || null,
  };
}

async function importFoundersFromSheets() {
  const founderFiles = [
    path.join(__dirname, '../data/google_sheets_founders_1.csv'),
    path.join(__dirname, '../data/google_sheets_founders_2.csv'),
    path.join(__dirname, '../data/google_sheets_talent.csv'),
  ];

  let totalImported = 0;
  let totalSkipped = 0;

  for (const filePath of founderFiles) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filePath} - file not found`);
      continue;
    }

    console.log(`\n📂 Processing: ${path.basename(filePath)}`);

    const csvData = fs.readFileSync(filePath, 'utf-8');

    await new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: async results => {
          console.log(`  Found ${results.data.length} records`);

          for (const row of results.data) {
            try {
              const data = mapFounderRow(row);

              // Skip if mapping returned null (empty/invalid row)
              if (!data) {
                totalSkipped++;
                continue;
              }

              // Skip if no contact info (LinkedIn or email)
              if (!data.linkedin && !data.email) {
                totalSkipped++;
                continue;
              }

              // Build OR conditions only for non-null values
              const whereConditions = [];
              if (data.email) whereConditions.push({ email: data.email });
              if (data.linkedin) whereConditions.push({ linkedin: data.linkedin });

              const exists =
                whereConditions.length > 0
                  ? await prisma.founderProfile.findFirst({
                      where: { OR: whereConditions },
                    })
                  : null;

              if (exists) {
                totalSkipped++;
                continue;
              }

              await prisma.founderProfile.create({ data });
              totalImported++;

              if (totalImported % 100 === 0) {
                console.log(`  Imported ${totalImported}...`);
              }
            } catch (error) {
              console.error(`  Error importing row: ${error.message}`);
              totalSkipped++;
            }
          }

          resolve();
        },
        error: reject,
      });
    });
  }

  console.log(`\n✅ Founders: ${totalImported} imported, ${totalSkipped} skipped`);
  return { imported: totalImported, skipped: totalSkipped };
}

async function importAgenciesFromSheets() {
  const filePath = path.join(__dirname, '../data/google_sheets_agencies.csv');

  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Agencies file not found');
    return { imported: 0, skipped: 0 };
  }

  console.log(`\n📂 Processing agencies: ${path.basename(filePath)}`);

  const csvData = fs.readFileSync(filePath, 'utf-8');
  let imported = 0;
  let skipped = 0;

  await new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: async results => {
        console.log(`  Found ${results.data.length} records`);

        for (const row of results.data) {
          try {
            const data = mapAgencyRow(row);

            const exists = await prisma.agency.findFirst({
              where: { name: data.name },
            });

            if (exists) {
              skipped++;
              continue;
            }

            await prisma.agency.create({ data });
            imported++;
          } catch (error) {
            console.error(`  Error: ${error.message}`);
            skipped++;
          }
        }

        resolve();
      },
      error: reject,
    });
  });

  console.log(`✅ Agencies: ${imported} imported, ${skipped} skipped`);
  return { imported, skipped };
}

async function importInvestorsFromSheets() {
  const investorFiles = [
    path.join(__dirname, '../data/google_sheets_investors.csv'),
    path.join(__dirname, '../data/google_sheets_investors_2.csv'),
  ];

  let totalImported = 0;
  let totalSkipped = 0;

  for (const filePath of investorFiles) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filePath} - file not found`);
      continue;
    }

    console.log(`\n📂 Processing: ${path.basename(filePath)}`);

    const csvData = fs.readFileSync(filePath, 'utf-8');

    await new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: async results => {
          console.log(`  Found ${results.data.length} records`);

          for (const row of results.data) {
            try {
              const data = mapInvestorRow(row);

              const exists = await prisma.investor.findFirst({
                where: {
                  OR: [{ name: data.name, firm: data.firm }, { linkedin: data.linkedin }],
                },
              });

              if (exists) {
                totalSkipped++;
                continue;
              }

              await prisma.investor.create({ data });
              totalImported++;
            } catch (error) {
              console.error(`  Error: ${error.message}`);
              totalSkipped++;
            }
          }

          resolve();
        },
        error: reject,
      });
    });
  }

  console.log(`\n✅ Investors: ${totalImported} imported, ${totalSkipped} skipped`);
  return { imported: totalImported, skipped: totalSkipped };
}

async function main() {
  console.log('🚀 Starting Google Sheets data import...\n');

  try {
    // First, fetch all sheets
    console.log('Step 1: Fetching sheets from Google...');
    await fetchAllSheets();
    console.log('');

    // Then import
    console.log('Step 2: Importing data to database...');
    const founders = await importFoundersFromSheets();
    const agencies = await importAgenciesFromSheets();
    const investors = await importInvestorsFromSheets();

    console.log('\n📊 Summary:');
    console.log(`  Founders: ${founders.imported} imported`);
    console.log(`  Agencies: ${agencies.imported} imported`);
    console.log(`  Investors: ${investors.imported} imported`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { importFoundersFromSheets, importAgenciesFromSheets, importInvestorsFromSheets };
