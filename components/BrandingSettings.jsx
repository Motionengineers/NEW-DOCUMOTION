'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Palette, Loader2, Eye, Save } from 'lucide-react';

export default function BrandingSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Documotion',
    logoUrl: '',
    primaryColor: '#0066cc',
    secondaryColor: '#28a745',
    faviconUrl: '',
    tagline: 'The New Standard for Indian Startups',
  });
  const [logoPreviewError, setLogoPreviewError] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setLogoPreviewError(false);
  }, [settings.logoUrl]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings?category=branding');
      if (!response.ok) {
        throw new Error(`Failed to load settings (${response.status})`);
      }
      const data = await response.json();

      if (data.success && data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save each setting
      await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'companyName',
            value: settings.companyName,
            category: 'branding',
            type: 'string',
            description: 'Company/App name displayed in navbar',
          }),
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'logoUrl',
            value: settings.logoUrl,
            category: 'branding',
            type: 'url',
            description: 'Logo image URL',
          }),
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'primaryColor',
            value: settings.primaryColor,
            category: 'branding',
            type: 'color',
            description: 'Primary brand color',
          }),
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'tagline',
            value: settings.tagline,
            category: 'branding',
            type: 'string',
            description: 'Company tagline',
          }),
        }),
      ]);

      alert('Branding settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--system-blue)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-2">
          <Palette className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />
          <h2 className="text-3xl font-bold" style={{ color: 'var(--label)' }}>
            Branding Settings
          </h2>
        </div>
        <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
          Customize your platform&apos;s appearance and branding
        </p>
      </div>

      {/* Company Name */}
      <div className="glass rounded-xl p-6">
        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--label)' }}>
          Company Name
        </label>
        <input
          type="text"
          value={settings.companyName}
          onChange={e => setSettings({ ...settings, companyName: e.target.value })}
          className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ color: 'var(--label)' }}
          placeholder="Enter your company name"
        />
      </div>

      {/* Logo Upload */}
      <div className="glass rounded-xl p-6">
        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--label)' }}>
          Logo URL
        </label>
        <div className="space-y-4">
          <input
            type="url"
            value={settings.logoUrl}
            onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ color: 'var(--label)' }}
            placeholder="https://example.com/logo.png"
          />
            {settings.logoUrl && !logoPreviewError && (
            <div className="mt-4 flex items-center space-x-4">
              <div className="relative h-16 w-16 rounded-lg bg-white p-2">
                <Image
                  src={settings.logoUrl}
                  alt="Logo preview"
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-contain"
                  onError={() => setLogoPreviewError(true)}
                />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>
                  Logo Preview
                </p>
                <p className="text-xs" style={{ color: 'var(--tertiary-label)' }}>
                  Recommended: 256x256px transparent PNG
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Colors */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Palette className="h-5 w-5" style={{ color: 'var(--system-blue)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
            Brand Colors
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--secondary-label)' }}
            >
              Primary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                className="h-12 w-20 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ color: 'var(--label)' }}
              />
            </div>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--secondary-label)' }}
            >
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={e => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ color: 'var(--label)' }}
              placeholder="Your company tagline"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between glass rounded-xl p-6">
        <button
          onClick={() => setPreview(!preview)}
          className="px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2 glass hover:bg-white/10 transition-colors"
          style={{ color: 'var(--label)' }}
        >
          <Eye className="h-5 w-5" />
          <span>Preview</span>
        </button>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-8 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 transition-all shadow-lg disabled:opacity-50"
          style={{ backgroundColor: settings.primaryColor, color: '#ffffff' }}
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <div
          className="glass rounded-xl p-6 border-2"
          style={{ borderColor: settings.primaryColor }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--label)' }}>
            Preview
          </h3>
          <div className="space-y-4">
            <div
              className="flex items-center space-x-3 p-4 rounded-lg"
              style={{ backgroundColor: 'var(--system-secondary-background)' }}
            >
              {settings.logoUrl && !logoPreviewError ? (
                <div className="relative h-10 w-10">
                  <Image
                    src={settings.logoUrl}
                    alt="Logo preview"
                    fill
                    unoptimized
                    sizes="40px"
                    className="rounded-lg object-contain"
                    onError={() => setLogoPreviewError(true)}
                  />
                </div>
              ) : (
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  <span className="text-white font-bold">{settings.companyName.charAt(0)}</span>
                </div>
              )}
              <span className="text-xl font-semibold" style={{ color: 'var(--label)' }}>
                {settings.companyName}
              </span>
            </div>
            <div
              className="p-4 rounded-lg text-center"
              style={{ backgroundColor: settings.primaryColor, color: '#ffffff' }}
            >
              <p className="text-2xl font-bold mb-2">{settings.companyName}</p>
              <p className="text-sm opacity-90">{settings.tagline}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
