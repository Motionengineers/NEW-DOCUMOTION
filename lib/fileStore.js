import { promises as fs } from 'fs';
import path from 'path';

const RUNTIME_DIR = path.join(process.cwd(), 'data', 'runtime');

async function ensureRuntimeDir() {
  try {
    await fs.mkdir(RUNTIME_DIR, { recursive: true });
  } catch (error) {
    // Ignore EEXIST race
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

function resolvePath(fileName) {
  return path.join(RUNTIME_DIR, fileName);
}

export async function readJson(fileName, fallback) {
  await ensureRuntimeDir();
  const filePath = resolvePath(fileName);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    console.warn(`readJson: failed to read ${fileName}:`, error);
    return fallback;
  }
}

export async function writeJson(fileName, value) {
  await ensureRuntimeDir();
  const filePath = resolvePath(fileName);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
  return value;
}

export async function upsertJsonRecord(fileName, predicate, updates, defaults = []) {
  const existing = (await readJson(fileName, defaults)) ?? defaults;
  const idx = existing.findIndex(predicate);
  if (idx === -1) {
    existing.push(updates);
  } else {
    existing[idx] = { ...existing[idx], ...updates };
  }
  await writeJson(fileName, existing);
  return existing[idx === -1 ? existing.length - 1 : idx];
}

export async function appendJson(fileName, entry, defaults = []) {
  const existing = (await readJson(fileName, defaults)) ?? defaults;
  existing.push(entry);
  await writeJson(fileName, existing);
  return entry;
}

