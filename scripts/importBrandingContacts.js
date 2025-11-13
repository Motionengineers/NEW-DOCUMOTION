/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function normalizeString(value) {
  if (!value) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

function toRecord(c) {
  return {
    organization: normalizeString(c.organization),
    firstName: normalizeString(c.firstName),
    lastName: normalizeString(c.lastName),
    designation: normalizeString(c.designation),
    phone: normalizeString(c.phone),
    email: normalizeString(c.email?.toLowerCase()),
  };
}

function dedupe(list) {
  const map = new Map();
  for (const c of list) {
    const key = c.email || `${c.organization}|${c.firstName}|${c.lastName}`;
    if (!map.has(key)) map.set(key, c);
  }
  return Array.from(map.values());
}

async function main() {
  const base = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data/branding-contacts.json'), 'utf8')
  );
  const extra = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data/branding-contacts-extra.json'), 'utf8')
  );
  const merged = dedupe([...base.map(toRecord), ...extra.map(toRecord)]);
  let upserts = 0;
  for (const c of merged) {
    if (c.email) {
      await prisma.brandingContact.upsert({
        where: { email: c.email },
        update: c,
        create: c,
      });
    } else {
      // fallback composite uniqueness
      const found = await prisma.brandingContact.findFirst({
        where: {
          organization: c.organization,
          firstName: c.firstName,
          lastName: c.lastName,
        },
      });
      if (found) {
        await prisma.brandingContact.update({ where: { id: found.id }, data: c });
      } else {
        await prisma.brandingContact.create({ data: c });
      }
    }
    upserts += 1;
  }
  console.log(`Imported contacts: ${upserts}`);
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
