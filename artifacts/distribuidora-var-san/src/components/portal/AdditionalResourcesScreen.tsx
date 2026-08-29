import React, { useState } from 'react';
import { HelpCircle, FileText, Bug, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface AdditionalResourcesScreenProps {
  currentUser: FirebaseUser | null;
  username?: string;
  autoBugReportEnabled?: boolean;
  onBack: () => void;
  onNavigateLegal: (path: '/privacidad' | '/cookies' | '/terminos') => void;
}

export const AdditionalResourcesScreen: React.FC<AdditionalResourcesScreenProps> = ({
  currentUser,
  username,
  autoBugReportEnabled = true,
  onBack,
  onNavigateLegal,
}) => {
  const [autoReport, setAutoReport] = useState(autoBugReportEnabled);
  const [feedback, setFeedback] = useState<string | null>(null);

  const displayUsername = username ? `@${username.replace(/^@/, '')}` : '@usuario';

  const handleToggleAutoReport = async () => {
    const nextVal = !autoReport;
    setAutoReport(nextVal);
    localStorage.setItem('dvs_auto_bug_report', String(nextVal));

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          autoBugReport: nextVal,
        }, { merge: true });
        setFeedback(`Informes automáticos de fallos ${nextVal ? 'activados' : 'desactivados'}.`);
        setTimeout(() => setFeedback(null), 3000);
      } catch (err) {
        console.warn('Error saving autoBugReport to Firestore:', err);
      }
    }
  };

  return (
    <div className="subscreen-container">
      <div className="subscreen-header">
        <button
          type="button"
          className="subscreen-back-btn"
          onClick={onBack}
          aria-label="Regresar a configuración"
          data-testid="button-back-resources"
        >
          ←
        </button>
        <div className="subscreen-title-wrap">
          <h2 className="subscreen-title">Recursos adicionales</h2>
          <span className="subscreen-subtitle">{displayUsername}</span>
        </div>
      </div>

      <div className="subscreen-body">
        <p className="subscreen-intro">
          Consulta otros lugares para obtener más información útil sobre los productos y servicios de Var San.
        </p>

        {feedback && (
          <div className="account-message account-message--success" role="status" style={{ marginBottom: 16 }}>
            <CheckCircle2 size={15} />
            <span>{feedback}</span>
          </div>
        )}

        {/* Versión y Compilación */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ color: 'var(--navy)', fontSize: '0.92rem', display: 'block' }}>
              Portal de Cliente Distribuidora Var San
            </strong>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Plataforma Corporativa de Suministros
            </span>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#475569' }}>
            <div><strong>Versión:</strong> 0.01</div>
            <div><strong>Compilación:</strong> 01</div>
          </div>
        </div>

        {/* SECCIÓN OBTENER AYUDA */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <HelpCircle size={18} style={{ color: 'var(--navy)' }} />
            <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '0.98rem', fontWeight: 700 }}>
              Obtener ayuda
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ paddingRight: 16 }}>
              <strong style={{ color: '#1e293b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Bug size={14} style={{ color: '#64748b' }} />
                Enviar informe de fallas
              </strong>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Envía automáticamente los informes de fallos al proveedor de servicios Var San para ayudar a mejorar este sitio.
              </p>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={autoReport}
              onClick={handleToggleAutoReport}
              className={`toggle-switch ${autoReport ? 'toggle-switch--active' : ''}`}
              data-testid="switch-auto-bug-report"
            >
              <span className="toggle-switch-slider" />
              <span className="toggle-switch-text">{autoReport ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* SECCIÓN LEGAL */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <FileText size={18} style={{ color: 'var(--navy)' }} />
            <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '0.98rem', fontWeight: 700 }}>
              Legal
            </h3>
          </div>

          <div className="legal-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              type="button"
              className="settings-nav-row"
              onClick={() => onNavigateLegal('/cookies')}
              data-testid="link-legal-cookies"
            >
              <span className="nav-row-title">Política Cookies</span>
              <ChevronRight size={16} className="nav-row-arrow" />
            </button>

            <button
              type="button"
              className="settings-nav-row"
              onClick={() => onNavigateLegal('/privacidad')}
              data-testid="link-legal-privacy"
            >
              <span className="nav-row-title">Aviso de Privacidad</span>
              <ChevronRight size={16} className="nav-row-arrow" />
            </button>

            <button
              type="button"
              className="settings-nav-row"
              onClick={() => onNavigateLegal('/terminos')}
              data-testid="link-legal-terms"
            >
              <span className="nav-row-title">Términos y condiciones</span>
              <ChevronRight size={16} className="nav-row-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
