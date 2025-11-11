const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Fetch Google Sheets as CSV
 * Format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
 */
async function fetchSheetAsCSV(sheetId, gid = '0', outputPath) {
  return new Promise((resolve, reject) => {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

    console.log(`Fetching: ${url}`);

    const followRedirect = res => {
      if (
        res.statusCode === 301 ||
        res.statusCode === 302 ||
        res.statusCode === 307 ||
        res.statusCode === 308
      ) {
        const redirectUrl = res.headers.location;
        console.log(`  Redirecting to: ${redirectUrl}`);
        https.get(redirectUrl, followRedirect).on('error', reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch: ${res.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Saved to: ${outputPath}`);
        resolve(outputPath);
      });
    };

    https.get(url, followRedirect).on('error', err => {
      reject(err);
    });
  });
}

/**
 * Google Sheets configuration
 * Maps sheet IDs to output files and data types
 */
const sheetsConfig = [
  {
    id: '1YW51k7Op1Lrtp6zzedqwaOSo04Z_vJvolk_o-bhpBvw',
    gid: '451528653', // Updated GID from URL
    type: 'founders',
    output: path.join(__dirname, '../data/google_sheets_founders_1.csv'),
    description: 'Founders/CEOs List - EasyLeadz (100+ founders)',
  },
  {
    id: '1UO87-rLg9sKRFu50lxz3WsQ92yR0nig4WspVehVJhGY',
    gid: '0',
    type: 'founders',
    output: path.join(__dirname, '../data/google_sheets_founders_2.csv'),
    description: 'Founders/CEOs List 2',
  },
  {
    id: '1dZs8FEkfDGixOkSZbnbbl8buyBmpVn7O',
    gid: '1145497574',
    type: 'talent',
    output: path.join(__dirname, '../data/google_sheets_talent.csv'),
    description: 'Talent/CTOs List',
  },
  {
    id: '1z5AWaR0kCu0Y-N6Z3C17cR0tousdAnCF',
    gid: '64233471',
    type: 'agencies',
    output: path.join(__dirname, '../data/google_sheets_agencies.csv'),
    description: 'Ad Agencies List',
  },
  {
    id: '11IX9LFRxxb8GX4T9FgskS6mGyAHt3oV_',
    gid: '106719161',
    type: 'investors',
    output: path.join(__dirname, '../data/google_sheets_investors.csv'),
    description: 'Investors List 1',
  },
  {
    id: '1bHslVHe1FYRN442ehqDSkmmiJakJj_6x',
    gid: '1478871408',
    type: 'investors',
    output: path.join(__dirname, '../data/google_sheets_investors_2.csv'),
    description: 'Investors List 2',
  },
];

async function fetchAllSheets() {
  console.log('🚀 Fetching Google Sheets data...\n');

  for (const config of sheetsConfig) {
    try {
      await fetchSheetAsCSV(config.id, config.gid, config.output);
      console.log(`  ${config.description}: ✓\n`);
    } catch (error) {
      console.error(`  ${config.description}: ✗ Error - ${error.message}\n`);
    }
  }

  console.log('✅ All sheets fetched!');
  console.log('\nNext steps:');
  console.log('1. Review the CSV files in data/ folder');
  console.log('2. Run import scripts to map and import data');
}

// Run if called directly
if (require.main === module) {
  fetchAllSheets().catch(console.error);
}

module.exports = { fetchSheetAsCSV, fetchAllSheets };
