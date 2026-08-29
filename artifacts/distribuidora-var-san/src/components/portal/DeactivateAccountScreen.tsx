import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Loader2, LogOut } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

interface DeactivateAccountScreenProps {
  currentUser: FirebaseUser | null;
  username?: string;
  onBack: () => void;
  onDeactivated: () => void;
}

export const DeactivateAccountScreen: React.FC<DeactivateAccountScreenProps> = ({
  currentUser,
  username,
  onBack,
  onDeactivated,
}) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const displayUsername = username ? `@${username.replace(/^@/, '')}` : (currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@usuario');

  const handleDeactivate = async () => {
    if (!currentUser) return;
    setLoading(true);
    setFeedback(null);

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/auth/account/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          confirm: true,
          password: password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'No se pudo desactivar la cuenta.' });
        setLoading(false);
        return;
      }

      // Cerrar sesión local
      await signOut(auth);
      onDeactivated();
    } catch (err) {
      console.error('Error deactivating account:', err);
      setFeedback({ type: 'error', message: 'Error de conexión al procesar la desactivación.' });
      setLoading(false);
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
          data-testid="button-back-deactivate"
        >
          ←
        </button>
        <div className="subscreen-title-wrap">
          <h2 className="subscreen-title">Desactiva tu cuenta</h2>
          <span className="subscreen-subtitle">{displayUsername}</span>
        </div>
      </div>

      <div className="subscreen-body">
        <p className="subscreen-intro">
          Averigua qué sucede al desactivar tu cuenta y cómo puedes proteger tus datos.
        </p>

        {feedback && (
          <div
            className={`account-message account-message--${feedback.type === 'success' ? 'success' : 'warning'}`}
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            style={{ marginBottom: 16 }}
          >
            <ShieldAlert size={15} />
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="deactivate-details-card" style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <AlertTriangle size={20} style={{ color: '#c2410c' }} />
            <strong style={{ color: '#9a3412', fontSize: '0.98rem' }}>
              ¿Qué significa desactivar tu cuenta?
            </strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#7c2d12', fontSize: '0.86rem', lineHeight: 1.7 }}>
            <li>Tu sesión se cerrará de inmediato en todos tus dispositivos y aplicaciones.</li>
            <li>No podrás acceder al catálogo privado ni solicitar cotizaciones directas mientras esté inactiva.</li>
            <li>Recibirás un correo electrónico de confirmación en <strong>{currentUser?.email}</strong>.</li>
            <li>Tus datos se conservarán de forma segura y podrás solicitar su reactivación comunicándote con nuestro soporte oficial.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="button"
            className="button button--outline"
            style={{ color: '#b91c1c', borderColor: '#fca5a5', background: '#fee2e2', padding: '10px 20px' }}
            onClick={() => setConfirmModalOpen(true)}
            data-testid="button-trigger-deactivate-modal"
          >
            <LogOut size={15} />
            <span>Desactivar cuenta</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmación Explícita */}
      {confirmModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.currentTarget === e.target) setConfirmModalOpen(false); }}>
          <div className="modal" style={{ maxWidth: 440 }} role="dialog" aria-modal="true" aria-labelledby="deactivate-confirm-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={22} style={{ color: '#dc2626' }} />
              <h3 id="deactivate-confirm-title" style={{ margin: 0, color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 700 }}>
                ¿Confirmas la desactivación?
              </h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
              Esta acción cerrará tu sesión actual y suspenderá el acceso a tu cuenta. ¿Estás seguro de que deseas continuar?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="button button--outline"
                onClick={() => setConfirmModalOpen(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button button--navy"
                style={{ background: '#b91c1c', borderColor: '#b91c1c', color: '#ffffff' }}
                onClick={handleDeactivate}
                disabled={loading}
                data-testid="button-confirm-deactivate-final"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                <span>{loading ? 'Desactivando...' : 'Sí, desactivar mi cuenta'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
