import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, QrCode, Loader2, CheckCircle2, Copy, Check } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface SecurityScreenProps {
  currentUser: FirebaseUser | null;
  username?: string;
  twoFactorStatus: { enabled: boolean; method?: string; verifiedAt?: string } | null;
  onStatusChange: (status: any) => void;
  onBack: () => void;
}

export const SecurityScreen: React.FC<SecurityScreenProps> = ({
  currentUser,
  username,
  twoFactorStatus,
  onStatusChange,
  onBack,
}) => {
  const [setupStep, setSetupStep] = useState<'idle' | 'prompt' | 'qr' | 'code' | 'success'>('idle');
  const [qrUri, setQrUri] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal para desactivar
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disabling, setDisabling] = useState(false);

  const displayUsername = username ? `@${username.replace(/^@/, '')}` : (currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@usuario');

  const handleStartSetup = async () => {
    if (!currentUser) return;
    setLoading(true);
    setFeedback(null);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/auth/two-factor/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.totpUri) {
        setQrUri(data.totpUri);
        setSecretKey(data.secretKey || '');
        setSetupStep('code');
      } else {
        setFeedback({ type: 'error', message: data.error || 'No se pudo iniciar la configuración 2FA.' });
      }
    } catch (err) {
      console.error('Error start 2FA setup:', err);
      setFeedback({ type: 'error', message: 'Error al conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || verifyCode.trim().length < 6) return;
    setLoading(true);
    setFeedback(null);

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/auth/two-factor/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: verifyCode.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setBackupCodes(data.backupCodes || []);
        onStatusChange({ enabled: true, method: 'totp', verifiedAt: new Date().toISOString() });
        setSetupStep('success');
      } else {
        setFeedback({ type: 'error', message: data.error || 'Código 2FA incorrecto. Intenta de nuevo.' });
      }
    } catch (err) {
      console.error('Error verify 2FA:', err);
      setFeedback({ type: 'error', message: 'Error de red al verificar el código.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!currentUser) return;
    setDisabling(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/auth/two-factor/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: disableCode.trim() || undefined }),
      });

      if (res.ok) {
        onStatusChange({ enabled: false });
        setDisableModalOpen(false);
        setDisableCode('');
        setFeedback({ type: 'success', message: 'La autenticación en dos fases ha sido desactivada.' });
      } else {
        const data = await res.json();
        setFeedback({ type: 'error', message: data.error || 'No se pudo desactivar 2FA.' });
      }
    } catch (err) {
      console.error('Error disable 2FA:', err);
      setFeedback({ type: 'error', message: 'Error al desactivar 2FA.' });
    } finally {
      setDisabling(false);
    }
  };

  const handleCopySecret = () => {
    if (!secretKey) return;
    navigator.clipboard.writeText(secretKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="subscreen-container">
      <div className="subscreen-header">
        <button
          type="button"
          className="subscreen-back-btn"
          onClick={onBack}
          aria-label="Regresar a configuración"
          data-testid="button-back-security"
        >
          ←
        </button>
        <div className="subscreen-title-wrap">
          <h2 className="subscreen-title">Seguridad</h2>
          <span className="subscreen-subtitle">{displayUsername}</span>
        </div>
      </div>

      <div className="subscreen-body">
        <p className="subscreen-intro">
          Administra la seguridad de tu cuenta y los métodos de autenticación adicionales.
        </p>

        {feedback && (
          <div
            className={`account-message account-message--${feedback.type === 'success' ? 'success' : 'warning'}`}
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            style={{ marginBottom: 16 }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={15} /> : <ShieldAlert size={15} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tarjeta de Autenticación en dos fases */}
        <div className="two-factor-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 22, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={24} style={{ color: twoFactorStatus?.enabled ? '#166534' : 'var(--gold)' }} />
              <div>
                <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '1.02rem', fontWeight: 700 }}>
                  Autenticación en dos fases
                </h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    background: twoFactorStatus?.enabled ? '#dcfce7' : '#fef3c7',
                    color: twoFactorStatus?.enabled ? '#15803d' : '#b45309',
                    display: 'inline-block',
                    marginTop: 3,
                  }}
                >
                  {twoFactorStatus?.enabled ? 'ACTIVADA' : 'DESACTIVADA'}
                </span>
              </div>
            </div>

            <div>
              {twoFactorStatus?.enabled ? (
                <button
                  type="button"
                  className="button button--outline"
                  style={{ color: '#b91c1c', borderColor: '#fca5a5', fontSize: '0.82rem', padding: '6px 14px' }}
                  onClick={() => setDisableModalOpen(true)}
                  data-testid="button-open-disable-2fa"
                >
                  Desactivar 2FA
                </button>
              ) : (
                setupStep === 'idle' && (
                  <button
                    type="button"
                    className="button button--navy"
                    style={{ fontSize: '0.84rem', padding: '7px 16px' }}
                    onClick={handleStartSetup}
                    disabled={loading}
                    data-testid="button-start-2fa"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
                    <span>Activar 2FA</span>
                  </button>
                )
              )}
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
            Protege tu cuenta del acceso no autorizado utilizando un segundo método de autenticación, además de tu contraseña de Var San. Puedes elegir entre una app de autenticación (Google Authenticator, Microsoft Authenticator) o un código de seguridad.
          </p>

          {/* PASO DE CONFIGURACIÓN 2FA */}
          {setupStep === 'code' && (
            <div className="two-factor-setup-flow animate-fade-in" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #e2e8f0' }}>
              <strong style={{ color: 'var(--navy)', display: 'block', marginBottom: 8, fontSize: '0.92rem' }}>
                Configura tu aplicación de autenticación:
              </strong>
              <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 14 }}>
                1. Escanea el código o introduce la siguiente clave secreta en tu aplicación (Google Authenticator, Authy o Microsoft Authenticator):
              </p>

              {secretKey && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: 6, marginBottom: 16 }}>
                  <code style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.92rem', color: 'var(--navy)', letterSpacing: 2 }}>
                    {secretKey}
                  </code>
                  <button
                    type="button"
                    className="button button--outline"
                    style={{ padding: '4px 10px', fontSize: '0.76rem', marginLeft: 'auto' }}
                    onClick={handleCopySecret}
                  >
                    {copiedKey ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey ? 'Copiada' : 'Copiar'}</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleVerify2FA}>
                <label className="form-label" htmlFor="two-factor-code" style={{ marginBottom: 6, display: 'block' }}>
                  2. Introduce el código de 6 dígitos que muestra tu app:
                </label>
                <div style={{ display: 'flex', gap: 10, maxWidth: 320 }}>
                  <input
                    id="two-factor-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    className="form-input"
                    placeholder="000 000"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ textAlign: 'center', letterSpacing: 4, fontWeight: 700 }}
                    required
                    autoFocus
                    data-testid="input-2fa-verify-code"
                  />
                  <button
                    type="submit"
                    className="button button--navy"
                    disabled={loading || verifyCode.trim().length < 6}
                    data-testid="button-submit-2fa-verify"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>Confirmar</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ÉXITO DE ACTIVACIÓN */}
          {setupStep === 'success' && (
            <div className="two-factor-success-box animate-fade-in" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#15803d', marginBottom: 10 }}>
                <CheckCircle2 size={20} />
                <strong style={{ fontSize: '0.95rem' }}>La autenticación en dos fases está activada.</strong>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: 14 }}>
                A partir de ahora, cada vez que inicies sesión en un nuevo dispositivo, se te solicitará un código de tu aplicación de autenticación.
              </p>

              {backupCodes.length > 0 && (
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--navy)', display: 'block', marginBottom: 6 }}>
                    Guarda tus códigos de respaldo de emergencia:
                  </strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontFamily: 'monospace', fontSize: '0.84rem' }}>
                    {backupCodes.map((c, i) => (
                      <div key={i} style={{ background: '#ffffff', padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }}>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Desactivar 2FA */}
      {disableModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.currentTarget === e.target) setDisableModalOpen(false); }}>
          <div className="modal" style={{ maxWidth: 420 }} role="dialog" aria-modal="true" aria-labelledby="disable-2fa-title">
            <h3 id="disable-2fa-title" style={{ margin: '0 0 12px', color: 'var(--navy)', fontSize: '1.05rem', fontWeight: 700 }}>
              Desactivar autenticación en dos fases
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: 18 }}>
              Al desactivar 2FA, tu cuenta solo estará protegida por tu contraseña. ¿Deseas continuar?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="button button--outline"
                onClick={() => setDisableModalOpen(false)}
                disabled={disabling}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button button--navy"
                style={{ background: '#b91c1c', borderColor: '#b91c1c' }}
                onClick={handleDisable2FA}
                disabled={disabling}
                data-testid="button-confirm-disable-2fa"
              >
                {disabling ? <Loader2 size={14} className="animate-spin" /> : 'Desactivar 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
