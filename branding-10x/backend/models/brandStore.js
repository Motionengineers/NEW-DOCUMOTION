let current = {
  name: 'Acme Co',
  tagline: 'Awesome by default',
  colors: { primary: '#0ea5a4', accent: '#be185d' },
  logo: null,
};

let versions = [];
let nextId = 1;

exports.upsert = brand => {
  current = { ...current, ...brand };
  return current;
};

exports.saveVersion = snapshot => {
  const id = nextId++;
  versions.push({ id, snapshot, createdAt: new Date() });
  return id;
};

exports.getVersions = () => versions;

exports.revert = id => {
  const entry = versions.find(v => v.id === id);
  if (!entry) return null;
  current = entry.snapshot;
  return current;
};

exports.getCurrent = () => current;
