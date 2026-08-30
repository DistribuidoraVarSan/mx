import React, { useState, useEffect } from 'react';
import { Download, ShieldCheck, Mail, Loader2, CheckCircle2, Clock, FileArchive, Send } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { createZipArchive } from './zipHelper';
import { getApiBaseUrl } from '../../lib/session-client';

interface DataDownloadScreenProps {
  currentUser: FirebaseUser | null;
  profile: any;
  sessions: any[];
  securityActivities: any[];
  username?: string;
  onBack: () => void;
}

export const DataDownloadScreen: React.FC<DataDownloadScreenProps> = ({
  currentUser,
  profile,
  sessions,
  securityActivities,
  username,
  onBack,
}) => {
  // Estados de verificación y flujo
  const [isVerified, setIsVerified] = useState(false);
  const [code, setCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estados de solicitud de archivo
  const [requestStatus, setRequestStatus] = useState<'idle' | 'requested' | 'ready'>('idle');
  const [requestTimestamp, setRequestTimestamp] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const displayUsername = username ? `@${username.replace(/^@/, '')}` : (currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@usuario');

  // Enviar código automáticamente al montar la pantalla si no está verificado
  useEffect(() => {
    if (!isVerified) {
      handleRequestCode();
    }
  }, []);

  // Temporizador para reenvío
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Cargar estado de solicitud previo si existe en localStorage
  useEffect(() => {
    if (!currentUser?.uid) return;
    const stored = localStorage.getItem(`dvs_data_export_req_${currentUser.uid}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRequestStatus(parsed.status || 'requested');
        setRequestTimestamp(parsed.timestamp || Date.now());
      } catch {
        // Ignore JSON error
      }
    }
  }, [currentUser?.uid]);

  const handleRequestCode = async () => {
    if (!currentUser || sendingCode || resendCooldown > 0) return;
    setSendingCode(true);
    setFeedback(null);

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${getApiBaseUrl()}/auth/data-export/request-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: 'Hemos enviado un código de 6 dígitos a tu correo electrónico.',
        });
        setResendCooldown(60);
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'No se pudo enviar el código de verificación.',
        });
      }
    } catch (err) {
      console.error('Error request export code:', err);
      setFeedback({ type: 'error', message: 'Error de conexión al solicitar el código.' });
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || verifying || code.trim().length !== 6) return;
    setVerifying(true);
    setFeedback(null);

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${getApiBaseUrl()}/auth/data-export/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setIsVerified(true);
        setFeedback(null);
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Código incorrecto o expirado.',
        });
      }
    } catch (err) {
      console.error('Error verify export code:', err);
      setFeedback({ type: 'error', message: 'Error al verificar el código.' });
    } finally {
      setVerifying(false);
    }
  };

  const handleRequestDataExport = () => {
    if (!currentUser?.uid) return;
    const now = Date.now();
    setRequestStatus('requested');
    setRequestTimestamp(now);
    localStorage.setItem(
      `dvs_data_export_req_${currentUser.uid}`,
      JSON.stringify({ status: 'requested', timestamp: now }),
    );
    setFeedback({
      type: 'success',
      message: 'Solicitud registrada. Preparando el archivo con tus datos.',
    });
  };

  const handleDownloadZip = () => {
    setDownloading(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const safeUser = (profile.username || currentUser?.email?.split('@')[0] || 'usuario').replace(/[^a-zA-Z0-9_-]/g, '');

      // 1. Datos de Perfil
      const profileData = {
        empresa: 'Distribuidora Var San S.A. de C.V.',
        fecha_exportacion: new Date().toISOString(),
        usuario_id: currentUser?.uid || '',
        nombre: profile.name || '',
        apellido: profile.lastName || '',
        nombre_usuario: profile.username || displayUsername,
        correo_electronico: profile.email || currentUser?.email || '',
        numero_celular: profile.phone || '',
        empresa_institucion: profile.company || '',
        pais: profile.country || 'México',
        idioma_preferido: profile.preferredLanguage || 'es',
        creado_en: profile.createdAt || '',
      };

      // 2. Archivo Léame / Legal
      const legalText = `=====================================================
DISTRIBUIDORA VAR SAN — ARCHIVO DE DATOS DE USUARIO
=====================================================
Exportación generada el: ${new Date().toLocaleString('es-MX')}
Titular de la cuenta: ${profile.name || ''} ${profile.lastName || ''} (${displayUsername})
Correo electrónico: ${profile.email || currentUser?.email || ''}

Este archivo contiene la copia íntegra de la información personal,
actividad de seguridad, sesiones y configuración registradas en el
Portal de Cliente de Distribuidora Var San, de conformidad con las
disposiciones de privacidad aplicables y el Aviso de Privacidad vigente.

CONTENIDO DE ESTE PAQUETE ZIP:
- perfil.json: Datos de cuenta e identidad corporativa.
- sesiones_activas.json: Historial de dispositivos y sesiones.
- actividad_seguridad.json: Bitácora de eventos y auditoría.
- informacion_cuenta.txt: Resumen en texto plano.

Distribuidora Var San S.A. de C.V.
Calidad y confianza en cada suministro.
https://distribuidoravarsan.com.mx
`;

      const accountSummaryText = `RESUMEN DE CUENTA — DISTRIBUIDORA VAR SAN
-----------------------------------------------------
Nombre completo: ${profile.name || ''} ${profile.lastName || ''}
Nombre de usuario: ${displayUsername}
Correo: ${profile.email || currentUser?.email || ''}
Teléfono: ${profile.phone || 'No registrado'}
Empresa / Institución: ${profile.company || 'No especificada'}
País: ${profile.country || 'México'}
Estado de cuenta: Activa
`;

      const zipBlob = createZipArchive([
        { name: 'perfil.json', content: JSON.stringify(profileData, null, 2) },
        { name: 'sesiones_activas.json', content: JSON.stringify(sessions || [], null, 2) },
        { name: 'actividad_seguridad.json', content: JSON.stringify(securityActivities || [], null, 2) },
        { name: 'informacion_cuenta.txt', content: accountSummaryText },
        { name: 'LEAME_DISTRIBUIDORA_VAR_SAN.txt', content: legalText },
      ]);

      // Disparar descarga en navegador
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VarSan_Datos_${safeUser}_${dateStr}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setFeedback({
        type: 'success',
        message: 'Archivo ZIP descargado exitosamente.',
      });
    } catch (err) {
      console.error('Error generating data export ZIP:', err);
      setFeedback({ type: 'error', message: 'No se pudo generar el archivo ZIP de datos.' });
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!currentUser) return;
    setSendingEmail(true);
    setFeedback(null);

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${getApiBaseUrl()}/auth/data-export/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Hemos enviado una copia y resumen de tus datos a ${currentUser.email}.`,
        });
      } else {
        setFeedback({ type: 'error', message: 'No se pudo enviar el correo con los datos.' });
      }
    } catch (err) {
      console.error('Error sending export email:', err);
      setFeedback({ type: 'error', message: 'Error de red al enviar el correo.' });
    } finally {
      setSendingEmail(false);
    }
  };

  // PASO 1: VERIFICACIÓN DE IDENTIDAD CON CÓDIGO DE 6 DÍGITOS
  if (!isVerified) {
    return (
      <div className="subscreen-container">
        <div className="subscreen-header">
          <button
            type="button"
            className="subscreen-back-btn"
            onClick={onBack}
            aria-label="Regresar a configuración"
            data-testid="button-back-data-verify"
          >
            ←
          </button>
          <div className="subscreen-title-wrap">
            <h2 className="subscreen-title">Verifica tu identidad</h2>
            <span className="subscreen-subtitle">{displayUsername}</span>
          </div>
        </div>

        <div className="subscreen-body">
          <div className="security-notice-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 18, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 20 }}>
            <ShieldCheck size={24} style={{ color: 'var(--navy)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: 'var(--navy)', fontSize: '0.92rem', display: 'block', marginBottom: 4 }}>
                Protección de tus datos personales
              </strong>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                Hemos enviado un código de 6 dígitos a tu correo electrónico{' '}
                <strong>{currentUser?.email}</strong> para confirmar tu identidad antes de permitir la descarga.
              </p>
            </div>
          </div>

          {feedback && (
            <div
              className={`account-message account-message--${feedback.type === 'success' ? 'success' : 'warning'}`}
              role={feedback.type === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              style={{ marginBottom: 16 }}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={15} /> : null}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="identity-verify-form" style={{ maxWidth: 360, margin: '0 auto', textAlign: 'center' }}>
            <label className="form-label" htmlFor="export-code" style={{ marginBottom: 10, display: 'block', textAlign: 'center' }}>
              Introduce el código de 6 dígitos:
            </label>

            <input
              id="export-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              className="form-input code-input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="_ _ _ _ _ _"
              style={{
                textAlign: 'center',
                letterSpacing: 10,
                fontSize: '1.4rem',
                fontWeight: 700,
                padding: '12px 16px',
                fontFamily: 'monospace',
                marginBottom: 16,
              }}
              autoFocus
              required
              data-testid="input-data-export-code"
            />

            <button
              type="submit"
              className="button button--navy"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.92rem' }}
              disabled={verifying || code.trim().length !== 6}
              data-testid="button-verify-data-export-code"
            >
              {verifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              <span>{verifying ? 'Verificando...' : 'Verificar'}</span>
            </button>

            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                className="link-button"
                onClick={handleRequestCode}
                disabled={sendingCode || resendCooldown > 0}
                data-testid="button-resend-data-code"
              >
                {sendingCode
                  ? 'Enviando nuevo código...'
                  : resendCooldown > 0
                  ? `Reenviar código en (${resendCooldown}s)`
                  : '¿No recibiste el código? Reenviar código'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // PASO 2: PANTALLA PRINCIPAL DE DESCARGA DE DATOS
  return (
    <div className="subscreen-container">
      <div className="subscreen-header">
        <button
          type="button"
          className="subscreen-back-btn"
          onClick={onBack}
          aria-label="Regresar a configuración"
          data-testid="button-back-data-download"
        >
          ←
        </button>
        <div className="subscreen-title-wrap">
          <h2 className="subscreen-title">Descarga un archivo con tus datos</h2>
          <span className="subscreen-subtitle">{displayUsername}</span>
        </div>
      </div>

      <div className="subscreen-body">
        <p className="subscreen-intro">
          Obtén información sobre el tipo de datos que se almacenan en tu cuenta.
        </p>

        {feedback && (
          <div
            className={`account-message account-message--${feedback.type === 'success' ? 'success' : 'warning'}`}
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            style={{ marginBottom: 18 }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={15} /> : null}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="data-export-section" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 22, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <FileArchive size={22} style={{ color: 'var(--navy)' }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--navy)', fontWeight: 700 }}>
              Datos de Var San
            </h3>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
            Puedes solicitar un archivo ZIP que contenga la información de tu cuenta, el historial de la cuenta, las aplicaciones y los dispositivos, la actividad de la cuenta, los intereses y los datos de anuncios. Recibirás una notificación en la aplicación cuando el archivo con tus datos esté listo para descargar.
          </p>

          {/* Tarjeta de estado de solicitud inmediata */}
          <div style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '16px 18px', borderRadius: '0 8px 8px 0', margin: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
              <strong style={{ color: '#166534', fontSize: '0.9rem' }}>Identidad verificada</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#14532d', lineHeight: 1.5 }}>
              Tu archivo de datos está listo para descargarse de inmediato. Puedes descargarlo en formato ZIP o recibir un respaldo en tu correo registrado.
            </p>
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
            <button
              type="button"
              className="button button--navy"
              onClick={handleDownloadZip}
              disabled={downloading}
              data-testid="button-download-zip"
            >
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              <span>{downloading ? 'Generando archivo...' : 'Descarga el ZIP'}</span>
            </button>

            <button
              type="button"
              className="button button--outline"
              onClick={handleSendEmail}
              disabled={sendingEmail}
              style={{ color: 'var(--navy)' }}
              data-testid="button-send-data-email"
            >
              {sendingEmail ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
              <span>{sendingEmail ? 'Enviando...' : 'Enviar al correo electrónico'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
