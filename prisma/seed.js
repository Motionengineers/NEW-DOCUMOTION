/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedAgencies() {
  const servicesPool = ['branding', 'video', 'ads', 'photography', 'web'];
  const cities = [
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Delhi', state: 'Delhi' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Chennai', state: 'Tamil Nadu' },
  ];
  const agencies = Array.from({ length: 20 }).map((_, i) => {
    const name = `Creative Agency ${i + 1}`;
    const loc = cities[i % cities.length];
    const services = [
      servicesPool[i % servicesPool.length],
      servicesPool[(i + 2) % servicesPool.length],
    ];
    const portfolio = [
      { title: `Project ${i + 1}A`, coverUrl: '/placeholder.png', year: 2023 },
      { title: `Project ${i + 1}B`, coverUrl: '/placeholder.png', year: 2024 },
    ];
    return {
      name,
      slug: slugify(name),
      location: `${loc.city}, ${loc.state}`,
      city: loc.city,
      state: loc.state,
      website: 'https://example.com',
      instagram: 'https://instagram.com/example',
      services: JSON.stringify(services),
      description: 'Full-service creative agency for startups.',
      rating: 4 + Math.random() * 1,
      minBudget: 5000 + (i % 5) * 10000,
      portfolio: JSON.stringify(portfolio),
      verified: i % 3 === 0,
    };
  });
  for (const a of agencies) {
    await prisma.agency.upsert({ where: { slug: a.slug }, create: a, update: a });
  }
  console.log('Seeded agencies.');
}

async function seedPitchDecks() {
  // Map real PDFs under public/uploads/PDF to seed entries
  const seedFiles = [
    '/uploads/PDF/SEED/01.pdf',
    '/uploads/PDF/SEED/02.pdf',
    '/uploads/PDF/SEED/03.pdf',
    '/uploads/PDF/SEED/04.pdf',
    '/uploads/PDF/SEED/05.pdf',
    '/uploads/PDF/PRE_SEED/01.pdf',
    '/uploads/PDF/PRE_SEED/02.pdf',
    '/uploads/PDF/PRE_SEED/03.pdf',
    '/uploads/PDF/PRE_SEED/04.pdf',
    '/uploads/PDF/PRE_SEED/05.pdf',
  ];
  const stages = [
    'seed',
    'seed',
    'seed',
    'seed',
    'seed',
    'pre_seed',
    'pre_seed',
    'pre_seed',
    'pre_seed',
    'pre_seed',
  ];
  const decks = seedFiles.map((fileUrl, i) => ({
    title: `Deck ${i + 1}`,
    companyName: `Startup ${i + 1}`,
    stage: stages[i],
    category: 'SaaS',
    industry: 'Software',
    source: 'local',
    fileUrl,
    thumbnail: null,
    year: 2024,
    description: 'Sample deck.',
    tags: 'sample,deck',
  }));
  for (const d of decks) {
    await prisma.pitchDeck.upsert({
      where: { id: 0 }, // force create via createMany-like behavior
      update: {},
      create: d,
    });
  }
  console.log('Seeded pitch decks.');
}

async function seedBankSchemes() {
  const banks = [
    { name: 'SBI', type: 'government' },
    { name: 'HDFC Bank', type: 'private' },
    { name: 'ICICI Bank', type: 'private' },
    { name: 'Axis Bank', type: 'private' },
    { name: 'Kotak Mahindra Bank', type: 'private' },
    { name: 'Union Bank', type: 'government' },
    { name: 'Canara Bank', type: 'government' },
    { name: 'Punjab National Bank', type: 'government' },
    { name: 'Bank of Baroda', type: 'government' },
    { name: 'SIDBI', type: 'government' },
  ];

  const loanTypes = [
    { name: 'Startup Loan', min: 100000, max: 5000000, rate: '8.5-11%', tenure: '1-5 years' },
    { name: 'MSME Business Loan', min: 50000, max: 10000000, rate: '9-12%', tenure: '1-7 years' },
    { name: 'Working Capital Loan', min: 100000, max: 20000000, rate: '10-13%', tenure: '1-3 years' },
    { name: 'Equipment Finance', min: 200000, max: 5000000, rate: '9.5-11.5%', tenure: '2-5 years' },
    { name: 'Collateral-Free Loan', min: 100000, max: 2000000, rate: '10-12%', tenure: '1-5 years' },
    { name: 'Invoice Discounting', min: 50000, max: 5000000, rate: '11-14%', tenure: '90-180 days' },
    { name: 'Term Loan', min: 500000, max: 50000000, rate: '8.5-10.5%', tenure: '3-10 years' },
    { name: 'Overdraft Facility', min: 100000, max: 10000000, rate: '11-13%', tenure: 'Renewable annually' },
  ];

  const sectors = [
    'SaaS,FinTech,EdTech',
    'Manufacturing,Industrial',
    'Healthcare,MedTech',
    'E-commerce,Retail',
    'AgriTech,Food Processing',
    'CleanTech,Energy',
    'All sectors',
  ];

  const states = [
    'All states',
    'Karnataka,Maharashtra,Delhi',
    'Tamil Nadu,Telangana,Gujarat',
    'Punjab,Haryana,Rajasthan',
    'West Bengal,Odisha,Assam',
  ];

  const entries = [];
  banks.forEach((bank, bankIdx) => {
    loanTypes.forEach((loan, loanIdx) => {
      const idx = bankIdx * loanTypes.length + loanIdx;
      entries.push({
        bankName: bank.name,
        schemeName: `${bank.name} ${loan.name}`,
        type: bank.type,
        minLoanAmount: loan.min,
        maxLoanAmount: loan.max,
        interestRate: loan.rate,
        tenure: loan.tenure,
        processingFees: idx % 3 === 0 ? '0.5%' : idx % 3 === 1 ? '1%' : '1.5%',
        eligibility: idx % 2 === 0 
          ? 'DPIIT recognized startup or MSME registered' 
          : 'Business operational for 1+ years, minimum turnover ₹10L',
        documentsRequired: 'KYC documents, Business registration, Financial statements, Bank statements (6 months), ITR (2 years)',
        sectors: sectors[idx % sectors.length],
        states: states[idx % states.length],
        description: `${loan.name} from ${bank.name} designed for startups and MSMEs. Quick approval process with competitive rates.`,
        officialSource: bank.name,
        status: 'Active',
        collateral: idx % 4 === 0 ? 'Collateral required for loans above ₹25L' : 'Collateral-free up to ₹10L',
        industry: idx % 2 === 0 ? 'Startup' : 'MSME',
      });
    });
  });

  // Add some additional specialized products
  const specialized = [
    {
      bankName: 'SIDBI',
      schemeName: 'SIDBI Startup Assistance',
      type: 'government',
      minLoanAmount: 1000000,
      maxLoanAmount: 50000000,
      interestRate: '8-9.5%',
      tenure: '3-7 years',
      processingFees: '0.25%',
      eligibility: 'DPIIT recognized startups, minimum 2 years operations',
      documentsRequired: 'DPIIT certificate, Business plan, Financial projections, KYC',
      sectors: 'All sectors',
      states: 'All states',
      description: 'Specialized funding for DPIIT recognized startups with favorable terms.',
      officialSource: 'SIDBI',
      status: 'Active',
    },
    {
      bankName: 'HDFC Bank',
      schemeName: 'HDFC SmartUp',
      type: 'private',
      minLoanAmount: 50000,
      maxLoanAmount: 5000000,
      interestRate: '9.5-11%',
      tenure: '1-5 years',
      processingFees: '1%',
      eligibility: 'Startups and new businesses, minimum 6 months operations',
      documentsRequired: 'Business registration, Bank statements, KYC',
      sectors: 'SaaS,FinTech,EdTech,E-commerce',
      states: 'All states',
      description: 'Quick digital loan for startups with minimal documentation.',
      officialSource: 'HDFC Bank',
      status: 'Active',
    },
  ];

  entries.push(...specialized);

  // Clear existing and insert fresh
  await prisma.bankScheme.deleteMany({});
  for (const e of entries) {
    await prisma.bankScheme.create({ data: e });
  }
  console.log(`Seeded ${entries.length} bank schemes.`);
}

async function seedGovtSchemes() {
  const agencies = [
    'DPIIT',
    'SIDBI',
    'MSME',
    'MeitY',
    'MoHUA',
    'MoEFCC',
    'DST',
    'BIRAC',
  ];
  const statuses = ['Active', 'Updated'];
  const benefits = [
    'Collateral-free loan up to ₹10L',
    'Interest subvention 2% for 12 months',
    'Capital subsidy 15% (ceiling applies)',
    'Grant support up to ₹50L',
    'Incubation + mentorship + pilot access',
  ];

  const entries = Array.from({ length: 50 }).map((_, i) => {
    const agency = agencies[i % agencies.length];
    const title = `${agency} Initiative ${i + 1}`;
    const max = 500000 * ((i % 10) + 2); // 10L to ~60L
    const min = Math.floor(max * 0.1);
    return {
      schemeName: title,
      ministry: null,
      department: agency,
      category: i % 3 === 0 ? 'Grant' : i % 3 === 1 ? 'Loan' : 'Guarantee',
      benefitType: i % 3 === 0 ? 'grant' : i % 3 === 1 ? 'loan' : 'guarantee',
      benefits: benefits[i % benefits.length],
      maxAssistance: `${Math.round(max / 100000)}L`,
      amountRange: `${Math.round(min / 100000)}L - ${Math.round(max / 100000)}L`,
      eligibility: 'Startups/MSME; specific sectors preferred',
      sectors: i % 2 === 0 ? 'SaaS,Manufacturing' : 'Healthcare,Climate',
      region: i % 4 === 0 ? 'National' : 'State',
      applicationProcess: 'Online via official portal',
      officialLink: null,
      applicationLink: null,
      status: statuses[i % statuses.length],
      description: 'Curated sample scheme for development/testing.',
      criteria: 'Basic KYC; turnover band varies',
      deadline: null,
      source: agency,
    };
  });

  // Clear existing and insert fresh to avoid duplicates
  await prisma.govtScheme.deleteMany({});
  for (const e of entries) {
    await prisma.govtScheme.create({ data: e });
  }
  console.log(`Seeded ${entries.length} govt schemes.`);
}

async function seedTalentMVP() {
  // Seed skills taxonomy
  const skillKeys = ['javascript', 'typescript', 'react', 'nodejs', 'python', 'django', 'sql', 'aws'];
  for (const key of skillKeys) {
    await prisma.skill.upsert({ where: { key }, update: {}, create: { key, label: key.replace(/\b\w/g, c => c.toUpperCase()) } });
  }

  // Seed 20 talent
  for (let i = 1; i <= 20; i++) {
    const fullName = `Talent User ${i}`;
    const email = `talent${i}@example.com`;
    const talent = await prisma.talent.upsert({
      where: { email },
      update: {},
      create: {
        fullName,
        email,
        location: i % 2 === 0 ? 'Bengaluru' : 'Mumbai',
        timezone: 'IST',
        bio: 'Experienced professional available for projects.',
        industry: i % 2 === 0 ? 'SaaS' : 'FinTech',
        yearsExp: (i % 10) + 1,
        rateHourly: 1000 + (i % 10) * 200,
        currency: 'INR',
      },
    });
    const attach = [skillKeys[i % skillKeys.length], skillKeys[(i + 2) % skillKeys.length]];
    for (const key of attach) {
      const sk = await prisma.skill.findUnique({ where: { key } });
      if (sk) {
        await prisma.talentSkill.upsert({
          where: { talentId_skillId: { talentId: talent.id, skillId: sk.id } },
          update: { level: 3 },
          create: { talentId: talent.id, skillId: sk.id, level: 3 },
        });
      }
    }
  }

  // Seed 5 roles
  const roles = [
    { title: 'Frontend Engineer', requirements: [{ key: 'react', level: 3, weight: 4 }, { key: 'javascript', level: 3, weight: 3 }], rateMax: 2000, currency: 'INR', locationReq: 'remote' },
    { title: 'Backend Engineer', requirements: [{ key: 'nodejs', level: 3, weight: 4 }, { key: 'sql', level: 3, weight: 3 }], rateMax: 2200, currency: 'INR', locationReq: 'remote' },
    { title: 'Fullstack JS', requirements: [{ key: 'react', level: 3, weight: 3 }, { key: 'nodejs', level: 3, weight: 3 }], rateMax: 2500, currency: 'INR', locationReq: 'Bengaluru' },
    { title: 'Python Developer', requirements: [{ key: 'python', level: 3, weight: 4 }, { key: 'django', level: 3, weight: 3 }], rateMax: 2100, currency: 'INR', locationReq: 'remote' },
    { title: 'Cloud Engineer', requirements: [{ key: 'aws', level: 3, weight: 4 }, { key: 'typescript', level: 2, weight: 2 }], rateMax: 2600, currency: 'INR', locationReq: 'Mumbai' },
  ];
  for (const r of roles) {
    const created = await prisma.role.create({ data: { title: r.title, rateMax: r.rateMax, currency: r.currency, locationReq: r.locationReq } });
    for (const req of r.requirements) {
      const sk = await prisma.skill.findUnique({ where: { key: req.key } });
      if (sk) {
        await prisma.roleRequirement.create({ data: { roleId: created.id, skillId: sk.id, level: req.level, weight: req.weight } });
      }
    }
  }
  console.log('Seeded talent MVP data: skills, 20 talent, 5 roles.');
}

async function main() {
  await seedAgencies();
  await seedPitchDecks();
  await seedBankSchemes();
  await seedGovtSchemes();
  await seedTalentMVP();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
