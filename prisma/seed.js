/* eslint-disable no-console */
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DATA_ROOT = path.join(process.cwd(), 'data');

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function loadBrandingDataset() {
  const datasetPath = path.join(DATA_ROOT, 'branding', 'agencies.json');
  try {
    const file = await fs.readFile(datasetPath, 'utf-8');
    const parsed = JSON.parse(file);
    if (!Array.isArray(parsed)) {
      throw new Error('agencies.json must export an array');
    }
    return parsed;
  } catch (error) {
    console.warn(
      '[seed] branding agencies dataset missing or invalid, falling back to defaults:',
      error.message
    );
    return [];
  }
}

async function seedAgencies() {
  const agencies = await loadBrandingDataset();

  if (agencies.length === 0) {
    console.log('No curated agencies dataset found. Skipping agency seed.');
    return;
  }

  for (const entry of agencies) {
    const {
      services: serviceDefinitions = [],
      portfolio: portfolioDefinitions = [],
      reviews: reviewDefinitions = [],
      categories,
      serviceBadges,
      servicesSummary,
      industries,
      ...agencyData
    } = entry;

    const slug = slugify(agencyData.slug ?? agencyData.name);
    const servicesBadgeList =
      serviceBadges ??
      servicesSummary ??
      agencyData.servicesSummary ??
      serviceDefinitions.map(s => s.badge || s.name).slice(0, 5);
    const industryList = Array.isArray(industries)
      ? industries
      : Array.isArray(agencyData.industries)
        ? agencyData.industries
        : agencyData.industries;
    const mergedCategories = Array.isArray(categories)
      ? categories
      : Array.isArray(agencyData.categories)
        ? agencyData.categories
        : typeof agencyData.categories === 'string'
          ? agencyData.categories
              .split(',')
              .map(str => str.trim())
              .filter(Boolean)
          : [];
    const reviewCount = reviewDefinitions.length;
    const calculatedRating =
      typeof agencyData.rating === 'number'
        ? agencyData.rating
        : reviewCount > 0
          ? reviewDefinitions.reduce((acc, review) => acc + (review.rating ?? 5), 0) / reviewCount
          : null;

    const baseData = {
      ...agencyData,
      slug,
      services:
        servicesBadgeList && servicesBadgeList.length ? JSON.stringify(servicesBadgeList) : null,
      serviceBadges:
        servicesBadgeList && servicesBadgeList.length ? servicesBadgeList.join(',') : null,
      categories: mergedCategories.length ? mergedCategories.join(',') : null,
      expertiseTags: Array.isArray(categories)
        ? categories.join(',')
        : (agencyData.expertiseTags ?? null),
      industries: Array.isArray(industryList) ? industryList.join(',') : (industryList ?? null),
      verifiedAt: agencyData.verifiedAt
        ? new Date(agencyData.verifiedAt)
        : (agencyData.verifiedAt ?? null),
      portfolio: portfolioDefinitions.length
        ? JSON.stringify(portfolioDefinitions)
        : (agencyData.portfolio ?? null),
      rating: calculatedRating ?? agencyData.rating ?? null,
      ratingCount: reviewCount,
      reviewCount,
      createdAt: undefined,
      updatedAt: undefined,
    };

    const agency = await prisma.agency.upsert({
      where: { slug },
      create: baseData,
      update: baseData,
    });

    await prisma.agencyService.deleteMany({ where: { agencyId: agency.id } });
    if (serviceDefinitions.length) {
      await prisma.agencyService.createMany({
        data: serviceDefinitions.map(service => ({
          agencyId: agency.id,
          name: service.name,
          category: service.category ?? null,
          description: service.description ?? null,
          deliveryType: service.deliveryType ?? null,
          minTimeline: service.minTimeline ?? null,
          maxTimeline: service.maxTimeline ?? null,
          startingPrice: service.startingPrice ?? null,
          currency: service.currency ?? baseData.currency ?? 'INR',
          isPrimary: Boolean(service.isPrimary),
        })),
      });
    }

    await prisma.agencyPortfolio.deleteMany({ where: { agencyId: agency.id } });
    if (portfolioDefinitions.length) {
      await prisma.agencyPortfolio.createMany({
        data: portfolioDefinitions.map(portfolioItem => ({
          agencyId: agency.id,
          title: portfolioItem.title,
          slug: portfolioItem.slug
            ? slugify(`${slug}-${portfolioItem.slug}`)
            : slugify(`${slug}-${portfolioItem.title}`),
          description: portfolioItem.description ?? null,
          mediaType: portfolioItem.mediaType ?? null,
          mediaUrl: portfolioItem.mediaUrl,
          thumbnailUrl: portfolioItem.thumbnailUrl ?? null,
          caseStudyUrl: portfolioItem.caseStudyUrl ?? null,
          clientName: portfolioItem.clientName ?? null,
          industry: Array.isArray(portfolioItem.industry)
            ? portfolioItem.industry.join(',')
            : (portfolioItem.industry ?? null),
          year: portfolioItem.year ?? null,
          tags: Array.isArray(portfolioItem.tags)
            ? portfolioItem.tags.join(',')
            : (portfolioItem.tags ?? null),
        })),
      });
    }

    await prisma.agencyReview.deleteMany({ where: { agencyId: agency.id } });
    if (reviewDefinitions.length) {
      await prisma.agencyReview.createMany({
        data: reviewDefinitions.map(review => ({
          agencyId: agency.id,
          authorName: review.authorName,
          authorRole: review.authorRole ?? null,
          company: review.company ?? null,
          projectType: review.projectType ?? null,
          rating: review.rating ?? 5,
          headline: review.headline ?? null,
          comment: review.comment ?? null,
          response: review.response ?? null,
          respondedAt: review.respondedAt ? new Date(review.respondedAt) : null,
          status: review.status ?? 'published',
          createdAt: review.createdAt ? new Date(review.createdAt) : undefined,
          updatedAt: review.updatedAt ? new Date(review.updatedAt) : undefined,
        })),
      });
    }
  }

  console.log(`Seeded ${agencies.length} agencies with services, portfolios, and reviews.`);
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
    {
      name: 'Working Capital Loan',
      min: 100000,
      max: 20000000,
      rate: '10-13%',
      tenure: '1-3 years',
    },
    {
      name: 'Equipment Finance',
      min: 200000,
      max: 5000000,
      rate: '9.5-11.5%',
      tenure: '2-5 years',
    },
    {
      name: 'Collateral-Free Loan',
      min: 100000,
      max: 2000000,
      rate: '10-12%',
      tenure: '1-5 years',
    },
    {
      name: 'Invoice Discounting',
      min: 50000,
      max: 5000000,
      rate: '11-14%',
      tenure: '90-180 days',
    },
    { name: 'Term Loan', min: 500000, max: 50000000, rate: '8.5-10.5%', tenure: '3-10 years' },
    {
      name: 'Overdraft Facility',
      min: 100000,
      max: 10000000,
      rate: '11-13%',
      tenure: 'Renewable annually',
    },
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
        eligibility:
          idx % 2 === 0
            ? 'DPIIT recognized startup or MSME registered'
            : 'Business operational for 1+ years, minimum turnover ₹10L',
        documentsRequired:
          'KYC documents, Business registration, Financial statements, Bank statements (6 months), ITR (2 years)',
        sectors: sectors[idx % sectors.length],
        states: states[idx % states.length],
        description: `${loan.name} from ${bank.name} designed for startups and MSMEs. Quick approval process with competitive rates.`,
        officialSource: bank.name,
        status: 'Active',
        collateral:
          idx % 4 === 0 ? 'Collateral required for loans above ₹25L' : 'Collateral-free up to ₹10L',
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
  const agencies = ['DPIIT', 'SIDBI', 'MSME', 'MeitY', 'MoHUA', 'MoEFCC', 'DST', 'BIRAC'];
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
  const skillKeys = [
    'javascript',
    'typescript',
    'react',
    'nodejs',
    'python',
    'django',
    'sql',
    'aws',
  ];
  for (const key of skillKeys) {
    await prisma.skill.upsert({
      where: { key },
      update: {},
      create: { key, label: key.replace(/\b\w/g, c => c.toUpperCase()) },
    });
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
    {
      title: 'Frontend Engineer',
      requirements: [
        { key: 'react', level: 3, weight: 4 },
        { key: 'javascript', level: 3, weight: 3 },
      ],
      rateMax: 2000,
      currency: 'INR',
      locationReq: 'remote',
    },
    {
      title: 'Backend Engineer',
      requirements: [
        { key: 'nodejs', level: 3, weight: 4 },
        { key: 'sql', level: 3, weight: 3 },
      ],
      rateMax: 2200,
      currency: 'INR',
      locationReq: 'remote',
    },
    {
      title: 'Fullstack JS',
      requirements: [
        { key: 'react', level: 3, weight: 3 },
        { key: 'nodejs', level: 3, weight: 3 },
      ],
      rateMax: 2500,
      currency: 'INR',
      locationReq: 'Bengaluru',
    },
    {
      title: 'Python Developer',
      requirements: [
        { key: 'python', level: 3, weight: 4 },
        { key: 'django', level: 3, weight: 3 },
      ],
      rateMax: 2100,
      currency: 'INR',
      locationReq: 'remote',
    },
    {
      title: 'Cloud Engineer',
      requirements: [
        { key: 'aws', level: 3, weight: 4 },
        { key: 'typescript', level: 2, weight: 2 },
      ],
      rateMax: 2600,
      currency: 'INR',
      locationReq: 'Mumbai',
    },
  ];
  for (const r of roles) {
    const created = await prisma.role.create({
      data: {
        title: r.title,
        rateMax: r.rateMax,
        currency: r.currency,
        locationReq: r.locationReq,
      },
    });
    for (const req of r.requirements) {
      const sk = await prisma.skill.findUnique({ where: { key: req.key } });
      if (sk) {
        await prisma.roleRequirement.create({
          data: { roleId: created.id, skillId: sk.id, level: req.level, weight: req.weight },
        });
      }
    }
  }
  console.log('Seeded talent MVP data: skills, 20 talent, 5 roles.');
}

async function seedBrandingPartners() {
  const dataset = await loadBrandingDataset();
  if (!dataset.length) {
    console.log('No curated branding dataset found for partners. Skipping verified partners seed.');
    return;
  }

  const curated = dataset.slice(0, 8).map(entry => ({
    name: entry.name,
    type: 'AGENCY',
    city: entry.city ?? entry.location ?? null,
    website: entry.website ?? null,
    portfolioUrl:
      (Array.isArray(entry.portfolio) && entry.portfolio.length > 0 && entry.portfolio[0].caseStudyUrl) ||
      entry.website ||
      null,
    contactEmail: entry.contactEmail ?? null,
    phone: entry.contactPhone ?? null,
    verified: Boolean(entry.verified ?? true),
    rating: entry.rating ?? 4.6,
    ratingCount: entry.reviewCount ?? 25,
  }));

  let created = 0;
  for (const partner of curated) {
    const existing = await prisma.brandingPartner.findFirst({
      where: { name: partner.name },
    });
    if (existing) {
      await prisma.brandingPartner.update({
        where: { id: existing.id },
        data: partner,
      });
    } else {
      await prisma.brandingPartner.create({ data: partner });
      created += 1;
    }
  }
  console.log(`Seeded ${curated.length} branding partners (${created} new) from agencies dataset.`);
}

async function main() {
  await seedAgencies();
  await seedPitchDecks();
  await seedBankSchemes();
  await seedGovtSchemes();
  await seedTalentMVP();
  await seedBrandingPartners();
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
