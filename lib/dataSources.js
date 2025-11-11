import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

const DATA_ROOT = path.join(process.cwd(), 'data');
const cache = new Map();

async function readFileRelative(relativePath) {
  const filePath = path.join(DATA_ROOT, relativePath);
  return fs.readFile(filePath, 'utf8');
}

async function loadCsv(relativePath) {
  const csv = await readFileRelative(relativePath);
  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  if (parsed.errors?.length) {
    console.warn(`CSV parse warnings for ${relativePath}:`, parsed.errors);
  }
  return parsed.data;
}

async function loadJson(relativePath) {
  const json = await readFileRelative(relativePath);
  return JSON.parse(json);
}

async function loadDataset(baseName) {
  const jsonPath = `${baseName}.json`;
  try {
    return await loadJson(jsonPath);
  } catch (error) {
    if (error.code && error.code !== 'ENOENT') {
      throw error;
    }
  }
  return loadCsv(`${baseName}.csv`);
}

async function cached(key, loader) {
  if (!cache.has(key)) {
    cache.set(
      key,
      loader().catch(error => {
        cache.delete(key);
        throw error;
      })
    );
  }
  return cache.get(key);
}

export function loadGovtSchemes() {
  return cached('govtSchemes', () => loadDataset('govt_schemes_enhanced'));
}

export function loadBankSchemes() {
  return cached('bankSchemes', () => loadDataset('bank_schemes_enhanced'));
}

export function loadTalentProfiles() {
  return cached('talentProfiles', () => loadCsv('google_sheets_talent.csv'));
}

export function loadPitchDecks() {
  return cached('pitchDecks', () => loadDataset('pitch_decks'));
}

export function loadChallenges() {
  return cached('challenges', () => loadJson('challenges.json'));
}

export function loadLiveUpdates() {
  return cached('liveUpdates', () => loadJson('live_updates.json'));
}

export function loadSuggestionRules() {
  return cached('suggestionRules', () => loadJson('suggestion_rules.json'));
}

