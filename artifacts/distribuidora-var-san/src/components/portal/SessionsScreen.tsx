import React, { useState } from 'react';
import { Laptop, Smartphone, Tablet, Globe, RefreshCw, Trash2, ShieldAlert, Loader2, CheckCircle2, ChevronRight, X } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface SessionItem {
  sessionId: string;
  isCurrent?: boolean;
  deviceType?: string;
  os?: string;
  browser?: string;
  ip?: string;
  country?: string;
  region?: string | null;
  lastActiveAt?: string | number;
  createdAt?: string | number;
}

interface SessionsScreenProps {
  currentUser: FirebaseUser | null;
  username?: string;
  sessions: SessionItem[];
  loadingSessions: boolean;
  onRefreshSessions: () => void;
  onRevokeSession: (sessionId: string) => Promise<void>;
  onRevokeAllOthers: () => Promise<void>;
  onBack: () => void;
}

export const SessionsScreen: React.FC<SessionsScreenProps> = ({
  currentUser,
  username,
  sessions,
  loadingSessions,
  onRefreshSessions,
  onRevokeSession,
  onRevokeAllOthers,
  onBack,
}) => {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const displayUsername = username ? `@${username.replace(/^@/, '')}` : (currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@usuario');

  const currentSession = sessions.find((s) => s.isCurrent) || sessions[0];
  const otherSessions = sessions.filter((s) => !s.isCurrent && s.sessionId !== currentSession?.sessionId);

  const renderDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone size={20} className="device-icon" />;
      case 'tablet':
        return <Tablet size={20} className="device-icon" />;
      default:
        return <Laptop size={20} className="device-icon" />;
    }
  };

  const formatSessionTime = (timeVal?: string | number) => {
    if (!timeVal) return 'Reciente';
    try {
      const d = new Date(timeVal);
      return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(timeVal);
    }
  };

  const handleRevokeSingle = async (sessionId: string) => {
    setRevokingId(sessionId);
    setFeedback(null);
    try {
      await onRevokeSession(sessionId);
      setFeedback({ type: 'success', message: 'Sesión revocada exitosamente.' });
      if (selectedSession?.sessionId === sessionId) {
        setSelectedSession(null);
      }
    } catch (err) {
      console.error('Error revoking session:', err);
      setFeedback({ type: 'error', message: 'No se pudo revocar la sesión.' });
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeOthersClick = async () => {
    setRevokingOthers(true);
    setFeedback(null);
    try {
      await onRevokeAllOthers();
      setFeedback({ type: 'success', message: 'Todas las demás sesiones han sido cerradas.' });
    } catch (err) {
      console.error('Error revoking others:', err);
      setFeedback({ type: 'error', message: 'No se pudieron cerrar las demás sesiones.' });
    } finally {
      setRevokingOthers(false);
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
          data-testid="button-back-sessions"
        >
          ←
        </button>
        <div className="subscreen-title-wrap">
          <h2 className="subscreen-title">Sesiones</h2>
          <span className="subscreen-subtitle">{displayUsername}</span>
        </div>
        <button
          type="button"
          className="sessions-refresh-icon-btn"
          onClick={onRefreshSessions}
          disabled={loadingSessions}
          title="Actualizar sesiones"
          aria-label="Actualizar sesiones"
        >
          <RefreshCw size={15} className={loadingSessions ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="subscreen-body">
        <p className="subscreen-intro">
          Consulta la información sobre cuándo iniciaste sesión en tu cuenta de Var San.
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

        {/* Notificación oficial de sesión actual */}
        <div className="current-session-notice" style={{ background: '#f8fafc', borderLeft: '4px solid var(--navy)', padding: '16px 18px', borderRadius: '0 8px 8px 0', marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--navy)', lineHeight: 1.5, fontWeight: 500 }}>
            Tienes una sesión abierta de esta cuenta de Var San en este dispositivo y la estás usando actualmente.
          </p>
        </div>

        {/* SESIÓN ACTIVA ACTUAL */}
        <div style={{ marginBottom: 24 }}>
          <span className="session-section-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
            Sesión activa actual
          </span>

          <div
            className="session-card session-card--current"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: '#ffffff', border: '1.5px solid #0a1f44', borderRadius: 10, cursor: 'pointer' }}
            onClick={() => setSelectedSession(currentSession)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ color: 'var(--navy)' }}>
                {renderDeviceIcon(currentSession?.deviceType)}
              </div>
              <div>
                <strong style={{ color: 'var(--navy)', fontSize: '0.94rem', display: 'block' }}>
                  {currentSession?.os || 'Dispositivo actual'} • {currentSession?.browser || 'Navegador'}
                </strong>
                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <span><Globe size={12} style={{ display: 'inline', marginRight: 3 }} /> {currentSession?.country || 'México'}</span>
                  <span style={{ color: '#166534', fontWeight: 700 }}>Activa ahora</span>
                </div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#94a3b8' }} />
          </div>
        </div>

        {/* OTRAS SESIONES */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="session-section-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
              Otras sesiones ({otherSessions.length})
            </span>
            {otherSessions.length > 0 && (
              <button
                type="button"
                className="link-button"
                style={{ color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600 }}
                onClick={handleRevokeOthersClick}
                disabled={revokingOthers}
                data-testid="button-revoke-all-others"
              >
                {revokingOthers ? 'Cerrando sesiones...' : 'Cerrar todas las otras sesiones'}
              </button>
            )}
          </div>

          {otherSessions.length === 0 ? (
            <div style={{ padding: 18, textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.85rem' }}>
              No tienes sesiones abiertas en otros dispositivos.
            </div>
          ) : (
            <div className="other-sessions-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {otherSessions.map((sess) => (
                <div
                  key={sess.sessionId}
                  className="session-card"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => setSelectedSession(sess)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ color: '#64748b' }}>
                      {renderDeviceIcon(sess.deviceType)}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--navy)', fontSize: '0.9rem', display: 'block' }}>
                        {sess.os || 'Dispositivo'} • {sess.browser || 'Navegador'}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {sess.country || 'Ubicación aproximada'} • {formatSessionTime(sess.lastActiveAt)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      className="button button--outline"
                      style={{ color: '#b91c1c', borderColor: '#fca5a5', padding: '5px 10px', fontSize: '0.76rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevokeSingle(sess.sessionId);
                      }}
                      disabled={revokingId === sess.sessionId}
                      title="Cerrar esta sesión"
                    >
                      {revokingId === sess.sessionId ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      <span>Cerrar sesión</span>
                    </button>
                    <ChevronRight size={15} style={{ color: '#cbd5e1' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalle de Sesión */}
      {selectedSession && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.currentTarget === e.target) setSelectedSession(null); }}>
          <div className="modal" style={{ maxWidth: 440 }} role="dialog" aria-modal="true" aria-labelledby="session-detail-title">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 id="session-detail-title" style={{ margin: 0, color: 'var(--navy)', fontSize: '1.05rem', fontWeight: 700 }}>
                Detalles del dispositivo
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedSession(null)}
                aria-label="Cerrar detalles"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.86rem', color: '#334155' }}>
              <div>
                <strong>Sistema operativo:</strong> {selectedSession.os || 'No especificado'}
              </div>
              <div>
                <strong>Navegador:</strong> {selectedSession.browser || 'No especificado'}
              </div>
              <div>
                <strong>Tipo de dispositivo:</strong> {selectedSession.deviceType || 'Escritorio'}
              </div>
              <div>
                <strong>Ubicación aproximada:</strong> {selectedSession.country || 'México'} {selectedSession.region ? `(${selectedSession.region})` : ''}
              </div>
              <div>
                <strong>Dirección IP:</strong> {selectedSession.ip || '127.0.0.1'}
              </div>
              <div>
                <strong>Última actividad:</strong> {formatSessionTime(selectedSession.lastActiveAt)}
              </div>
              {selectedSession.isCurrent && (
                <div style={{ color: '#166534', fontWeight: 700, marginTop: 4 }}>
                  ✓ Este es tu dispositivo actual.
                </div>
              )}
            </div>

            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {!selectedSession.isCurrent && (
                <button
                  type="button"
                  className="button button--navy"
                  style={{ background: '#b91c1c', borderColor: '#b91c1c' }}
                  onClick={() => handleRevokeSingle(selectedSession.sessionId)}
                  disabled={revokingId === selectedSession.sessionId}
                >
                  {revokingId === selectedSession.sessionId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  <span>Cerrar esta sesión</span>
                </button>
              )}
              <button
                type="button"
                className="button button--outline"
                onClick={() => setSelectedSession(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
