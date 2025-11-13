import React from 'react';
import useBrandStore from '../store/useBrandStore';

export default function LivePreview() {
  const { brand } = useBrandStore();

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h2 className="text-xl font-semibold">Live Brand Preview</h2>
      <p className="mt-2 text-sm text-gray-500">
        This panel reacts instantly to edits made in the header controls.
      </p>
      <div
        className="mt-6 rounded-2xl p-8 text-white shadow-lg"
        style={{ background: brand.primaryColor }}
      >
        <div className="text-2xl font-semibold">{brand.name}</div>
        <div className="mt-3 text-sm text-white/80">{brand.tagline}</div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[brand.primaryColor, brand.accentColor, '#ffffff'].map((color, index) => (
            <div key={index} className="rounded-xl border border-white/30 bg-white/10 p-3 text-xs">
              <p className="font-semibold uppercase tracking-widest text-white/70">Palette</p>
              <p className="mt-2 truncate text-white">{color}</p>
              <div className="mt-3 h-8 w-full rounded-md" style={{ background: color }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
