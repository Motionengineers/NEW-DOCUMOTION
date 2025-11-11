// Server-side generator: first-page thumbnail + OCR text for PitchDecks without thumbnails
// Tries Puppeteer+Sharp+Tesseract; falls back gracefully if deps unavailable

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

let puppeteer = null;
let sharp = null;
let Tesseract = null;
try { puppeteer = require('puppeteer'); } catch {}
try { sharp = require('sharp'); } catch {}
try { Tesseract = require('tesseract.js'); } catch {}

const prisma = new PrismaClient();

async function renderPdfFirstPageToPng(pdfAbsPath, outAbsPath, width = Number(process.env.THUMBNAIL_WIDTH || 1200)) {
  if (!puppeteer) throw new Error('puppeteer not installed');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  // Use built-in PDF viewer to render; navigate to file:// URL
  await page.goto('file://' + pdfAbsPath, { waitUntil: 'networkidle0' });
  // Try to locate first page canvas; pdf viewer uses embed; fallback to full page screenshot
  const clip = await page.evaluate(() => {
    const el = document.querySelector('embed, iframe, canvas');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.max(1, r.width), height: Math.max(1, r.height) };
  });
  const buf = await page.screenshot({ clip: clip || undefined, fullPage: !clip });
  await browser.close();
  if (sharp) {
    const img = sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 85 });
    const finalBuf = await img.toBuffer();
    fs.writeFileSync(outAbsPath, finalBuf);
  } else {
    fs.writeFileSync(outAbsPath, buf);
  }
}

async function ocrPng(absPath) {
  if (!Tesseract) return '';
  const { data } = await Tesseract.recognize(absPath, 'eng');
  return data && data.text ? data.text : '';
}

function deriveName(text, fallback) {
  if (!text) return fallback;
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  const top = lines.slice(0, 10);
  const candidate = top.find(l => !/^pitch\s*deck$/i.test(l)) || top[0];
  return (candidate || fallback).slice(0, 120);
}

async function run() {
  const outDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const decks = await prisma.pitchDeck.findMany({ where: { OR: [{ thumbnail: null }, { thumbnail: '' }] } });
  let done = 0, skipped = 0, errors = 0;
  for (const d of decks) {
    try {
      if (!d.fileUrl || d.fileUrl.startsWith('http')) { skipped++; continue; }
      // fileUrl could be /pitch-decks/... or /uploads/PDF/...
      const pdfAbs = path.join(process.cwd(), 'public', d.fileUrl.replace(/^\//, ''));
      if (!fs.existsSync(pdfAbs)) { skipped++; continue; }
      const base = path.parse(pdfAbs).name.replace(/[^a-z0-9_-]+/gi, '_');
      const outName = `${base}.webp`;
      const outAbs = path.join(outDir, outName);
      await renderPdfFirstPageToPng(pdfAbs, outAbs);
      const text = await ocrPng(outAbs);
      const startupName = deriveName(text, d.companyName || d.title || 'Pitch Deck');
      const rel = `/uploads/thumbnails/${outName}`;
      await prisma.pitchDeck.update({ where: { id: d.id }, data: { thumbnail: rel, textExtract: text || d.textExtract || null, companyName: startupName } });
      console.log('Processed:', d.id, rel);
      done++;
    } catch (e) {
      console.error('Error processing deck', d.id, e.message);
      errors++;
    }
  }
  console.log('Summary:', { done, skipped, errors });
}

run()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


