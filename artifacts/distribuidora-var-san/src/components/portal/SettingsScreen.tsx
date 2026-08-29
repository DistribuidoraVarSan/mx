import React from 'react';
import {
  ChevronRight,
  User,
  KeyRound,
  Download,
  AlertTriangle,
  ShieldCheck,
  Laptop,
  HardDrive,
  HelpCircle,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

export type SettingsSubScreen =
  | 'account-info'
  | 'update-password'
  | 'data-download'
  | 'deactivate'
  | 'security'
  | 'sessions'
  | 'storage'
  | 'resources';

interface SettingsScreenProps {
  currentUser: FirebaseUser | null;
  username?: string;
  onSelectScreen: (screen: SettingsSubScreen) => void;
  onBackToPortal: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentUser,
  username,
  onSelectScreen,
  onBackToPortal,
}) => {
  const displayUsername = username ? `@${username.replace(/^@/, '')}` : (currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@usuario');

  return (
    <div className="settings-screen-container">
      {/* Encabezado Principal de Configuración */}
      <div className="settings-header">
        <button
          type="button"
          className="subscreen-back-btn"
          onClick={onBackToPortal}
          aria-label="Volver al portal principal"
          data-testid="button-back-to-portal"
        >
          ←
        </button>
        <div className="settings-header-titles">
          <h2 className="settings-main-title">Configuración</h2>
          <span className="settings-username-badge">{displayUsername}</span>
        </div>
      </div>

      <div className="settings-body">
        {/* SECCIÓN 1: TU CUENTA */}
        <div className="settings-category-group">
          <span className="settings-category-label">— Tu cuenta</span>

          <div className="settings-rows-card">
            {/* Información de cuenta */}
            <button
              type="button"
              className="settings-nav-row"
              onClick={() => onSelectScreen('account-info')}
              data-testid="row-account-info"
            >
              <div className="nav-row-icon-wrap">
                <User size={18} className="nav-row-icon" />
              </div>
              <div className="nav-row-content">
                <span className="nav-row-title">Información de cuenta</span>
                <span className="nav-row-desc">
                  Consulta la información de tu cuenta, como el número de teléfono y la dirección de correo electrónico.
                </span>
              </div>
              <ChevronRight size={18} className="nav-row-arrow" />
            </button>

            {/* Cambia tu contraseña */}
            <button
              type="button"
              className="settings-nav-row"
              onClick={() => onSelectScreen('update-password')}
              data-testid="row-update-password"
            >
              <div className="nav-row-icon-wrap">
                <KeyRound size={18} className="nav-row-icon" />
              </div>
              <div className="nav-row-content">
                <span className="nav-row-title">Cambia tu contraseña</span>
                <span className="nav-row-desc">
                  Cambia tu contraseña en cualquier momento.
                </span>
              </div>
              <ChevronRight size={18} className="nav-row-arrow" />
            </button>

            {/* Descargar un archivo con tus datos */}
            <button
              type="button"
              className="settings-nav-row"
              onClick={() => onSelectScreen('data-download')}
              data-testid="row-data-download"
            >
              <div className="nav-row-icon-wrap">
                <Download size={18} className="nav-row-icon" />
              </div>
              <div className="nav-row-content">
                <span className="nav-row-title">Descargar un archivo con tus datos</span>
                <span className="nav-row-desc">
                  Hazte una idea del tipo de información que se almacena de tu cuenta.
                </span>
              </div>
              <ChevronRight size={18} className="nav-row-arrow" />
            </button>

            {/* Desactiva tu cuenta */}
            <button
              type="button"
              className="settings-nav-row settings-nav-row--danger"
              onClick={() => onSelectScreen('deactivate')}
              data-testid="row-deactivate-account"
            >
              <div className="nav-row-icon-wrap nav-row-icon-wrap--danger">
                <AlertTriangle size={18} className="nav-row-icon" />
              </div>
              <div className="nav-row-content">
                <span className="nav-row-title">Desactiva tu cuenta</span>
                <span className="nav-row-desc">
                  Averigua cómo puedes desactivar tu cuenta.
                </span>
              </div>
              <ChevronRight size={18} className="nav-row-arrow" />
            </button>
          </div>
        </div>

        {/* SECCIÓN 2: SEGURIDAD Y ACCESO A LA CUENTA */}
        <div className="settings-category-group">
          <span className="settings-category-label">— Seguridad y acceso a la cuenta</span>

          <div className="settings-rows-card">
            {/* Seguridad */}
            <button
              type="button"
              className="settings-nav-row"
              onClick={() => onSelectScreen('security')}
              data-testid="row-security-2fa"
            >
              <div className="nav-row-icon-wrap">
                <ShieldCheck size={18} className="nav-row-icon" />
              </div>
              <div className="nav-row-content">
                <span className="nav-row-title">Seguridad</span>
                <span className="nav-row-desc">
                  Administra la seguridad de tu cuenta.
                </span>
              </div>
              <ChevronRight size={18} className="nav-row-arrow" />
            </button>

            {/* Aplicaciones y sesiones */}
            <button
              type="button"
              className="settings-nav-row"
              onClick={() => onSelectScreen('sessions')}
              data-testid="row-sessions"
            >
              <div className="nav-row-icon-wrap">
                <Laptop size={18} className="nav-row-icon" />
              </div>
              <div className="nav-row-content">
                <span className="nav-row-title">Aplicaciones y sesiones</span>
                <span className="nav-row-desc">
                  Consulta la información sobre cuándo iniciaste sesión en tu cuenta de Var San.
                </span>
              </div>
              <ChevronRight size={18} className="nav-row-arrow" />
            </button>
          </div>
        </div>

        {/* SECCIÓN 3: ALMACENAMIENTO */}
        <div className="settings-category-group">
          <span className="settings-category-label">— Almacenamiento</span>

          <div className="settings-rows-card">
            <button
              type="button"
              className="settings-nav-row"
              onClick={() => onSelectScreen('storage')}
              data-testid="row-storage"
            >
              <div className="nav-row-icon-wrap">
                <HardDrive size={18} className="nav-row-icon" />
              </div>
              <div className="nav-row-content">
                <span className="nav-row-title">Almacenamiento</span>
                <span className="nav-row-desc">
                  Administra cómo Var San usa el almacenamiento de este dispositivo.
                </span>
              </div>
              <ChevronRight size={18} className="nav-row-arrow" />
            </button>
          </div>
        </div>

        {/* SECCIÓN 4: RECURSOS ADICIONALES */}
        <div className="settings-category-group">
          <span className="settings-category-label">— Recursos adicionales</span>

          <div className="settings-rows-card">
            <button
              type="button"
              className="settings-nav-row"
              onClick={() => onSelectScreen('resources')}
              data-testid="row-resources"
            >
              <div className="nav-row-icon-wrap">
                <HelpCircle size={18} className="nav-row-icon" />
              </div>
              <div className="nav-row-content">
                <span className="nav-row-title">Recursos adicionales</span>
                <span className="nav-row-desc">
                  Consulta otros lugares para obtener más información útil sobre los productos y servicios de Var San.
                </span>
              </div>
              <ChevronRight size={18} className="nav-row-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
