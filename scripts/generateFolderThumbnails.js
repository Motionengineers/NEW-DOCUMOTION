// Generate in-folder thumbnails for PDFs: first page → JPG 1080x720
// Saves: thumbnail.jpg and <Derived_Title>_thumbnail.jpg in the same folder as the PDF

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
let pdfjsLib;
try {
  pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
} catch {}
let sharp = null;
try {
  sharp = require('sharp');
} catch {}

const ROOTS = [path.join(process.cwd(), 'public', 'pitch-decks'), '/data/pitch-decks'];

function listCandidateDirs() {
  const dirs = [];
  for (const root of ROOTS) {
    if (!fs.existsSync(root)) continue;
    // include root itself and its subdirs
    dirs.push(root);
    for (const name of fs.readdirSync(root)) {
      const p = path.join(root, name);
      if (fs.statSync(p).isDirectory()) dirs.push(p);
    }
  }
  return Array.from(new Set(dirs));
}

function deriveNameFromText(text, fallbackBase) {
  const base = fallbackBase.replace(/\.(pdf)$/i, '');
  if (!text) return base;
  const lines = text
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
  const top = lines.slice(0, 8);
  const title = top.find(l => !/^pitch\s*deck$/i.test(l)) || top[0] || base;
  return title
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);
}

async function renderFirstPageToPNG(absPdfPath) {
  if (!pdfjsLib) throw new Error('pdfjs-dist legacy build not available');
  const loadingTask = pdfjsLib.getDocument({ url: absPdfPath, disableWorker: true });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(1);
  // Higher scale for crisp text (3x for retina-quality)
  const viewport = page.getViewport({ scale: 3 });
  const Canvas = require('canvas');
  const canvas = Canvas.createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  // White background for better readability
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toBuffer('image/png');
}

async function firstPageText(absPdfPath) {
  try {
    const buf = fs.readFileSync(absPdfPath);
    const data = await pdf(buf);
    const text = data.text || '';
    return text.split('\f')[0] || text;
  } catch {
    return '';
  }
}

async function processPdf(absPdfPath) {
  const dir = path.dirname(absPdfPath);
  const fileName = path.basename(absPdfPath);
  const base = fileName.replace(/\.pdf$/i, '');
  const text = await firstPageText(absPdfPath);
  const derived = deriveNameFromText(text, fileName);

  // Render page 1 to PNG buffer
  const pngBuf = await renderFirstPageToPNG(absPdfPath);
  const targetW = Number(process.env.THUMBNAIL_WIDTH || 1600);
  const targetH = Number(process.env.THUMBNAIL_HEIGHT || 1000);
  // Convert to JPG with high quality, maintain aspect ratio, fit to contain for readability
  let jpgBuf = pngBuf;
  if (sharp) {
    jpgBuf = await sharp(pngBuf)
      .resize(targetW, targetH, {
        fit: 'inside', // Preserve aspect, fit within bounds (better for text readability)
        withoutEnlargement: false,
      })
      .jpeg({
        quality: 95, // Higher quality for crisp text
        mozjpeg: true,
        progressive: true, // Progressive JPEG for better loading
      })
      .toBuffer();
  }

  const thumb1 = path.join(dir, 'thumbnail.jpg');
  const thumb2 = path.join(dir, `${derived}_thumbnail.jpg`);
  fs.writeFileSync(thumb1, jpgBuf);
  fs.writeFileSync(thumb2, jpgBuf);
  return { thumb1, thumb2 };
}

async function run() {
  const dirs = listCandidateDirs();
  let made = 0,
    skipped = 0,
    errors = 0;
  for (const dir of dirs) {
    let pdfs = [];
    try {
      const items = fs.readdirSync(dir);
      pdfs = items.filter(f => f.toLowerCase().endsWith('.pdf') && !f.startsWith('._'));
    } catch {
      continue;
    }
    if (pdfs.length === 0) {
      skipped++;
      continue;
    }
    // pick main PDF (heuristic: name includes 'pitch' else first)
    const main = pdfs.find(f => /pitch/i.test(f)) || pdfs[0];
    const abs = path.join(dir, main);
    try {
      const out = await processPdf(abs);
      console.log('✓ Thumbnail(s):', out.thumb1);
      made++;
    } catch (e) {
      console.error('× Error:', abs, e.message);
      errors++;
    }
  }
  console.log('Result:', { made, skipped, errors });
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
