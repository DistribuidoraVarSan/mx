import { useEffect, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { LANGUAGES } from '../i18n/languages';
import { useLanguage } from '../i18n/LanguageContext';
import './LanguageSelector.css';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((lang) => lang.code === language) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="lang-selector" ref={rootRef}>
      <button
        type="button"
        className="lang-selector-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.languageSelector.label}
        data-testid="button-language-selector"
      >
        <Globe size={15} />
        <span className="lang-selector-current">{current.nativeName}</span>
      </button>

      {open && (
        <div className="lang-selector-panel" role="listbox" aria-label={t.languageSelector.label}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={lang.code === language}
              className={`lang-selector-option${lang.code === language ? ' active' : ''}`}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              data-testid={`option-language-${lang.code}`}
            >
              <span>{lang.nativeName}</span>
              {lang.code === language && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
