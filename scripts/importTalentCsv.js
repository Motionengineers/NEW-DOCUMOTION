/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INPUT = process.env.TALENT_CSV || path.resolve('data/google_sheets_founders_1.csv');
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 500);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function splitName(full) {
  if (!full) return { first: 'Unknown', last: '' };
  const parts = String(full).trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

function handleFromLinkedIn(url) {
  try {
    if (!url) return null;
    const u = new URL(url);
    const segs = u.pathname.split('/').filter(Boolean);
    const handle = segs[segs.length - 1];
    return handle?.toLowerCase() || null;
  } catch {
    return null;
  }
}

function cleanLinkedInUrl(url) {
  if (!url) return null;
  const s = String(url).trim();
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.includes('linkedin.com')) return `https://${s.replace(/^https?:\/\//, '')}`;
  return null;
}

function estimateExpYears(title = '') {
  const t = title.toLowerCase();
  if (/(chief|cmo|cto|ceo|founder|co-founder|cofounder|head|vp)/.test(t)) return 12;
  if (/(senior|lead|manager)/.test(t)) return 7;
  if (/(intern|junior|assistant)/.test(t)) return 1;
  return 4;
}

function inferSkills(title = '') {
  const t = title.toLowerCase();
  const set = new Set();
  if (/(ceo|founder|co-founder|cofounder|director|vp|head)/.test(t)) { set.add('leadership'); set.add('strategy'); set.add('operations'); }
  if (/(cmo|marketing|growth|brand)/.test(t)) { set.add('marketing'); set.add('branding'); set.add('go-to-market'); }
  if (/(cto|engineering|tech|developer|software|product)/.test(t)) { set.add('engineering'); set.add('product'); set.add('cloud'); }
  return Array.from(set);
}

async function upsertSkill(tx, key) {
  const norm = key.toLowerCase().trim().replace(/\s+/g, '-');
  return tx.skill.upsert({ where: { key: norm }, update: {}, create: { key: norm, label: key } });
}

async function processBatch(rows) {
  return prisma.$transaction(async tx => {
    let inserted = 0, updated = 0;
    for (const r of rows) {
      const name = r.Name || r["Full Name"] || r["First Name"] || '';
      const title = r.JobTitle || r.Title || '';
      const company = r.Company || r["Company Name"] || '';
      const location = r.Location || r.Loc || '';
      const url = r.Url || r["LinkedIn"] || '';
      const phone = r["Contact Number"] || r["Contact Numbers"] || '';

      const { first, last } = splitName(name);
      const handle = handleFromLinkedIn(url);
      const email = handle ? `${handle}@placeholder.email` : `${first}.${(last||'').split(' ')[0] || 'x'}@placeholder.email`.toLowerCase();
      const yearsExp = estimateExpYears(title);
      const skills = inferSkills(title);
      const linkedinUrl = cleanLinkedInUrl(url);

      // find existing by email (primary), fallback by name+company
      let existing = await tx.talent.findFirst({ where: { OR: [ { email }, { AND: [ { fullName: `${first} ${last}`.trim() }, { industry: company || undefined } ] } ] } });

      if (!existing) {
        existing = await tx.talent.create({
          data: {
            fullName: `${first} ${last}`.trim(),
            email,
            phone: phone || null,
            location: location || null,
            timezone: 'Asia/Kolkata',
            bio: company ? `Works at ${company}` : null,
            designation: title || null,
            industry: company || null,
            yearsExp,
            linkedinUrl,
            status: linkedinUrl ? 'active' : 'inactive', // Only active if has LinkedIn
          },
        });
        inserted++;
      } else {
        await tx.talent.update({ 
          where: { id: existing.id }, 
          data: { 
            phone: phone || existing.phone, 
            location: location || existing.location, 
            designation: title || existing.designation,
            industry: existing.industry || company || null, 
            linkedinUrl: linkedinUrl || existing.linkedinUrl,
            status: (linkedinUrl || existing.linkedinUrl) ? 'active' : existing.status,
          } 
        });
        updated++;
      }

      // attach skills
      for (const s of skills) {
        const sk = await upsertSkill(tx, s);
        await tx.talentSkill.upsert({
          where: { talentId_skillId: { talentId: existing.id ?? 0, skillId: sk.id } },
          update: { level: 3 },
          create: { talentId: existing.id, skillId: sk.id, level: 3 },
        });
      }
    }
    return { inserted, updated };
  }, { timeout: 60000 });
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error('CSV not found:', INPUT);
    process.exit(1);
  }
  console.log('Reading CSV:', INPUT);
  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(INPUT)
      .pipe(csv())
      .on('data', data => rows.push(data))
      .on('end', resolve)
      .on('error', reject);
  });
  console.log('Rows loaded:', rows.length);

  let totalInserted = 0, totalUpdated = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { inserted, updated } = await processBatch(batch);
    totalInserted += inserted;
    totalUpdated += updated;
    console.log(`Processed ${i + batch.length}/${rows.length} (+${inserted} new, ~${updated} updated)`);
    await sleep(50);
  }
  console.log('Import complete:', { inserted: totalInserted, updated: totalUpdated });
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async err => { console.error(err); await prisma.$disconnect(); process.exit(1); });


