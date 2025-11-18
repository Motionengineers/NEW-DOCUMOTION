// Simple design tokens engine to normalize raw inputs into semantic tokens
export function generateSemanticTokens(input) {
  const raw = input || {};
  const color = normalizeColors(raw.colors || raw.color || {});
  const typography = normalizeTypography(raw.typography || {});
  const spacing = normalizeSpacing(raw.spacing || {});
  return { color, typography, spacing };
}

function normalizeColors(c) {
  return {
    primary: c.primary || '#0066cc',
    accent: c.accent || '#22c55e',
    surface: c.surface || '#0b0b0c',
    text: c.text || '#edeff3',
    success: c.success || '#16a34a',
    warning: c.warning || '#f59e0b',
    danger: c.danger || '#ef4444',
    // Optional light scheme can be added later
  };
}

function normalizeTypography(t) {
  return {
    scale: t.scale || 'majorThird',
    fontPrimary: t.fontPrimary || 'Inter',
    fontHindi: t.fontHindi || 'Tiro Devanagari Hindi',
    lineHeight: t.lineHeight || 1.5,
    tracking: t.tracking || 0,
  };
}

function normalizeSpacing(s) {
  return {
    base: isFiniteNumber(s.base) ? s.base : 4,
    scale: isFiniteNumber(s.scale) ? s.scale : 1.25,
    radius: isFiniteNumber(s.radius) ? s.radius : 12,
  };
}

function isFiniteNumber(v) {
  return typeof v === 'number' && isFinite(v);
}


