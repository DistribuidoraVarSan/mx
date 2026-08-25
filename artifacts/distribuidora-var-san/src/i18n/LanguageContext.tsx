import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LANGUAGES, DEFAULT_LANGUAGE, type LanguageCode } from './languages';
import { dictionaries } from './locales';
import type { Dictionary } from './types';

const STORAGE_KEY = 'varsan-language';

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function isValidLanguage(value: string | null): value is LanguageCode {
  if (!value) return false;
  return LANGUAGES.some((lang) => lang.code === value);
}

function getInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isValidLanguage(stored)) return stored;
  } catch {
    // localStorage no disponible (modo privado, SSR, etc.)
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // localStorage no disponible; el idioma sigue funcionando solo en memoria
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = dictionaries[language];

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }
  return context;
}
