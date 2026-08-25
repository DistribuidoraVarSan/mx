import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/languages';
import './LanguageSelector.css';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Cerrar con ESC
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Calcular posición del dropdown para que no quede recortado
  useEffect(() => {
    if (isOpen && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      menuRef.current.style.top = `${buttonRect.bottom + 8}px`;
      menuRef.current.style.left = `${buttonRect.right - 200}px`;
      menuRef.current.style.minWidth = '200px';
    }
  }, [isOpen]);

  const handleLanguageChange = (code: typeof language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const currentLanguage = LANGUAGES.find((lang) => lang.code === language);

  return (
    <div className="language-selector-wrapper" ref={containerRef}>
      <button
        ref={buttonRef}
        className="language-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t.languageSelector.label}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-testid="button-language-selector"
      >
        <span className="language-selector-label">{currentLanguage?.nativeName}</span>
      </button>

      {isOpen && (
        <ul
          className="language-selector-menu"
          role="listbox"
          ref={menuRef}
          data-testid="menu-language-selector"
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.code} role="option" aria-selected={language === lang.code}>
              <button
                className={`language-selector-option${language === lang.code ? ' active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
                data-testid={`language-option-${lang.code}`}
              >
                {lang.nativeName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
