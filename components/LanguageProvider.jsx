'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const LangContext = createContext({ lang: 'en', changeLang: () => {} });

export function LanguageProvider({ children, defaultLang = 'en' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [lang, setLang] = useState(defaultLang);

  const changeLang = useCallback(
    next => {
      const path = pathname || '/';
      const stripped = path.replace(/^\/[a-z]{2}(?=\/|$)/, '');
      const target = `/${next}${stripped}`;
      setLang(next);
      router.push(target);
    },
    [pathname, router]
  );

  const value = useMemo(() => ({ lang, changeLang }), [lang, changeLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
