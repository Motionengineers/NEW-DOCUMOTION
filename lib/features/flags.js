const FLAG_DEFAULTS = {
  'new-dashboard-enabled': false,
};

export async function isFeatureEnabled(flagName, _userId) {
  const envKey = `FEATURE_${flagName.replace(/-/g, '_').toUpperCase()}`;
  if (process.env[envKey] === 'true') return true;
  if (process.env[envKey] === 'false') return false;
  return FLAG_DEFAULTS[flagName] ?? false;
}
