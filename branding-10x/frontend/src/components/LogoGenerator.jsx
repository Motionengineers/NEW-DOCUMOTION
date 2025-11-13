import React, { useState } from 'react';
import useBrandStore from '../store/useBrandStore';
import api from '../utils/api';

export default function LogoGenerator() {
  const { brand, setLogos } = useBrandStore();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/logo', {
        brandName: brand.name,
        primaryColor: brand.primaryColor,
        style: 'modern minimal vector',
      });
      setLogos(data.logos);
    } catch (error) {
      console.error('Logo generation failed', error);
      alert('Logo generation failed');
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">AI Logo Generator</h2>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {loading ? 'Generating…' : 'Generate Logos'}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        We’ll call the OpenAI Images API (DALL·E) to produce 3 branded logo variations.
      </p>

      <LogoGrid logos={brand.logos} />
    </div>
  );
}

function LogoGrid({ logos = [] }) {
  if (!logos.length) {
    return (
      <div className="mt-6 grid gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-400">
        <p>Your generated logos will appear here. Click “Generate Logos” to get started.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {logos.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`Logo variation ${index + 1}`}
          className="rounded-xl border border-gray-200 bg-white object-cover p-4 shadow transition-transform hover:scale-105 hover:shadow-lg"
        />
      ))}
    </div>
  );
}
