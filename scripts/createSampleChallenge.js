/**
 * Create a sample Challenge for testing
 * Run: node scripts/createSampleChallenge.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Creating sample challenge...');

  const sampleChallenge = {
    slug: 'flipkart-sustainability-textiles-2024',
    title: 'Flipkart Sustainability Startup Challenge: Textiles & Fashion',
    shortDesc:
      'Building sustainable fashion solutions for Bharat. Win funding, mentorship, and PoC opportunities.',
    longDesc: `
      <h3>About This Challenge</h3>
      <p>The Flipkart Sustainability Startup Challenge aims to support innovative startups developing sustainable solutions for the textile and fashion industry in India.</p>
      
      <h3>Problem Statement</h3>
      <p>India's textile industry is one of the largest contributors to water pollution and waste. We're looking for startups that can:</p>
      <ul>
        <li>Reduce textile waste through recycling and upcycling</li>
        <li>Develop sustainable fabric alternatives</li>
        <li>Optimize supply chains for carbon efficiency</li>
        <li>Create circular economy solutions</li>
      </ul>
      
      <h3>What We Offer</h3>
      <p>Selected startups will receive:</p>
      <ul>
        <li><strong>Funding:</strong> Up to ₹50 lakh seed funding</li>
        <li><strong>Mentorship:</strong> Access to Flipkart leadership team</li>
        <li><strong>PoC Opportunity:</strong> Pilot your solution with Flipkart</li>
        <li><strong>Network:</strong> Connect with 100+ industry experts</li>
      </ul>
    `,
    thematicAreas: 'Sustainability, Textiles, Recycling, Circular Economy, Fashion Tech',
    startAt: new Date('2024-11-01'),
    submissionDeadline: new Date('2025-01-31'),
    firstEvalAt: new Date('2025-02-15'),
    secondEvalAt: new Date('2025-03-01'),
    status: 'open',
    incentives: 'Seed funding up to ₹50 lakh, mentorship, PoC opportunity, industry network access',
    eligibilityJson: JSON.stringify([
      'Registered entity in India (or ready to register)',
      'Working prototype or MVP ready',
      'Target market in textiles, fashion, or sustainable supply chains',
      'Team size minimum 2 people',
      'Commitment to build and scale in India',
    ]),
    evaluationJson: JSON.stringify({
      criteria: [
        {
          id: 'innovation',
          label: 'Innovation & Technical Soundness',
          weight: 0.2,
          scale: 10,
        },
        {
          id: 'impact',
          label: 'Impact Potential',
          weight: 0.3,
          scale: 10,
        },
        {
          id: 'scalability',
          label: 'Scalability & Business Viability',
          weight: 0.3,
          scale: 10,
        },
        {
          id: 'team',
          label: 'Team Capability',
          weight: 0.2,
          scale: 10,
        },
      ],
      tie_break: ['impact', 'scalability', 'innovation'],
      min_reviewers: 3,
    }),
  };

  try {
    // Check if challenge already exists
    const existing = await prisma.challenge.findUnique({
      where: { slug: sampleChallenge.slug },
    });

    if (existing) {
      console.log('⚠️  Challenge already exists. Deleting and recreating...');
      await prisma.challenge.delete({ where: { slug: sampleChallenge.slug } });
    }

    const challenge = await prisma.challenge.create({
      data: sampleChallenge,
    });

    console.log('✅ Challenge created successfully!');
    console.log(`   ID: ${challenge.id}`);
    console.log(`   Title: ${challenge.title}`);
    console.log(`   Slug: ${challenge.slug}`);
    console.log(`   Status: ${challenge.status}`);
    console.log(`   Deadline: ${challenge.submissionDeadline.toLocaleDateString()}`);
    console.log('\n🌐 View at: http://localhost:3000/challenges/' + challenge.slug);
  } catch (error) {
    console.error('❌ Error creating challenge:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
