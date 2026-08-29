import React, { useState } from 'react';
import { KeyRound, Lock, ArrowRight, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../../firebase';
import { PasswordStrengthMeter, isPasswordValid } from './PasswordStrengthMeter';

interface UpdatePasswordScreenProps {
  currentUser: FirebaseUser | null;
  username?: string;
  onBack: () => void;
}

export const UpdatePasswordScreen: React.FC<UpdatePasswordScreenProps> = ({
  currentUser,
  username,
  onBack,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const displayUsername = username ? `@${username.replace(/^@/, '')}` : (currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@usuario');

  const handleForgotPassword = async () => {
    if (!currentUser?.email) return;
    setResetLoading(true);
    setFeedback(null);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setFeedback({
        type: 'success',
        message: `Hemos enviado un enlace de recuperación a ${currentUser.email}.`,
      });
    } catch (err: any) {
      console.error('Error al enviar correo de recuperación:', err);
      setFeedback({
        type: 'error',
        message: 'No se pudo enviar el correo de recuperación. Intenta más tarde.',
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.email) return;

    if (!isPasswordValid(newPassword)) {
      setFeedback({
        type: 'error',
        message: 'La nueva contraseña debe cumplir con todos los requisitos de seguridad.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'Las contraseñas no coinciden.',
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      // 1. Reautenticar con la contraseña actual
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // 2. Actualizar contraseña
      await updatePassword(currentUser, newPassword);

      // 3. Notificar al backend para registro de actividad y correo de confirmación
      fetch('/api/auth/account/password-changed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await currentUser.getIdToken()}`,
        },
        body: JSON.stringify({ email: currentUser.email }),
      }).catch((e) => console.warn('Error notify password-changed:', e));

      setFeedback({
        type: 'success',
        message: 'Tu contraseña ha sido actualizada con éxito.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error al actualizar contraseña:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setFeedback({ type: 'error', message: 'La contraseña actual es incorrecta.' });
      } else if (err.code === 'auth/too-many-requests') {
        setFeedback({ type: 'error', message: 'Demasiados intentos fallidos. Intenta más tarde.' });
      } else {
        setFeedback({ type: 'error', message: 'No se pudo actualizar la contraseña. Verifica tus datos.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscreen-container">
      {/* Encabezado fijo */}
      <div className="subscreen-header">
        <button
          type="button"
          className="subscreen-back-btn"
          onClick={onBack}
          aria-label="Regresar a configuración"
          data-testid="button-back-update-password"
        >
          ←
        </button>
        <div className="subscreen-title-wrap">
          <h2 className="subscreen-title">Actualizar contraseña</h2>
          <span className="subscreen-subtitle">{displayUsername}</span>
        </div>
      </div>

      <div className="subscreen-body">
        <p className="subscreen-intro">
          Cambia tu contraseña en cualquier momento para mantener tu cuenta segura.
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

        <form onSubmit={handleSubmit} className="account-info-form">
          {/* Contraseña actual */}
          <div className="form-field">
            <label className="form-label" htmlFor="current-pwd">
              Contraseña actual:
            </label>
            <div className="input-with-icon">
              <KeyRound size={15} className="input-icon" />
              <input
                id="current-pwd"
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Escribe tu contraseña actual"
                data-testid="input-current-password"
              />
            </div>
            <div style={{ marginTop: 6 }}>
              <button
                type="button"
                className="link-button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                data-testid="link-forgot-password"
              >
                {resetLoading ? 'Enviando enlace...' : '¿Olvidaste tu contraseña?'}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div className="form-field" style={{ marginTop: 16 }}>
            <label className="form-label" htmlFor="new-pwd">
              Nueva contraseña:
            </label>
            <div className="input-with-icon">
              <Lock size={15} className="input-icon" />
              <input
                id="new-pwd"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Escribe tu nueva contraseña"
                data-testid="input-new-password"
              />
            </div>

            {/* Checklist interactivo de requisitos de contraseña */}
            <PasswordStrengthMeter password={newPassword} />
          </div>

          {/* Confirmar Contraseña */}
          <div className="form-field" style={{ marginTop: 16 }}>
            <label className="form-label" htmlFor="confirm-pwd">
              Confirmar contraseña:
            </label>
            <div className="input-with-icon">
              <Lock size={15} className="input-icon" />
              <input
                id="confirm-pwd"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Vuelve a escribir la nueva contraseña"
                data-testid="input-confirm-new-password"
              />
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <span className="form-error-inline" style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>
                Las contraseñas no coinciden.
              </span>
            )}
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="button button--outline"
              onClick={onBack}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button button--navy"
              disabled={loading || !isPasswordValid(newPassword) || newPassword !== confirmPassword || !currentPassword}
              data-testid="button-submit-update-password"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
              <span>{loading ? 'Actualizando...' : 'Actualizar contraseña'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
