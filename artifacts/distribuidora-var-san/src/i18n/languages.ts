export type LanguageCode =
  | 'es'
  | 'en-GB'
  | 'fr'
  | 'pt'
  | 'it'
  | 'zh-TW'
  | 'zh-CN'
  | 'ko';

export type LanguageInfo = {
  code: LanguageCode;
  nativeName: string;
};

export const LANGUAGES: LanguageInfo[] = [
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
