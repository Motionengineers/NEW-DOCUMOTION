/*
 * Seed: Namma Bengaluru Challenge '26
 * Run: node scripts/addNammaBengaluruChallenge.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const slug = 'namma-bengaluru-challenge-26';

  const data = {
    slug,
    title: "Namma Bengaluru Challenge ‘26",
    shortDesc:
      'City-scale climate resilience challenge for Bengaluru across construction, water & sanitation, air pollution and waste management.',
    longDesc: `
      <h3>Overview</h3>
      <p>By UnboxingBLR in partnership with Social Alpha and WTFund, supported by GoK & GBA. Identifies deployment-ready solutions to build resilience and mitigate emissions in Bengaluru.</p>
      <h3>Focus Areas</h3>
      <ul>
        <li><strong>Construction</strong>: Alt materials, C&D waste collection/sorting, improved recycled-material performance</li>
        <li><strong>Water & Sanitation</strong>: Drinking-water O&M/quality, stormwater & sewage (decentralised STPs), O&M mechanisation, lake O&M</li>
        <li><strong>Air Pollution</strong>: Low-cost, energy-efficient purification systems</li>
        <li><strong>Waste Management</strong>: Collection & upcycling, automated sorting, route optimisation, advanced recycling to high-value outputs</li>
      </ul>
      <h3>Benefits</h3>
      <ul>
        <li>Pilot grants up to ₹25 lakhs</li>
        <li>Market access & validation with city systems</li>
        <li>Showcase to govt, industry and civil society</li>
        <li>Access to seed capital up to ~₹1 crore (subject to due diligence)</li>
      </ul>
      <p>Source: <a href="https://www.socialalpha.org/namma-bengaluru-challenge-26/" target="_blank" rel="noopener">Social Alpha — NBC '26</a></p>
    `,
    thematicAreas: 'Construction, Water & Sanitation, Air Pollution, Waste Management',
    startAt: new Date('2025-10-06'),
    submissionDeadline: new Date('2025-11-08'),
    firstEvalAt: new Date('2025-11-15'),
    secondEvalAt: new Date('2025-12-05'),
    status: 'open',
    incentives:
      'Pilot grants up to ₹25L; market access & validation; showcase opportunities; access to seed capital up to ~₹1 Cr (subject to due diligence).',
    eligibilityJson: JSON.stringify(['Registered in India; 51% Indian owned', 'TRL6+ pilot/market-ready', 'Deployable in Bengaluru']),
    evaluationJson: JSON.stringify({ criteria: ['innovation', 'impact', 'scalability', 'team'] }),
  };

  const existing = await prisma.challenge.findUnique({ where: { slug } });
  if (existing) {
    console.log('Updating existing challenge:', slug);
    await prisma.challenge.update({ where: { slug }, data });
  } else {
    console.log('Creating challenge:', slug);
    await prisma.challenge.create({ data });
  }

  console.log('Done. View at /challenges/' + slug);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
