import React from 'react';
import { SketchPicker } from 'react-color';
import useBrandStore from '../store/useBrandStore';
import api from '../utils/api';

export default function Header() {
  const { brand, setBrand } = useBrandStore();

  const onInputChange = key => event => setBrand({ [key]: event.target.value });

  const onColorChange = key => color => setBrand({ [key]: color.hex });

  const handleGenerateTaglines = async () => {
    try {
      const { data } = await api.post('/ai/taglines', {
        brandName: brand.name,
        description: brand.tagline || 'A new modern brand',
      });
      alert(`AI Taglines:\n${data.taglines.join('\n')}`);
    } catch (error) {
      console.error('Failed to fetch taglines', error);
      alert('Failed to generate taglines');
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Brand name</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-lg font-semibold"
              value={brand.name}
              onChange={onInputChange('name')}
              placeholder="Acme Labs"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Tagline</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
              value={brand.tagline}
              onChange={onInputChange('tagline')}
              placeholder="Innovate the future"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Primary color</p>
              <div className="mt-2 rounded-xl border border-gray-200 p-3">
                <SketchPicker
                  color={brand.primaryColor}
                  onChange={onColorChange('primaryColor')}
                  disableAlpha
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Accent color</p>
              <div className="mt-2 rounded-xl border border-gray-200 p-3">
                <SketchPicker
                  color={brand.accentColor}
                  onChange={onColorChange('accentColor')}
                  disableAlpha
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              onClick={handleGenerateTaglines}
            >
              Generate Taglines
            </button>
            <button
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-gray-300"
              onClick={() => setBrand({ name: '', tagline: '', logos: [] })}
            >
              Reset Brand
            </button>
          </div>
        </div>
        <div className="w-full max-w-xs rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Live preview</p>
          <div
            className="mt-3 rounded-xl p-6 text-white"
            style={{ background: brand.primaryColor }}
          >
            <p className="text-xl font-semibold">{brand.name}</p>
            <p className="mt-2 text-sm text-white/80">{brand.tagline}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
