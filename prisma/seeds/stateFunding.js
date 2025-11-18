import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REGION_FALLBACKS = {
  'Andhra Pradesh': 'South',
  'Arunachal Pradesh': 'North East',
  Assam: 'North East',
  Bihar: 'East',
  Chhattisgarh: 'Central',
  Goa: 'West',
  Gujarat: 'West',
  Haryana: 'North',
  'Himachal Pradesh': 'North',
  Jharkhand: 'East',
  Karnataka: 'South',
  Kerala: 'South',
  'Madhya Pradesh': 'Central',
  Maharashtra: 'West',
  Manipur: 'North East',
  Meghalaya: 'North East',
  Mizoram: 'North East',
  Nagaland: 'North East',
  Odisha: 'East',
  Punjab: 'North',
  Rajasthan: 'North',
  Sikkim: 'North East',
  'Tamil Nadu': 'South',
  Telangana: 'South',
  Tripura: 'North East',
  'Uttar Pradesh': 'North',
  Uttarakhand: 'North',
  'West Bengal': 'East',
  Delhi: 'North',
  'Jammu & Kashmir': 'North',
  Ladakh: 'North',
  Chandigarh: 'North',
  'Puducherry': 'South',
};

function normalizeNumber(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : null;
  const normalized = String(value).replace(/[,₹\s]/g, '');
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null) return false;
  return ['true', '1', 'yes', 'verified'].includes(String(value).trim().toLowerCase());
}

function loadCsvRows(filePath) {
  const csvText = fs.readFileSync(filePath, 'utf8');
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: header => header.trim(),
  });
  return parsed.data.map(row => {
    const cleaned = {};
    Object.entries(row).forEach(([key, value]) => {
      cleaned[key] = typeof value === 'string' ? value.trim() : value;
    });
    return cleaned;
  });
}

async function seedStates(stateRows) {
  const stateMap = new Map();
  for (const row of stateRows) {
    const name = row.state;
    if (!name) continue;
    if (stateMap.has(name)) continue;
    stateMap.set(name, {
      abbreviation: row.abbreviation || null,
      region: row.region || REGION_FALLBACKS[name] || null,
      description: row.stateDescription || null,
    });
  }

  const createdStateIds = new Map();
  for (const [name, meta] of stateMap.entries()) {
    const record = await prisma.state.upsert({
      where: { name },
      update: {
        abbreviation: meta.abbreviation,
        region: meta.region,
        description: meta.description,
      },
      create: {
        name,
        abbreviation: meta.abbreviation,
        region: meta.region,
        description: meta.description,
      },
    });
    createdStateIds.set(name, record.id);
  }
  return createdStateIds;
}

async function seedSchemes(rows, stateIds) {
  if (!rows.length) return;
  await prisma.stateFundingScheme.deleteMany();

  const data = rows
    .map(row => {
      const stateId = stateIds.get(row.state);
      if (!stateId) {
        console.warn(`Skipping scheme for state "${row.state}" – state not found`);
        return null;
      }
      // Generate title from fundingType + sector if title not provided
      const title = row.title || `${row.fundingType || 'Grant'} - ${row.sector || 'General'} - ${row.state}`;

      return {
        stateId,
        title,
        description: row.description || null,
        fundingAmount: row.fundingAmount || null,
        fundingType: row.fundingType || null,
        fundingMin: normalizeNumber(row.fundingMin),
        fundingMax: normalizeNumber(row.fundingMax),
        centralOrState: row.centralOrState || 'State',
        interestRate: row.interestRate ? Number(row.interestRate) : null,
        subsidyPercent: row.subsidyPercent ? Number(row.subsidyPercent) : null,
        sector: row.sector || null,
        subSector: row.subSector || null,
        eligibility: row.eligibility || null,
        eligibilityJson: row.eligibilityJson ? JSON.stringify(row.eligibilityJson) : null,
        applyLink: row.applyLink || null,
        officialLink: row.officialLink || row.source || null,
        lastUpdated: row.lastUpdated ? new Date(row.lastUpdated) : new Date(),
        status: row.status || 'Active',
        verified: parseBoolean(row.verified),
        popularityScore: normalizeNumber(row.popularityScore) || 0,
        tags: row.tags || null,
      };
    })
    .filter(Boolean);

  if (!data.length) return;
  const chunkSize = 100;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await prisma.stateFundingScheme.createMany({
      data: chunk,
    });
  }
  console.log(`Inserted ${data.length} state funding schemes.`);
}

async function main() {
  const csvPath = path.join(process.cwd(), 'prisma', 'seeds', 'stateFunding.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(
      `stateFunding.csv not found at ${csvPath}. Create the file using the provided template before running the seed.`
    );
  }

  const rows = loadCsvRows(csvPath);
  if (!rows.length) {
    console.warn('CSV contained no rows. Nothing to seed.');
    return;
  }

  const stateIds = await seedStates(rows);
  await seedSchemes(rows, stateIds);
  console.log(`Seeded ${stateIds.size} states from CSV.`);
}

main()
  .catch(error => {
    console.error('State funding seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


