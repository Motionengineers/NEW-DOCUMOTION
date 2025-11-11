/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function run() {
  const defaultPath = '/mnt/data/agencies_1200.csv';
  const localPath = path.join(process.cwd(), 'data', 'agencies_1200.csv');
  const filePath = fs.existsSync(defaultPath) ? defaultPath : localPath;
  if (!fs.existsSync(filePath)) {
    console.error('CSV not found at', defaultPath, 'or', localPath);
    process.exit(1);
  }

  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', r => rows.push(r))
      .on('end', resolve)
      .on('error', reject);
  });

  let created = 0;
  for (const r of rows) {
    try {
      await prisma.agency.create({
        data: {
          name: r.name,
          city: r.city,
          state: r.state,
          services: r.services,
          website: r.website || null,
          contactEmail: r.email || null,
          rating: r.rating ? parseFloat(r.rating) : null,
          verified: ['yes', 'true', '1'].includes(String(r.verified).toLowerCase()),
          portfolio: r.portfolio_images
            ? JSON.stringify(String(r.portfolio_images).split('|'))
            : null,
          minBudget: null,
        },
      });
      created += 1;
    } catch (e) {
      // ignore duplicates
    }
  }

  console.log('Imported agencies:', created, '/', rows.length);
  await prisma.$disconnect();
}

run().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
