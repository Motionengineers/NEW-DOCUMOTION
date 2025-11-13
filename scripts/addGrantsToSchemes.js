/*
 * Map selected grants/programs into GovtScheme table under category 'Grant'
 * Run: node scripts/addGrantsToSchemes.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const grants = [
  {
    schemeName: 'NIDHI-SSP - Seed Support Program (via incubators)',
    ministry: 'DST / NIDHI',
    category: 'Grant',
    benefitType: 'Grant',
    benefits: 'Up to ₹50,00,000 (via incubators)',
    eligibility: 'Early-stage deep-tech startups; incubator selection',
    sectors: 'Deep-tech, Technology',
    applicationProcess: 'Apply via participating NIDHI incubators',
    officialLink: 'https://nidhi.dst.gov.in/',
    status: 'Active',
    description: 'Seed support to bridge the gap between development and commercialization.',
  },
  {
    schemeName: 'Startup India Seed Fund Scheme (SISFS)',
    ministry: 'DPIIT, Ministry of Commerce & Industry',
    category: 'Grant',
    benefitType: 'Grant',
    benefits: 'Up to ₹1 Cr via incubators (grants + debt)',
    eligibility: 'DPIIT-recognized startups; per SISFS guidelines',
    sectors: 'All',
    applicationProcess: 'Apply through SISFS-supported incubators on Startup India portal',
    officialLink: 'https://www.startupindia.gov.in/',
    status: 'Active',
    description:
      'Supports startups for proof of concept, prototype development, product trials, market entry and commercialization.',
  },
  {
    schemeName: 'Karnataka Elevate / Startup Karnataka Grants',
    ministry: 'Government of Karnataka',
    category: 'Grant',
    benefitType: 'Grant',
    benefits: 'State grants (varies by call)',
    eligibility: 'Startups as per Startup Karnataka policy',
    sectors: 'Various',
    applicationProcess: 'Apply via Startup Karnataka portal during active windows',
    officialLink: 'https://startupkarnataka.gov.in/',
    status: 'Active',
    description: 'State grant programs for Karnataka-based startups.',
  },
  {
    schemeName: 'Maharashtra State – Startup Assistance Programs',
    ministry: 'Maharashtra State Innovation Society / Govt of Maharashtra',
    category: 'Grant',
    benefitType: 'Grant',
    benefits: 'State assistance and grants (varies by program)',
    eligibility: 'As per state calls; registered in Maharashtra or as specified',
    sectors: 'Various',
    applicationProcess: 'Apply via state portal during active windows',
    officialLink: 'https://maharashtra.gov.in/',
    status: 'Active',
    description: 'State startup grants and assistance programs in Maharashtra.',
  },
];

async function upsertGrant(g) {
  const existing = await prisma.govtScheme.findUnique({ where: { schemeName: g.schemeName } });
  if (existing) {
    await prisma.govtScheme.update({ where: { schemeName: g.schemeName }, data: g });
  } else {
    await prisma.govtScheme.create({ data: g });
  }
}

async function main() {
  for (const g of grants) {
    await upsertGrant(g);
    console.log('Upserted grant into schemes:', g.schemeName);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
