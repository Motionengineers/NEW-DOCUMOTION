'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState({
    // Logo & Icons
    companyName: 'Documotion',
    logoUrl: '',
    logoDarkUrl: '',
    faviconUrl: '',

    // Colors
    primaryColor: '#0066cc',
    secondaryColor: '#64748b',
    accentColor: '#22c55e',
    notificationColor: '#ff9500',

    // Typography
    fontHeading: 'Inter',
    fontBody: 'Inter',
    fontWeight: 'normal',

    // Layout
    radius: 12, // pixels
    glassIntensity: 'medium', // none, minimal, medium, heavy
    layoutDensity: 'comfortable', // compact, comfortable, spacious
    theme: 'system', // light, dark, system

    // White Label
    whiteLabelMode: false,
    customDomain: '',

    loaded: false,
  });

  const applyBranding = useCallback(newBranding => {
    const root = document.documentElement;

    if (newBranding.primaryColor) {
      root.style.setProperty('--brand-primary', newBranding.primaryColor);
      root.style.setProperty('--system-blue', newBranding.primaryColor);
    }
    if (newBranding.secondaryColor) {
      root.style.setProperty('--brand-secondary', newBranding.secondaryColor);
    }
    if (newBranding.accentColor) {
      root.style.setProperty('--brand-accent', newBranding.accentColor);
    }

    if (newBranding.fontHeading) {
      root.style.setProperty('--font-heading', newBranding.fontHeading);
    }
    if (newBranding.fontBody) {
      root.style.setProperty('--font-body', newBranding.fontBody);
    }

    if (newBranding.radius) {
      root.style.setProperty('--brand-radius', `${newBranding.radius}px`);
      root.style.setProperty('--radius', `${newBranding.radius}px`);
    }

    if (newBranding.glassIntensity) {
      const glassMap = {
        none: { blur: '0px', opacity: '1', saturate: '1' },
        minimal: { blur: '8px', opacity: '0.95', saturate: '1.1' },
        medium: { blur: '20px', opacity: '0.85', saturate: '1.8' },
        heavy: { blur: '40px', opacity: '0.7', saturate: '2.5' },
      };
      const glass = glassMap[newBranding.glassIntensity] || glassMap.medium;
      root.style.setProperty('--glass-blur', glass.blur);
      root.style.setProperty('--glass-opacity', glass.opacity);
      root.style.setProperty('--glass-saturate', glass.saturate);
    }
  }, []);

  const loadBranding = useCallback(async (forceReload = false) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      // Prefer published runtime at /brand.json; fallback to /api/settings
      const cacheBuster = forceReload ? `?_t=${Date.now()}` : '';
      const runtimeRes = await fetch(`/brand.json${cacheBuster}`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      }).catch(() => null);

      if (runtimeRes && runtimeRes.ok) {
        const runtime = await runtimeRes.json();
        const tokens = runtime?.tokens || {};
        const colors = tokens.color || {};
        const typography = tokens.typography || {};
        const next = {
          companyName: runtime?.name || 'Documotion',
          logoUrl: runtime?.assets?.logo?.default || '',
          faviconUrl: runtime?.assets?.favicon || '',
          primaryColor: colors.primary || '#0066cc',
          accentColor: colors.accent || '#22c55e',
          // keep existing secondary if not provided
          fontHeading: typography.fontPrimary || 'Inter',
          fontBody: typography.fontPrimary || 'Inter',
          loaded: true,
        };
        setBranding(prev => ({ ...prev, ...next }));
        applyBranding(next);
        clearTimeout(timeoutId);
        return;
      }

      // Fallback to settings API
      const response = await fetch(`/api/settings?category=branding${cacheBuster}`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format from settings endpoint');
      }

      const data = await response.json();

      if (data.success && data.settings) {
        setBranding(prev => ({
          ...prev,
          ...data.settings,
          loaded: true,
        }));
        applyBranding(data.settings);
      } else {
        setBranding(prev => ({ ...prev, loaded: true }));
      }
    } catch (error) {
      // Silently fail - use defaults if API is unavailable
      if (error.name !== 'AbortError') {
        console.warn('Branding API unavailable, using defaults:', error.message);
      }
      setBranding(prev => ({ ...prev, loaded: true }));
    }
  }, [applyBranding]);

  useEffect(() => {
    loadBranding();
  }, [loadBranding]);

  const updateBranding = useCallback(
    async newSettings => {
      // Apply immediately for instant feedback
      setBranding(prev => ({ ...prev, ...newSettings }));
      applyBranding(newSettings);

      // Save to database
      try {
        const saveResults = await Promise.all(
          Object.entries(newSettings).map(([key, value]) =>
            fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                key,
                value: typeof value === 'string' ? value : JSON.stringify(value),
                category: 'branding',
                type:
                  typeof value === 'object'
                    ? 'json'
                    : key.includes('Color')
                      ? 'color'
                      : typeof value === 'number'
                        ? 'number'
                        : 'string',
                description: `Branding ${key}`,
              }),
            })
          )
        );
        
        // Verify all saves succeeded
        const failedSaves = saveResults.filter(res => !res.ok);
        if (failedSaves.length > 0) {
          throw new Error('Some branding settings failed to save');
        }
        
        // Reload branding from server to ensure consistency
        setTimeout(() => {
          loadBranding(true);
        }, 500);
      } catch (error) {
        console.error('Error saving branding:', error);
        throw error; // Re-throw so caller knows save failed
      }
    },
    [applyBranding, loadBranding]
  );

  const resetBranding = useCallback(() => {
    const defaults = {
      companyName: 'Documotion',
      logoUrl: '',
      logoDarkUrl: '',
      faviconUrl: '',
      primaryColor: '#0066cc',
      secondaryColor: '#64748b',
      accentColor: '#22c55e',
      notificationColor: '#ff9500',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      fontWeight: 'normal',
      radius: 12,
      glassIntensity: 'medium',
      layoutDensity: 'comfortable',
      theme: 'system',
      whiteLabelMode: false,
      customDomain: '',
    };
    setBranding(prev => ({ ...prev, ...defaults }));
    applyBranding(defaults);
    updateBranding(defaults);
  }, [applyBranding, updateBranding]);

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    // Return defaults if context not available (for SSR safety)
    return {
      branding: {
        companyName: 'Documotion',
        logoUrl: '',
        logoDarkUrl: '',
        faviconUrl: '',
        primaryColor: '#0066cc',
        secondaryColor: '#64748b',
        accentColor: '#22c55e',
        notificationColor: '#ff9500',
        fontHeading: 'Inter',
        fontBody: 'Inter',
        fontWeight: 'normal',
        radius: 12,
        glassIntensity: 'medium',
        layoutDensity: 'comfortable',
        theme: 'system',
        whiteLabelMode: false,
        customDomain: '',
        loaded: false,
      },
      updateBranding: () => {},
      resetBranding: () => {},
    };
  }
  return context;
};
