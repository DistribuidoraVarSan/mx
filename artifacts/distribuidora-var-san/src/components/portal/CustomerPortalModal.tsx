import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Laptop,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  User,
  Globe,
  ExternalLink,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { SettingsScreen, SettingsSubScreen } from './SettingsScreen';
import { AccountInfoScreen } from './AccountInfoScreen';
import { UpdatePasswordScreen } from './UpdatePasswordScreen';
import { DataDownloadScreen } from './DataDownloadScreen';
import { DeactivateAccountScreen } from './DeactivateAccountScreen';
import { SecurityScreen } from './SecurityScreen';
import { SessionsScreen } from './SessionsScreen';
import { StorageScreen } from './StorageScreen';
import { AdditionalResourcesScreen } from './AdditionalResourcesScreen';

export type PortalScreenView = 'main' | 'settings' | SettingsSubScreen;

interface CustomerPortalModalProps {
  isOpen: boolean;
  currentUser: FirebaseUser | null;
  profile: any;
  sessions: any[];
  securityActivities: any[];
  twoFactorStatus: any;
  loadingSessions: boolean;
  onClose: () => void;
  onProfileUpdate: (updated: any) => void;
  onTwoFactorChange: (status: any) => void;
  onRefreshSessions: () => void;
  onRevokeSession: (sessionId: string) => Promise<void>;
  onRevokeAllOthers: () => Promise<void>;
  onNavigateLegal: (path: '/privacidad' | '/cookies' | '/terminos') => void;
}

export const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({
  isOpen,
  currentUser,
  profile,
  sessions,
  securityActivities,
  twoFactorStatus,
  loadingSessions,
  onClose,
  onProfileUpdate,
  onTwoFactorChange,
  onRefreshSessions,
  onRevokeSession,
  onRevokeAllOthers,
  onNavigateLegal,
}) => {
  const [currentView, setCurrentView] = useState<PortalScreenView>('main');

  // Reset a vista principal cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCurrentView('main');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Obtener saludo dinámico según la hora del día
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Buenos días';
    }
    if (hour >= 12 && hour < 19) {
      return 'Buenas tardes';
    }
    return 'Buenas noches';
  };

  // 2. Construcción de Saludo utilizando Nombre + Apellido desde users/{uid}
  const cleanFirstName = typeof profile.name === 'string' ? profile.name.trim() : '';
  const cleanLastName = typeof profile.lastName === 'string' ? profile.lastName.trim() : '';
  const fullProfileName = [cleanFirstName, cleanLastName].filter(Boolean).join(' ');
  const userDisplayName = fullProfileName || (currentUser?.displayName ? currentUser.displayName.trim() : '');
  const displayGreetingTitle = userDisplayName ? `¡Hola, ${userDisplayName}!` : '¡Hola!';
  const displayGreetingSubtitle = `${getTimeGreeting()}, un gusto tenerte aquí de nuevo.`;

  const displayUsername = profile.username
    ? `@${profile.username.replace(/^@/, '')}`
    : (currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@usuario');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <div
      className="modal-backdrop animate-fade-in"
      role="presentation"
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
    >
      <section
        className="modal modal--wide customer-portal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-heading"
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar portal de cliente"
          data-testid="button-close-portal"
        >
          <X size={18} />
        </button>

        {/* VISTA 1: DASHBOARD PRINCIPAL DEL PORTAL */}
        {currentView === 'main' && (
          <div className="portal-main-container">
            {/* Encabezado con Saludo Dinámico */}
            <div className="portal-header" style={{ marginBottom: 20 }}>
              <span className="eyebrow" style={{ color: 'var(--gold)', letterSpacing: 2, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                PORTAL DE CLIENTE
              </span>
              <h2 id="portal-heading" style={{ color: 'var(--navy)', fontSize: '1.45rem', fontWeight: 800, margin: '6px 0 4px' }}>
                {displayGreetingTitle}
              </h2>
              <p className="modal-intro" style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>
                {displayGreetingSubtitle}
              </p>
            </div>

            {/* TARJETA DE INFORMACIÓN PRINCIPAL DEL USUARIO */}
            <div className="profile-summary-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(10,31,68,0.04)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px 20px' }}>
                {/* Nombre */}
                <div className="profile-data-field">
                  <span className="profile-data-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    <User size={13} /> Nombre
                  </span>
                  <strong className="profile-data-value" style={{ fontSize: '0.95rem', color: 'var(--navy)', display: 'block', marginTop: 2 }}>
                    {profile.name || 'No especificado'}
                  </strong>
                </div>

                {/* Apellido */}
                <div className="profile-data-field">
                  <span className="profile-data-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    <User size={13} /> Apellido
                  </span>
                  <strong className="profile-data-value" style={{ fontSize: '0.95rem', color: 'var(--navy)', display: 'block', marginTop: 2 }}>
                    {profile.lastName || 'No especificado'}
                  </strong>
                </div>

                {/* Empresa / Institución */}
                <div className="profile-data-field">
                  <span className="profile-data-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Building2 size={13} /> Empresa / Institución
                  </span>
                  <strong className="profile-data-value" style={{ fontSize: '0.95rem', color: 'var(--navy)', display: 'block', marginTop: 2 }}>
                    {profile.company || 'No especificada'}
                  </strong>
                </div>

                {/* Correo Electrónico */}
                <div className="profile-data-field">
                  <span className="profile-data-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Mail size={13} /> Correo electrónico
                  </span>
                  <strong className="profile-data-value" style={{ fontSize: '0.95rem', color: 'var(--navy)', display: 'block', marginTop: 2 }}>
                    {profile.email || currentUser?.email || 'No disponible'}
                  </strong>
                </div>

                {/* Número Celular */}
                <div className="profile-data-field">
                  <span className="profile-data-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Phone size={13} /> Número celular
                  </span>
                  <strong className="profile-data-value" style={{ fontSize: '0.95rem', color: 'var(--navy)', display: 'block', marginTop: 2 }}>
                    {profile.phone || 'No registrado'}
                  </strong>
                </div>

                {/* Usuario (@username) */}
                <div className="profile-data-field">
                  <span className="profile-data-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    <User size={13} /> Usuario
                  </span>
                  <strong className="profile-data-value" style={{ fontSize: '0.95rem', color: 'var(--navy)', fontWeight: 700, display: 'block', marginTop: 2 }}>
                    {displayUsername}
                  </strong>
                </div>

                {/* País */}
                <div className="profile-data-field">
                  <span className="profile-data-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Globe size={13} /> País
                  </span>
                  <strong className="profile-data-value" style={{ fontSize: '0.95rem', color: 'var(--navy)', display: 'block', marginTop: 2 }}>
                    {profile.country || 'México'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Insignias de Estado y Seguridad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
              {/* Estado de Cuenta */}
              <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Estado de cuenta</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#166534' }}>Activa</div>
                </div>
              </div>

              {/* Estado 2FA */}
              <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                {twoFactorStatus?.enabled ? (
                  <ShieldCheck size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
                ) : (
                  <ShieldAlert size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Seguridad 2FA</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: twoFactorStatus?.enabled ? '#166534' : '#b45309' }}>
                    {twoFactorStatus?.enabled ? 'Protegida' : 'Pendiente'}
                  </div>
                </div>
              </div>

              {/* Sesiones */}
              <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Laptop size={20} style={{ color: 'var(--navy)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Dispositivos</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--navy)' }}>
                    {sessions.length > 0 ? `${sessions.length} activo(s)` : 'Sesión actual'}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÓN PRINCIPAL DE AJUSTES Y CERRAR SESIÓN */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                className="button button--navy"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', fontSize: '0.92rem' }}
                onClick={() => setCurrentView('settings')}
                data-testid="button-open-settings"
              >
                <Settings size={16} />
                <span>Ajustes</span>
              </button>

              <button
                type="button"
                className="button button--outline"
                style={{ color: '#b91c1c', borderColor: '#fca5a5', fontSize: '0.86rem', padding: '8px 16px' }}
                onClick={handleLogout}
                data-testid="button-portal-logout"
              >
                <LogOut size={14} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}

        {/* VISTA 2: MENÚ DE CONFIGURACIÓN CON CATEGORÍAS */}
        {currentView === 'settings' && (
          <SettingsScreen
            currentUser={currentUser}
            username={profile.username}
            onSelectScreen={(screen) => setCurrentView(screen)}
            onBackToPortal={() => setCurrentView('main')}
          />
        )}

        {/* SUBPANTALLA: INFORMACIÓN DE CUENTA */}
        {currentView === 'account-info' && (
          <AccountInfoScreen
            currentUser={currentUser}
            profile={profile}
            onProfileUpdate={onProfileUpdate}
            onBack={() => setCurrentView('settings')}
          />
        )}

        {/* SUBPANTALLA: ACTUALIZAR CONTRASEÑA */}
        {currentView === 'update-password' && (
          <UpdatePasswordScreen
            currentUser={currentUser}
            username={profile.username}
            onBack={() => setCurrentView('settings')}
          />
        )}

        {/* SUBPANTALLA: DESCARGAR UN ARCHIVO CON TUS DATOS */}
        {currentView === 'data-download' && (
          <DataDownloadScreen
            currentUser={currentUser}
            profile={profile}
            sessions={sessions}
            securityActivities={securityActivities}
            username={profile.username}
            onBack={() => setCurrentView('settings')}
          />
        )}

        {/* SUBPANTALLA: DESACTIVAR TU CUENTA */}
        {currentView === 'deactivate' && (
          <DeactivateAccountScreen
            currentUser={currentUser}
            username={profile.username}
            onBack={() => setCurrentView('settings')}
            onDeactivated={() => {
              onClose();
            }}
          />
        )}

        {/* SUBPANTALLA: SEGURIDAD Y 2FA */}
        {currentView === 'security' && (
          <SecurityScreen
            currentUser={currentUser}
            username={profile.username}
            twoFactorStatus={twoFactorStatus}
            onStatusChange={onTwoFactorChange}
            onBack={() => setCurrentView('settings')}
          />
        )}

        {/* SUBPANTALLA: SESIONES Y DISPOSITIVOS */}
        {currentView === 'sessions' && (
          <SessionsScreen
            currentUser={currentUser}
            username={profile.username}
            sessions={sessions}
            loadingSessions={loadingSessions}
            onRefreshSessions={onRefreshSessions}
            onRevokeSession={onRevokeSession}
            onRevokeAllOthers={onRevokeAllOthers}
            onBack={() => setCurrentView('settings')}
          />
        )}

        {/* SUBPANTALLA: ALMACENAMIENTO */}
        {currentView === 'storage' && (
          <StorageScreen
            username={profile.username}
            onBack={() => setCurrentView('settings')}
          />
        )}

        {/* SUBPANTALLA: RECURSOS ADICIONALES */}
        {currentView === 'resources' && (
          <AdditionalResourcesScreen
            currentUser={currentUser}
            username={profile.username}
            autoBugReportEnabled={profile.autoBugReport}
            onBack={() => setCurrentView('settings')}
            onNavigateLegal={(path) => {
              onClose();
              onNavigateLegal(path);
            }}
          />
        )}
      </section>
    </div>
  );
};
