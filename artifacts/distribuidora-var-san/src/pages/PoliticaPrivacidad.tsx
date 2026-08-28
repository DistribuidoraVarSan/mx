import type React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function PoliticaPrivacidad() {
  const { t } = useLanguage();
  const doc = t.legal.privacy;

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <main className="legal-page">
      <div className="legal-header-nav container">
        <a href="/" onClick={handleBack} className="legal-back-button" data-testid="link-legal-back">
          <ArrowLeft size={16} />
          <span>{t.common.backToHome}</span>
        </a>
        <LanguageSelector />
      </div>
      <div className="legal-card">
        <div className="legal-title">
          <h1>{doc.title}</h1>
          <p>{doc.lastUpdated}</p>
        </div>
        <div className="legal-content">
          {doc.intro.map((paragraph, index) => (
            <p key={`intro-${index}`}>{paragraph}</p>
          ))}

          {doc.sections.map((section, sIndex) => (
            <div key={`section-${sIndex}`} className="legal-section-block">
              {section.title && <h2>{section.title}</h2>}
              {section.paragraphs?.map((p, pIndex) => (
                <p key={`p-${pIndex}`}>{p}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item, lIndex) => (
                    <li key={`list-${lIndex}`}>{item}</li>
                  ))}
                </ul>
              )}
              {section.highlight && (
                <p className="legal-highlight">{section.highlight}</p>
              )}
              {section.subsections?.map((sub, subIndex) => (
                <div key={`sub-${subIndex}`} className="legal-subsection-block">
                  <h3>{sub.title}</h3>
                  {sub.paragraphs?.map((sp, spIndex) => (
                    <p key={`sp-${spIndex}`}>{sp}</p>
                  ))}
                  {sub.list && (
                    <ul>
                      {sub.list.map((sitem, slIndex) => (
                        <li key={`slist-${slIndex}`}>{sitem}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ))}

          <p className="legal-contact-block">
            {doc.contactBlock.brand}
            <br />
            {doc.contactBlock.email}
          </p>

          <div className="legal-signoff">
            <strong>{doc.signoff.brand}</strong>
            <span>{doc.signoff.tagline}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
