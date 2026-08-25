import type { Dictionary } from '../types';
import type { LanguageCode } from '../languages';

import es from './es';
import enGB from './en-GB';
import fr from './fr';
import pt from './pt';
import it from './it';
import zhTW from './zh-TW';
import zhCN from './zh-CN';
import ko from './ko';

export const dictionaries: Record<LanguageCode, Dictionary> = {
  es,
  'en-GB': enGB,
  fr,
  pt,
  it,
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  ko,
};

export default dictionaries;
