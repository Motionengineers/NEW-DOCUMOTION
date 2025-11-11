/*
 * Bulk add challenge/grant listings from user's list
 * Run: node scripts/bulkAddChallenges.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const items = [
  {
    title: 'BIRAC - Biotechnology Ignition Grant (BIG) 25th Call',
    organization: 'BIRAC (DBT)',
    status: 'open',
    deadline: '2025-11-30T17:30:00+05:30',
    benefits: 'Up to ₹50,00,000',
    thematicAreas: 'Biotech, Agri-biotech',
    shortDesc: 'Proof-of-concept funding for early-stage biotech innovations.',
    source: 'https://birac.nic.in/big.php',
  },
  {
    title: 'ICMR/DHR - Fellowships for North Eastern Region (HRD)',
    organization: 'DHR / ICMR',
    status: 'open',
    deadline: '2025-11-03',
    benefits: 'Fellowship stipends (varies)',
    thematicAreas: 'Health, Clinical Research',
    shortDesc: 'Fellowships for researchers from the North Eastern Region.',
    source: 'https://schemes.dhr.gov.in/',
  },
  {
    title: 'DST - India–Sweden Collaborative Industrial R&D Programme (RFP)',
    organization: 'DST (India) / Vinnova (Sweden)',
    status: 'open',
    deadline: '2025-11-14',
    benefits: 'Project-dependent (often up to ₹1.5 Cr+)',
    thematicAreas: 'Industrial R&D, Consortia',
    shortDesc: 'Bilateral collaborative R&D projects with industry & academia.',
    source: 'https://dst.gov.in/call-for-proposals',
  },
  {
    title: 'NIDHI-SSP – Seed Support Program (via incubators)',
    organization: 'DST / NIDHI',
    status: 'open',
    deadline: '2025-11-30',
    benefits: 'Up to ₹50,00,000 (via incubators)',
    thematicAreas: 'Deep-tech, Tech startups',
    shortDesc: 'Seed support through NIDHI incubators for prototype/early stage.',
    source: 'https://nidhi.dst.gov.in/',
  },
  {
    title: 'MeitY – TIDE 2.0 / EIR (Maker Village)',
    organization: 'MeitY',
    status: 'open',
    deadline: '2025-11-25',
    benefits: 'Up to ₹4,00,000 (EIR support)',
    thematicAreas: 'Electronics, IoT, Deeptech',
    shortDesc: 'Entrepreneur-in-Residence and TIDE 2.0 support via partners.',
    source: 'https://www.meity.gov.in/',
  },
  {
    title: 'iCreate – Drone Challenge 2025',
    organization: 'iCreate',
    status: 'open',
    deadline: '2025-11-15',
    benefits: 'Prizes/grants up to ₹2 Cr',
    thematicAreas: 'Aerospace, UAV',
    shortDesc: 'National challenge for UAV and drone innovations.',
    source: 'https://icreate.org.in/',
  },
  {
    title: 'AgHub – Agri Sandbox Technology Validation Grant',
    organization: 'AgHub',
    status: 'open',
    deadline: '2025-11-15',
    benefits: 'Up to ₹20,00,000',
    thematicAreas: 'Agritech',
    shortDesc: 'Validation support for agritech prototypes in sandbox.',
    source: 'https://aghub.org/',
  },
  {
    title: 'Maha MedTech Mission – Concept Note Calls',
    organization: 'ANRF / ICMR / State Partners',
    status: 'open',
    deadline: '2025-11-07',
    benefits: 'Mission-scale funding (₹5 Cr+)',
    thematicAreas: 'MedTech',
    shortDesc: 'Concept notes for mission-scale medtech initiatives.',
    source: 'https://pib.gov.in/',
  },
  {
    title: 'Startup Ignition Grant – SSU Innovation Tech Foundation',
    organization: 'SSU Innovation',
    status: 'open',
    deadline: '2025-11-15',
    benefits: 'Up to ₹10,00,000',
    thematicAreas: 'Manufacturing, Deep-tech',
    shortDesc: 'Early-stage grants for product development.',
    source: 'https://www.startupgrantsindia.com/',
  },
  {
    title: 'NIDHI PRAYAS / Student Innovation Calls (incubators)',
    organization: 'DST / NIDHI',
    status: 'open',
    deadline: '2025-11-30',
    benefits: '₹1,00,000 – ₹5,00,000',
    thematicAreas: 'Student startups, Idea/Prototype',
    shortDesc: 'Prototype grants via PRAYAS & student calls at incubators.',
    source: 'https://nidhi.dst.gov.in/',
  },
  {
    title: 'MeitY – GENESIS Pilot Program',
    organization: 'MeitY / IIT partners',
    status: 'open',
    deadline: '2025-11-10',
    benefits: 'Up to ₹40,00,000',
    thematicAreas: 'Electronics, Software',
    shortDesc: 'Pilot funding for GENESIS program startups.',
    source: 'https://www.meity.gov.in/',
  },
];

async function upsertItem(i) {
  const slug = slugify(i.title);
  const data = {
    slug,
    title: i.title,
    shortDesc: i.shortDesc,
    longDesc: i.longDesc || null,
    thematicAreas: i.thematicAreas,
    startAt: new Date(),
    submissionDeadline: i.deadline ? new Date(i.deadline) : null,
    firstEvalAt: null,
    secondEvalAt: null,
    status: i.status || 'open',
    incentives: i.benefits,
    eligibilityJson: null,
    evaluationJson: null,
  };
  const existing = await prisma.challenge.findUnique({ where: { slug } });
  if (existing) {
    await prisma.challenge.update({ where: { slug }, data });
  } else {
    await prisma.challenge.create({ data });
  }
  return slug;
}

async function main() {
  for (const i of items) {
    const slug = await upsertItem(i);
    console.log('Upserted:', slug);
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


