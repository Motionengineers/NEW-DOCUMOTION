/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

async function upsertAgency(a) {
  const name = String(a.name || '').trim();
  if (!name) return { status: 'skipped', reason: 'missing name' };

  let slug = slugify(a.slug || name);

  // Deduplicate by slug or name
  const existingBySlug = slug
    ? await prisma.agency.findUnique({ where: { slug } }).catch(() => null)
    : null;
  if (existingBySlug) return { status: 'exists', id: existingBySlug.id };

  const existingByName = await prisma.agency
    .findFirst({ where: { name: { equals: name, mode: 'insensitive' } } })
    .catch(() => null);
  if (existingByName) return { status: 'exists', id: existingByName.id };

  // Ensure unique slug if needed
  if (slug) {
    let suffix = 2;
    // eslint-disable-next-line no-constant-condition
    while (await prisma.agency.findUnique({ where: { slug } }).catch(() => null)) {
      slug = `${slug}-${suffix}`.slice(0, 80);
      suffix += 1;
    }
  }

  const city = (a.city || '').trim() || null;
  const state = (a.state || '').trim() || null;
  const location = a.location || [city, state].filter(Boolean).join(', ') || null;

  const data = {
    name,
    slug: slug || null,
    location,
    city,
    state,
    website: a.website || null,
    instagram: a.instagram || null,
    services: Array.isArray(a.services) ? a.services.join(', ') : a.services || null,
    description: a.description || null,
    rating: typeof a.rating === 'number' ? a.rating : a.rating ? parseFloat(a.rating) : 4.0,
    minBudget: a.minBudget ? Number(a.minBudget) : 5000,
    portfolio: null,
    verified: false,
    expertiseTags: a.source ? String(a.source) : null,
  };

  const created = await prisma.agency.create({ data });
  return { status: 'created', id: created.id };
}

async function run() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'agencies_semrush_superb.json');
    if (!fs.existsSync(filePath)) {
      console.error('Data file not found:', filePath);
      process.exit(1);
    }
    const raw = await fs.promises.readFile(filePath, 'utf8');
    const items = JSON.parse(raw);
    let created = 0;
    let exists = 0;
    let skipped = 0;

    for (const a of items) {
      try {
        const res = await upsertAgency(a);
        if (res.status === 'created') created += 1;
        else if (res.status === 'exists') exists += 1;
        else skipped += 1;
      } catch (err) {
        skipped += 1;
        console.warn('Skip agency due to error:', a.name, err.message);
      }
    }

    console.log(
      `Agencies — created: ${created}, existing: ${exists}, skipped: ${skipped}, total: ${items.length}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

run().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
