/*
 * Generate PNG thumbnails for PDFs in PitchDeck table (first page)
 * Saves to public/uploads/thumbnails and updates PitchDeck.thumbnail
 * Run: node scripts/generatePdfThumbnails.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// pdfjs-dist will be required lazily inside render function; if unavailable we fallback to placeholder
// Node canvas via @napi-rs/canvas (pulled in by pdfjs-dist dependency)
const { createCanvas } = require('@napi-rs/canvas');

const prisma = new PrismaClient();

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  }
}

async function renderFirstPageToPNG(pdfPath, outPath, scale = 1.5) {
  let pdfjsLib;
  try {
    pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  } catch (e1) {
    try {
      pdfjsLib = require('pdfjs-dist/legacy/build/pdf.cjs');
    } catch (e2) {
      try {
        pdfjsLib = require('pdfjs-dist/build/pdf.js');
      } catch (e3) {
        throw new Error('pdfjs-dist not available');
      }
    }
  }

  try {
    if (pdfjsLib.GlobalWorkerOptions) {
      // Run fully in-process in Node
      pdfjsLib.GlobalWorkerOptions.workerSrc = undefined;
    }
  } catch {}

  const loadingTask = pdfjsLib.getDocument({ url: pdfPath, disableWorker: true });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale });
  const canvasFactory = new NodeCanvasFactory();
  const { canvas, context } = canvasFactory.create(viewport.width, viewport.height);
  const renderContext = {
    canvasContext: context,
    viewport,
    canvasFactory,
  };
  await page.render(renderContext).promise;

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
}

function generatePlaceholderPNG(outPath, title, width = 900, height = 640) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  // Background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, width, height);
  // Accent bar
  ctx.fillStyle = '#0066cc';
  ctx.fillRect(0, 0, width, 8);
  // Title text
  ctx.fillStyle = '#111';
  ctx.font = 'bold 36px "Helvetica Neue", Arial';
  const lines = breakLines(ctx, title || 'PDF', width - 80);
  let y = 120;
  lines.forEach(l => {
    ctx.fillText(l, 40, y);
    y += 48;
  });
  // Footer
  ctx.fillStyle = '#666';
  ctx.font = '20px Arial';
  ctx.fillText('Preview not available • Generated thumbnail', 40, height - 40);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
}

function breakLines(ctx, text, maxWidth) {
  const words = (text || '').split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 5);
}

async function main() {
  const outDir = path.join(__dirname, '../public/uploads/thumbnails');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const decks = await prisma.pitchDeck.findMany();
  let done = 0;
  let skipped = 0;
  let errors = 0;

  for (const deck of decks) {
    try {
      const pdfUrl = deck.fileUrl; // e.g., /uploads/PDF/SEED/01.pdf
      if (!pdfUrl || !pdfUrl.toLowerCase().endsWith('.pdf')) {
        skipped++;
        continue;
      }
      const pdfPath = path.join(__dirname, '../public' + pdfUrl);
      if (!fs.existsSync(pdfPath)) {
        console.warn('⚠️  Missing PDF file:', pdfPath);
        skipped++;
        continue;
      }

      const baseName = path
        .basename(pdfUrl)
        .replace(/\.pdf$/i, '')
        .replace(/[^a-z0-9_-]+/gi, '_');
      const outName = `${baseName}.png`;
      const outPath = path.join(outDir, outName);
      const publicOut = `/uploads/thumbnails/${outName}`;

      if (deck.thumbnail && fs.existsSync(path.join(__dirname, '../public' + deck.thumbnail))) {
        skipped++;
        continue;
      }

      try {
        await renderFirstPageToPNG(pdfPath, outPath, 1.6);
      } catch (e) {
        console.warn('   ⚠️  Falling back to placeholder thumbnail for', pdfUrl);
        generatePlaceholderPNG(outPath, deck.title);
      }
      await prisma.pitchDeck.update({ where: { id: deck.id }, data: { thumbnail: publicOut } });
      console.log('✅ Thumbnail:', publicOut);
      done++;
    } catch (e) {
      console.error('❌ Error generating thumbnail for deck', deck.id, e.message);
      errors++;
    }
  }

  console.log('\nSummary:');
  console.log('Generated:', done);
  console.log('Skipped:', skipped);
  console.log('Errors:', errors);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


