// Import PDFs from /data/pitch-decks/* into PitchDeck
// - Reads first-page text via pdf-parse (OCR hook in future)
// - Counts pages
// - Idempotent by fileUrl

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ROOT = '/data/pitch-decks';
const MAP = {
  'pre-seed': { stage: 'pre_seed', category: 'Pre-Seed' },
  seed: { stage: 'seed', category: 'Seed' },
  'series-a': { stage: 'series_a', category: 'Series A' },
  'yc-backed': { stage: 'yc', category: 'YC-backed' },
};

function safeStartupNameFromText(text, filenameBase) {
  if (!text) return filenameBase;
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  const head = lines.slice(0, 8);
  const candidate = head.find(l => !/^pitch\s*deck$/i.test(l)) || head[0];
  return (candidate || filenameBase || 'Untitled').slice(0, 120);
}

async function readPdf(absPath) {
  const buf = fs.readFileSync(absPath);
  const data = await pdf(buf);
  const fullText = data.text || '';
  const firstPageText = fullText.split('\f')[0] || fullText;
  const pages = data.numpages || undefined;
  return { firstPageText, pages };
}

async function upsertDeck({ title, companyName, stage, category, fileUrl, pages, textExtract }) {
  const existing = await prisma.pitchDeck.findFirst({ where: { fileUrl } });
  if (existing) return existing;
  return prisma.pitchDeck.create({
    data: {
      title,
      companyName,
      stage,
      category,
      source: 'data_folder',
      fileUrl,
      pages: pages || null,
      textExtract: textExtract || null,
      verified: false,
      description: `Pitch deck from ${category}`,
      tags: stage,
    },
  });
}

async function run() {
  if (!fs.existsSync(ROOT)) {
    console.error('Missing folder:', ROOT);
    process.exit(1);
  }
  const cats = Object.keys(MAP).filter(c => fs.existsSync(path.join(ROOT, c)));
  let created = 0;
  let skipped = 0;
  for (const c of cats) {
    const folder = path.join(ROOT, c);
    const files = fs
      .readdirSync(folder)
      .filter(f => f.toLowerCase().endsWith('.pdf') && !f.startsWith('._'));
    for (const file of files) {
      try {
        const abs = path.join(folder, file);
        const fileUrl = `/pitch-decks/${c}/${file}`; // served from public if mirrored; else used as logical path
        const filenameBase = path.parse(file).name.replace(/[_-]+/g, ' ');
        const { firstPageText, pages } = await readPdf(abs);
        const startupName = safeStartupNameFromText(firstPageText, filenameBase);
        const title = `${startupName} Pitch Deck`;
        await upsertDeck({
          title,
          companyName: startupName,
          stage: MAP[c].stage,
          category: MAP[c].category,
          fileUrl,
          pages,
          textExtract: firstPageText.slice(0, 5000),
        });
        created++;
        console.log('Imported:', fileUrl);
      } catch (e) {
        console.error('Error importing', file, e.message);
      }
    }
  }
  console.log('Done. Created:', created, 'Skipped:', skipped);
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
