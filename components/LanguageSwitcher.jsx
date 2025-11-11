'use client';

import { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageProvider';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
];

export default function LanguageSwitcher() {
  const { lang, changeLang } = useLang();
  const [value, setValue] = useState('en');

  useEffect(() => {
    setValue(lang || 'en');
  }, [lang]);

  return (
    <select
      onChange={e => changeLang(e.target.value)}
      className="bg-white/30 dark:bg-black/20 backdrop-blur-lg p-2 rounded-xl"
      value={value}
      aria-label="Select language"
    >
      {LANGUAGES.map(l => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
