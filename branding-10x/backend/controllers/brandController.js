const store = require('../models/brandStore');

exports.updateBrand = async (req, res) => {
  const brand = req.body;
  const saved = store.upsert(brand);
  return res.json({ ok: true, brand: saved });
};

exports.saveSnapshot = async (req, res) => {
  const snapshot = req.body;
  const id = store.saveVersion(snapshot);
  return res.json({ ok: true, versionId: id });
};

exports.getVersions = async (req, res) => {
  const versions = store.getVersions();
  return res.json({ ok: true, versions });
};

exports.revertVersion = async (req, res) => {
  const { versionId } = req.body;
  const snapshot = store.revert(Number(versionId));
  if (!snapshot) return res.status(404).json({ ok: false, message: 'Version not found' });
  return res.json({ ok: true, brand: snapshot });
};
