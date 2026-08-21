import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isLanguageCode,
  type LanguageCode,
} from './languages';
import { DICTIONARIES } from './locales';
import type { Dictionary } from './types';

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguageCode(stored)) return stored;
  } catch {
    // localStorage no disponible (modo privado, SSR, etc.) — usamos el default.
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(readStoredLanguage);

  const setLanguage = (next: LanguageCode) => {
    setLanguageState(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // si falla el guardado, el idioma sigue activo en memoria para esta sesión
    }
    // Ayuda a lectores de pantalla / SEO a saber en qué idioma está la página.
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next;
    }
  };

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: DICTIONARIES[language] }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * Fuente única de verdad del idioma activo.
 * Cualquier componente (selector, chatbot, Portal de Clientes, etc.)
 * usa este mismo hook — nunca guardan su propio estado de idioma.
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de <LanguageProvider>');
  }
  return context;
}
