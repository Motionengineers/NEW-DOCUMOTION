/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

function parseCityState(location) {
  // Attempts to extract (City) from strings like "India (Mumbai)" or plain "Mumbai, Maharashtra"
  if (!location) return { city: null, state: null };
  const m = String(location).match(/\(([^)]+)\)/);
  if (m) return { city: m[1], state: null };
  const parts = String(location)
    .split(',')
    .map(s => s.trim());
  if (parts.length >= 2) return { city: parts[0], state: parts[1] };
  return { city: parts[0] || null, state: null };
}

const input = [
  {
    type: 'agency',
    name: 'Ogilvy India',
    location: 'India (Mumbai)',
    services: 'Full-service advertising, creative, brand strategy',
    instagram: '',
    website: 'https://www.ogilvy.com',
    notes: 'Known for creative storytelling; clients include Cadbury and Vodafone',
  },
  {
    type: 'agency',
    name: 'DDB Mudra Group',
    location: 'India',
    services: 'Integrated marketing, media, brand strategy',
    instagram: '',
    website: 'https://ddbmudragroup.com',
    notes: 'Part of Omnicom; clients include Volkswagen, Johnson & Johnson',
  },
  {
    type: 'agency',
    name: 'McCann Worldgroup India',
    location: 'India',
    services: 'Full-service advertising, brand communication',
    instagram: '',
    website: 'https://mccannworldgroup.com',
    notes: 'Known for emotive, impactful campaigns; Coca-Cola, Mastercard',
  },
  {
    type: 'agency',
    name: 'Leo Burnett India',
    location: 'India',
    services: 'Creative storytelling, integrated campaigns',
    instagram: '',
    website: 'https://leoburnett.co.in',
    notes: "Part of Publicis Groupe; clients include McDonald's, HDFC Life",
  },
  {
    type: 'agency',
    name: 'MullenLowe Lintas Group',
    location: 'India',
    services: 'Brand building, integrated advertising',
    instagram: '',
    website: 'https://mullenlowelintas.in',
    notes: 'Known for Hindustan Unilever, Maruti Suzuki campaigns',
  },
  {
    type: 'agency',
    name: 'FCB Ulka',
    location: 'India',
    services: 'Strategic & insight-driven advertising',
    instagram: '',
    website: 'https://fcbulka.com',
    notes: 'Clients include Amul and Tata Motors',
  },
  {
    type: 'agency',
    name: 'Wunderman Thompson India',
    location: 'India',
    services: 'Traditional and digital advertising, data-driven marketing',
    instagram: '',
    website: 'https://www.wundermanthompson.com',
    notes: 'Blends traditional brand work with digital',
  },
  {
    type: 'agency',
    name: 'Grey Group India',
    location: 'India',
    services: 'Integrated advertising, media planning',
    instagram: '',
    website: 'https://grey.com',
    notes: 'Part of Grey global network',
  },
  {
    type: 'agency',
    name: 'Rediffusion',
    location: 'India',
    services: 'Full-service advertising',
    instagram: '',
    website: 'https://www.rediffusion.in',
    notes: 'Known for bold and effective campaigns',
  },
  {
    type: 'agency',
    name: 'Dentsu Creative India (Webchutney)',
    location: 'India',
    services: 'Digital-first creative, performance, media',
    instagram: '',
    website: 'https://www.dentsu.com',
    notes: 'Clients include Flipkart, Swiggy',
  },
  {
    type: 'agency',
    name: 'WATConsult',
    location: 'India',
    services: 'Digital marketing, social media',
    instagram: '',
    website: 'https://www.watconsult.com',
    notes: 'Works with Tata, Godrej',
  },
  {
    type: 'agency',
    name: 'Social Beat',
    location: 'India',
    services: 'Performance marketing, influencer work',
    instagram: '',
    website: 'https://www.socialbeat.in',
    notes: 'Digital-first performance agency',
  },
  {
    type: 'agency',
    name: 'FoxyMoron',
    location: 'India',
    services: 'Social media, content strategy, influencer',
    instagram: '',
    website: 'https://www.foxymoron.in',
    notes: 'Known for innovative digital campaigns',
  },
  {
    type: 'agency',
    name: 'Interactive Avenues',
    location: 'India',
    services: 'Performance, media, digital advertising',
    instagram: '',
    website: 'https://www.interactiveavenues.com',
    notes: 'Digital advertising + data-focused campaigns',
  },
];

async function main() {
  for (const a of input) {
    const slug = slugify(a.name);
    const { city, state } = parseCityState(a.location);
    const data = {
      name: a.name,
      slug,
      location: a.location || null,
      city,
      state,
      website: a.website || null,
      instagram: a.instagram || null,
      services: a.services || null,
      description: a.notes || null,
      rating: 4.5,
      minBudget: 50000,
      verified: true,
    };
    await prisma.agency.upsert({ where: { slug }, update: data, create: data });
    console.log('Upserted', a.name);
  }
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
