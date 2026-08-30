import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Phone,
  Mail,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Copy,
  RefreshCw,
  Send,
  X,
  Lock,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  request2FASetupCode,
  verifyAndEnable2FA,
  disable2FA,
  fetch2FAStatus,
  fetch2FABackupCodes,
  regenerate2FABackupCodes,
  send2FABackupCodesEmail,
} from '../../lib/session-client';

interface SecurityScreenProps {
  currentUser: FirebaseUser | null;
  username?: string;
  twoFactorStatus: { enabled: boolean; method?: string; phone?: string; verifiedAt?: string } | null;
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
  // Pasos de pantalla: 'main' (estado inicial), 'configure' (teléfono y método), 'verify' (código 6 dígitos), 'success'
  const [view, setView] = useState<'main' | 'configure' | 'verify' | 'success'>('main');
  const [phonePrefix, setPhonePrefix] = useState('+52');
  const [phoneNumber, setPhoneNumber] = useState(
    twoFactorStatus?.phone ? twoFactorStatus.phone.replace(/^\+52/, '') : '',
  );
  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'email'>('sms');
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Códigos de respaldo
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [loadingBackupCodes, setLoadingBackupCodes] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Modal para desactivar
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const displayUsername = username
    ? `@${username.replace(/^@/, '')}`
    : currentUser?.email
    ? `@${currentUser.email.split('@')[0]}`
    : '@usuario';

  // Sincronizar estado fresco de 2FA al montar
  useEffect(() => {
    if (currentUser) {
      fetch2FAStatus(currentUser)
        .then((status) => {
          if (status) {
            onStatusChange(status);
            if (status.phone) {
              setPhoneNumber(status.phone.replace(/^\+52/, ''));
            }
          }
        })
        .catch(() => {});
    }
  }, [currentUser]);

  // Cooldown de reenvío
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleStartConfigure = () => {
    setFeedback(null);
    setSelectedMethod('sms');
    setView('configure');
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const fullPhone = `${phonePrefix}${phoneNumber.replace(/\s+/g, '')}`;
    if (phoneNumber.replace(/\D/g, '').length < 10) {
      setFeedback({ type: 'error', message: 'Introduce un número celular válido de 10 dígitos.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const result = await request2FASetupCode(currentUser, {
        phone: fullPhone,
        method: selectedMethod,
      });

      if (result.success) {
        setView('verify');
        setVerifyCode('');
        setResendCooldown(30);
        setFeedback({
          type: 'success',
          message:
            selectedMethod === 'sms'
              ? `Te enviamos un código de 6 dígitos por SMS a ${fullPhone}.`
              : result.message || 'Código de verificación enviado.',
        });
      } else {
        setFeedback({ type: 'error', message: result.error || 'No se pudo enviar el código. Intenta de nuevo.' });
      }
    } catch (err: any) {
      console.error('Error al solicitar código 2FA:', err);
      setFeedback({ type: 'error', message: 'Error de conexión al solicitar el código.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !currentUser) return;
    const fullPhone = `${phonePrefix}${phoneNumber.replace(/\s+/g, '')}`;
    setLoading(true);
    setFeedback(null);

    try {
      const result = await request2FASetupCode(currentUser, {
        phone: fullPhone,
        method: selectedMethod,
      });

      if (result.success) {
        setResendCooldown(30);
        setFeedback({ type: 'success', message: 'Nuevo código de verificación enviado exitosamente.' });
      } else {
        setFeedback({ type: 'error', message: result.error || 'No se pudo reenviar el código.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error de red al reenviar el código.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || verifyCode.trim().length !== 6) return;

    setLoading(true);
    setFeedback(null);

    try {
      const result = await verifyAndEnable2FA(currentUser, verifyCode.trim());
      if (result.success) {
        const fullPhone = `${phonePrefix}${phoneNumber.replace(/\s+/g, '')}`;
        onStatusChange({
          enabled: true,
          method: selectedMethod,
          phone: fullPhone,
          verifiedAt: new Date().toISOString(),
        });
        if (result.twoFactor && result.twoFactor.backupCodes) {
          setBackupCodes(result.twoFactor.backupCodes);
        } else if ((result as any).backupCodes) {
          setBackupCodes((result as any).backupCodes);
        }
        setView('success');
      } else {
        setFeedback({ type: 'error', message: result.error || 'Código incorrecto o expirado.' });
      }
    } catch (err) {
      console.error('Error al verificar código 2FA:', err);
      setFeedback({ type: 'error', message: 'Error de conexión al verificar el código.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBackupModal = async () => {
    if (!currentUser) return;
    setBackupModalOpen(true);
    setCopiedCodes(false);
    if (backupCodes.length === 0) {
      setLoadingBackupCodes(true);
      try {
        const res = await fetch2FABackupCodes(currentUser);
        if (res.success && res.backupCodes) {
          setBackupCodes(res.backupCodes);
        }
      } catch (err) {
        console.error('Error al consultar códigos de respaldo:', err);
      } finally {
        setLoadingBackupCodes(false);
      }
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!currentUser) return;
    setLoadingBackupCodes(true);
    try {
      const res = await regenerate2FABackupCodes(currentUser);
      if (res.success && res.backupCodes) {
        setBackupCodes(res.backupCodes);
        setCopiedCodes(false);
        setFeedback({ type: 'success', message: 'Nuevos códigos de respaldo generados y enviados a tu correo.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'No se pudieron regenerar los códigos.' });
      }
    } catch (err) {
      console.error('Error al regenerar códigos:', err);
      setFeedback({ type: 'error', message: 'Error al regenerar códigos de respaldo.' });
    } finally {
      setLoadingBackupCodes(false);
    }
  };

  const handleSendBackupCodesEmail = async () => {
    if (!currentUser) return;
    setSendingEmail(true);
    setFeedback(null);
    try {
      const res = await send2FABackupCodesEmail(currentUser);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Códigos de respaldo enviados a tu correo electrónico registrado.',
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'No se pudo enviar el correo de respaldo.' });
      }
    } catch (err) {
      console.error('Error al enviar correo de códigos:', err);
      setFeedback({ type: 'error', message: 'Error de conexión al enviar el correo.' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyBackupCodes = () => {
    if (backupCodes.length === 0) return;
    const textToCopy = `DISTRIBUIDORA VAR SAN — CÓDIGOS DE RESPALDO 2FA\n\n${backupCodes.join(
      '\n',
    )}\n\nGuarda estos códigos en un lugar seguro. Cada código solo puede utilizarse una vez.`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 3000);
  };

  const handleDisable2FA = async () => {
    if (!currentUser) return;
    setDisabling(true);
    try {
      const result = await disable2FA(currentUser);
      if (result.success) {
        onStatusChange({ enabled: false });
        setDisableModalOpen(false);
        setBackupCodes([]);
        setView('main');
        setFeedback({ type: 'success', message: 'La autenticación en dos fases ha sido desactivada.' });
      } else {
        setFeedback({ type: 'error', message: result.error || 'No se pudo desactivar 2FA.' });
      }
    } catch (err) {
      console.error('Error al desactivar 2FA:', err);
      setFeedback({ type: 'error', message: 'Error al desactivar 2FA.' });
    } finally {
      setDisabling(false);
    }
  };

  return (
    <div className="subscreen-container">
      {/* Encabezado */}
      <div className="subscreen-header">
        <button
          type="button"
          className="subscreen-back-btn"
          onClick={view === 'main' ? onBack : () => setView('main')}
          aria-label="Regresar"
          data-testid="button-back-security"
        >
          ←
        </button>
        <div className="subscreen-title-wrap">
          <h2 className="subscreen-title">
            {view === 'configure'
              ? 'Configurar autenticación en dos fases'
              : view === 'verify'
              ? 'Verifica tu identidad'
              : 'Seguridad'}
          </h2>
          <span className="subscreen-subtitle">{displayUsername}</span>
        </div>
      </div>

      <div className="subscreen-body">
        {feedback && (
          <div
            className={`account-message account-message--${feedback.type === 'success' ? 'success' : 'warning'}`}
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            style={{ marginBottom: 16 }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* VISTA 1: PRINCIPAL DE SEGURIDAD (ESTADO ACTIVADA / DESACTIVADA) */}
        {/* ============================================================ */}
        {view === 'main' && (
          <div>
            <p className="subscreen-intro" style={{ marginBottom: 20 }}>
              Protege tu cuenta del acceso no autorizado mediante un código de seguridad de 6 dígitos enviado a tu número
              celular vía SMS.
            </p>

            <div
              className="two-factor-card"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 22,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={26} style={{ color: twoFactorStatus?.enabled ? '#166534' : 'var(--gold)' }} />
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '1.05rem', fontWeight: 700 }}>
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
                        marginTop: 4,
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
                      style={{ color: '#b91c1c', borderColor: '#fca5a5', fontSize: '0.84rem', padding: '6px 14px' }}
                      onClick={() => setDisableModalOpen(true)}
                      data-testid="button-open-disable-2fa"
                    >
                      Desactivar 2FA
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="button button--navy"
                      style={{ fontSize: '0.86rem', padding: '8px 18px' }}
                      onClick={handleStartConfigure}
                      data-testid="button-start-2fa"
                    >
                      <span>Activar 2FA</span>
                    </button>
                  )}
                </div>
              </div>

              {!twoFactorStatus?.enabled ? (
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Protege tu cuenta mediante un código de seguridad enviado a tu número celular.
                </p>
              ) : (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: 14,
                    marginTop: 12,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: '0.84rem' }}>
                    <div>
                      <span
                        style={{
                          color: '#64748b',
                          display: 'block',
                          fontSize: '0.74rem',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}
                      >
                        Método principal
                      </span>
                      <strong style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MessageSquare size={14} style={{ color: 'var(--gold)' }} />
                        {twoFactorStatus.method === 'sms' ? 'Mensaje SMS' : 'Correo electrónico'}
                      </strong>
                    </div>
                    {twoFactorStatus.phone && (
                      <div>
                        <span
                          style={{
                            color: '#64748b',
                            display: 'block',
                            fontSize: '0.74rem',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}
                        >
                          Número registrado
                        </span>
                        <strong style={{ color: 'var(--navy)' }}>{twoFactorStatus.phone}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN DE CÓDIGOS DE RESPALDO (VISIBLE CUANDO 2FA ESTÁ ACTIVA) */}
            {twoFactorStatus?.enabled && (
              <div
                className="backup-codes-section animate-fade-in"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 20,
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      background: '#fffdf7',
                      border: '1px solid #fef08a',
                      padding: 8,
                      borderRadius: 8,
                      color: 'var(--navy)',
                    }}
                  >
                    <KeyRound size={20} style={{ color: 'var(--gold)' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', color: 'var(--navy)', fontSize: '0.98rem', fontWeight: 700 }}>
                      Códigos de respaldo
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                      Usa estos códigos de un solo uso para iniciar sesión si no tienes acceso a tu teléfono celular.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                  <button
                    type="button"
                    className="button button--navy"
                    style={{ fontSize: '0.84rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={handleOpenBackupModal}
                    data-testid="button-view-backup-codes"
                  >
                    <Lock size={14} />
                    <span>Ver códigos de respaldo</span>
                  </button>

                  <button
                    type="button"
                    className="button button--outline"
                    style={{ fontSize: '0.84rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={handleSendBackupCodesEmail}
                    disabled={sendingEmail}
                    data-testid="button-send-backup-codes-email"
                  >
                    {sendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>Enviar códigos por correo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* VISTA 2: CONFIGURAR 2FA (NÚMERO CELULAR + MÉTODO SMS) */}
        {/* ============================================================ */}
        {view === 'configure' && (
          <form onSubmit={handleRequestCode} className="animate-fade-in">
            <p className="subscreen-intro" style={{ marginBottom: 18 }}>
              Registra tu número celular para recibir códigos de seguridad de 6 dígitos por SMS al iniciar sesión.
            </p>

            {/* Número celular con selector de país */}
            <div className="form-field" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="2fa-phone">
                Número celular <span style={{ color: '#b91c1c' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 10 }}>
                <select
                  className="form-select"
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  style={{ fontWeight: 600 }}
                >
                  <option value="+52">+52 (MX)</option>
                  <option value="+1">+1 (US/CA)</option>
                  <option value="+34">+34 (ES)</option>
                  <option value="+57">+57 (CO)</option>
                  <option value="+54">+54 (AR)</option>
                  <option value="+56">+56 (CL)</option>
                  <option value="+51">+51 (PE)</option>
                </select>
                <div className="input-with-icon">
                  <Phone size={15} className="input-icon" />
                  <input
                    id="2fa-phone"
                    type="tel"
                    className="form-input"
                    placeholder="833 449 4349"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    autoFocus
                    data-testid="input-2fa-phone"
                  />
                </div>
              </div>
              <span className="form-field-hint">Introduce tus 10 dígitos sin espacios ni guiones.</span>
            </div>

            {/* Selector de método: SMS (Predeterminado) o Correo */}
            <div className="form-field" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>
                Método de verificación
              </label>

              <div style={{ display: 'grid', gap: 12 }}>
                {/* Opción 1: Mensaje SMS (Principal) */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 14,
                    borderRadius: 8,
                    border: `1.5px solid ${selectedMethod === 'sms' ? 'var(--gold)' : '#e2e8f0'}`,
                    background: selectedMethod === 'sms' ? '#fffdf7' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="2fa-method"
                    value="sms"
                    checked={selectedMethod === 'sms'}
                    onChange={() => setSelectedMethod('sms')}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <strong
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--navy)',
                        fontSize: '0.92rem',
                      }}
                    >
                      <MessageSquare size={15} style={{ color: 'var(--gold)' }} /> Mensaje SMS (Recomendado)
                    </strong>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginTop: 2 }}>
                      Recibirás un código de seguridad de 6 dígitos vía SMS en tu número celular mediante Twilio Verify.
                    </span>
                  </div>
                </label>

                {/* Opción 2: Correo electrónico (Alternativa) */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 14,
                    borderRadius: 8,
                    border: `1.5px solid ${selectedMethod === 'email' ? 'var(--gold)' : '#e2e8f0'}`,
                    background: selectedMethod === 'email' ? '#fffdf7' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="2fa-method"
                    value="email"
                    checked={selectedMethod === 'email'}
                    onChange={() => setSelectedMethod('email')}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <strong
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--navy)',
                        fontSize: '0.92rem',
                      }}
                    >
                      <Mail size={15} /> Correo electrónico
                    </strong>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginTop: 2 }}>
                      Recibirás el código en tu correo registrado ({currentUser?.email || 'asociado a tu cuenta'}).
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="button button--outline"
                onClick={() => setView('main')}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="button button--navy"
                disabled={loading || phoneNumber.replace(/\D/g, '').length < 10}
                data-testid="button-request-2fa-code"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                <span>Enviar código</span>
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* VISTA 3: INTRODUCCIÓN Y VERIFICACIÓN DEL CÓDIGO DE 6 DÍGITOS */}
        {/* ============================================================ */}
        {view === 'verify' && (
          <form onSubmit={handleVerifyAndActivate} className="animate-fade-in">
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 16,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                {selectedMethod === 'sms' ? (
                  <>
                    Te enviamos un código de 6 dígitos por SMS a tu número{' '}
                    <strong style={{ color: 'var(--navy)' }}>
                      {phonePrefix} {phoneNumber}
                    </strong>
                    .
                  </>
                ) : (
                  <>
                    Te enviamos un código de 6 dígitos por correo a{' '}
                    <strong style={{ color: 'var(--navy)' }}>{currentUser?.email}</strong>.
                  </>
                )}
              </p>
            </div>

            <div className="form-field" style={{ marginBottom: 20 }}>
              <label
                className="form-label"
                htmlFor="verify-2fa-code"
                style={{ textAlign: 'center', display: 'block', marginBottom: 8 }}
              >
                Código de verificación
              </label>
              <div style={{ maxWidth: 280, margin: '0 auto' }}>
                <input
                  id="verify-2fa-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-input"
                  placeholder="_ _ _ _ _ _"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{
                    textAlign: 'center',
                    letterSpacing: 8,
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    padding: '12px 14px',
                  }}
                  required
                  autoFocus
                  data-testid="input-verify-2fa-code"
                />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <button
                type="button"
                className="btn-link"
                onClick={handleResendCode}
                disabled={loading || resendCooldown > 0}
                style={{
                  fontSize: '0.84rem',
                  color: resendCooldown > 0 ? '#94a3b8' : 'var(--gold)',
                  fontWeight: 600,
                }}
              >
                {resendCooldown > 0
                  ? `¿No recibiste el código? Reenviar en ${resendCooldown}s`
                  : '¿No recibiste el código? Reenviar código'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="button button--outline"
                onClick={() => setView('configure')}
                disabled={loading}
              >
                <ArrowLeft size={14} /> Regresar
              </button>
              <button
                type="submit"
                className="button button--navy"
                disabled={loading || verifyCode.trim().length !== 6}
                data-testid="button-verify-2fa"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                <span>Verificar y activar</span>
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* VISTA 4: ÉXITO DE ACTIVACIÓN + CÓDIGOS DE RESPALDO */}
        {/* ============================================================ */}
        {view === 'success' && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                display: 'inline-flex',
                padding: 14,
                background: '#dcfce7',
                borderRadius: '50%',
                color: '#16a34a',
                marginBottom: 14,
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>
              Autenticación en dos fases ACTIVADA
            </h3>
            <p
              style={{
                fontSize: '0.86rem',
                color: '#64748b',
                lineHeight: 1.5,
                maxWidth: 420,
                margin: '0 auto 18px',
              }}
            >
              Tu cuenta ahora está protegida por SMS con Twilio Verify. Hemos generado y enviado tus códigos de respaldo
              a tu correo registrado.
            </p>

            {/* Cuadrícula de códigos de respaldo generados */}
            {backupCodes.length > 0 && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 18,
                  maxWidth: 440,
                  margin: '0 auto 20px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--navy)',
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    Tus códigos de respaldo (un solo uso)
                  </span>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={handleCopyBackupCodes}
                    style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Copy size={13} /> {copiedCodes ? '¡Copiados!' : 'Copiar todos'}
                  </button>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 8,
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--navy)',
                  }}
                >
                  {backupCodes.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        padding: '6px 10px',
                        borderRadius: 4,
                        textAlign: 'center',
                      }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
                <p style={{ margin: '12px 0 0', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                  Guarda estos códigos en un lugar seguro. Podrás consultarlos o regenerarlos en cualquier momento desde
                  Seguridad.
                </p>
              </div>
            )}

            <button
              type="button"
              className="button button--navy"
              onClick={() => setView('main')}
              style={{ minWidth: 160 }}
            >
              Finalizar
            </button>
          </div>
        )}
      </div>

      {/* Modal de Códigos de Respaldo */}
      {backupModalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setBackupModalOpen(false);
          }}
        >
          <div
            className="modal"
            style={{ maxWidth: 460 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="backup-codes-title"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3
                id="backup-codes-title"
                style={{ margin: 0, color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 700 }}
              >
                Códigos de respaldo
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setBackupModalOpen(false)}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>
              Cada uno de estos códigos puede utilizarse <strong>una sola vez</strong> si no tienes acceso a tu número
              celular registrado.
            </p>

            {loadingBackupCodes ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)', margin: '0 auto' }} />
                <span style={{ display: 'block', fontSize: '0.84rem', color: '#64748b', marginTop: 8 }}>
                  Cargando códigos...
                </span>
              </div>
            ) : (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 8,
                    fontFamily: 'monospace',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: 'var(--navy)',
                  }}
                >
                  {backupCodes.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        padding: '8px 10px',
                        borderRadius: 4,
                        textAlign: 'center',
                      }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="button button--outline"
                  style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={handleCopyBackupCodes}
                  disabled={loadingBackupCodes || backupCodes.length === 0}
                >
                  <Copy size={13} />
                  <span>{copiedCodes ? '¡Copiados!' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  className="button button--outline"
                  style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={handleRegenerateBackupCodes}
                  disabled={loadingBackupCodes}
                  title="Invalida los códigos anteriores y genera 8 nuevos"
                >
                  <RefreshCw size={13} />
                  <span>Regenerar</span>
                </button>
              </div>

              <button
                type="button"
                className="button button--navy"
                style={{ fontSize: '0.84rem', padding: '6px 16px' }}
                onClick={() => setBackupModalOpen(false)}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Desactivar 2FA */}
      {disableModalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setDisableModalOpen(false);
          }}
        >
          <div
            className="modal"
            style={{ maxWidth: 420 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="disable-2fa-title"
          >
            <h3
              id="disable-2fa-title"
              style={{ margin: '0 0 12px', color: 'var(--navy)', fontSize: '1.05rem', fontWeight: 700 }}
            >
              Desactivar autenticación en dos fases
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: 18 }}>
              Al desactivar la autenticación en dos fases, tu cuenta solo estará protegida por tu contraseña y los
              códigos de respaldo actuales quedarán invalidados. ¿Estás seguro de que deseas desactivarla?
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
