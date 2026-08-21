import type { LanguageCode } from '../languages';
import type { Dictionary } from '../types';

import es from './es';
import enGB from './en-GB';
import fr from './fr';
import pt from './pt';
import it from './it';
import zhTW from './zh-TW';
import zhCN from './zh-CN';
import ko from './ko';

// Para agregar un 9º idioma:
// 1) agrégalo a LANGUAGES en /i18n/languages.ts
// 2) crea /i18n/locales/<codigo>.ts implementando Dictionary
// 3) impórtalo y regístralo aquí abajo
export const DICTIONARIES: Record<LanguageCode, Dictionary> = {
  es,
  'en-GB': enGB,
  fr,
  pt,
  it,
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  ko,
};
