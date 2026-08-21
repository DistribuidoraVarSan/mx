export type LanguageCode =
  | 'es'
  | 'en-GB'
  | 'fr'
  | 'pt'
  | 'it'
  | 'zh-TW'
  | 'zh-CN'
  | 'ko';

export type LanguageMeta = {
  code: LanguageCode;
  /** Siempre en su propio idioma. Nunca se traduce. */
  nativeName: string;
};

// Orden en el que aparecen en el selector.
export const LANGUAGES: LanguageMeta[] = [
  { code: 'es', nativeName: 'Español' },
  { code: 'en-GB', nativeName: 'English (UK)' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'pt', nativeName: 'Português' },
  { code: 'it', nativeName: 'Italiano' },
  { code: 'zh-TW', nativeName: '繁體中文' },
  { code: 'zh-CN', nativeName: '简体中文' },
  { code: 'ko', nativeName: '한국어' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'es';

export const LANGUAGE_STORAGE_KEY = 'varsan-language';

export function isLanguageCode(value: string | null): value is LanguageCode {
  if (!value) return false;
  return LANGUAGES.some((lang) => lang.code === value);
}
