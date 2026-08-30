import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../firebase';
import { getApiBaseUrl, send2FALoginCode, verify2FALoginCode } from '../../lib/session-client';
import { OrganizationSelector } from './OrganizationSelector';
import { PasswordStrengthMeter, isPasswordValid } from './PasswordStrengthMeter';
import { validateUsernameFormat, checkUsernameAvailability } from './usernameValidator';
import { AuthCharacters, CharacterFormState } from './AuthCharacters';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  language: string;
  onClose: () => void;
  onAuthSuccess: () => void;
  onRequires2FA?: (user: any) => void;
}

const isValidEmail = (emailStr: string) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(emailStr.trim()) && !emailStr.includes('..') && !emailStr.endsWith('.');
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  language,
  onClose,
  onAuthSuccess,
  onRequires2FA,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot-password' | '2fa-challenge'>(initialTab);

  // Campos de formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');

  // Estados de reto 2FA en login
  const [pending2FAUser, setPending2FAUser] = useState<any>(null);
  const [pending2FAUid, setPending2FAUid] = useState('');
  const [pending2FAMethod, setPending2FAMethod] = useState<'email' | 'sms'>('sms');
  const [pending2FATarget, setPending2FATarget] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorCooldown, setTwoFactorCooldown] = useState(0);
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);


  // Estados de recuperación de contraseña con código de 6 dígitos
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resolvedResetEmail, setResolvedResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  // Visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Foco de campo para animación de personajes
  const [focusedField, setFocusedField] = useState<
    | 'email'
    | 'password'
    | 'confirmPassword'
    | 'name'
    | 'lastName'
    | 'username'
    | 'company'
    | 'phone'
    | 'reset-code'
    | 'reset-password'
    | 'two-factor-code'
    | null
  >(null);

  // Estado de comprobación de username
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ available: boolean; error?: string } | null>(null);

  // Estados de carga y mensajes
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isSuccessAnim, setIsSuccessAnim] = useState(false);

  // Cooldown de reenvío para 2FA
  useEffect(() => {
    if (twoFactorCooldown <= 0) return;
    const timer = setInterval(() => {
      setTwoFactorCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [twoFactorCooldown]);

  useEffect(() => {
    setTab(initialTab);
    setFeedback(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFocusedField(null);
    setIsSuccessAnim(false);
    setResetStep(1);
    setResetCode('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setTwoFactorCode('');
    setPending2FAUser(null);
    setPending2FAUid('');
  }, [initialTab, isOpen]);

  // Debounce para validación de disponibilidad de username
  useEffect(() => {
    if (tab !== 'register') return;
    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUser) {
      setUsernameStatus(null);
      return;
    }

    const localCheck = validateUsernameFormat(cleanUser);
    if (!localCheck.valid) {
      setUsernameStatus({ available: false, error: localCheck.error });
      return;
    }

    setUsernameChecking(true);
    const timeout = setTimeout(async () => {
      const result = await checkUsernameAvailability(cleanUser);
      setUsernameStatus({ available: result.valid, error: result.error });
      setUsernameChecking(false);
    }, 450);

    return () => clearTimeout(timeout);
  }, [username, tab]);

  if (!isOpen) return null;

  // Determinar estado de los personajes animados
  let characterState: CharacterFormState = 'idle';
  if (isSuccessAnim) {
    characterState = 'success';
  } else if (feedback?.type === 'error') {
    characterState = 'error';
  } else if (
    focusedField === 'password' ||
    focusedField === 'confirmPassword' ||
    focusedField === 'reset-password'
  ) {
    const isShowing =
      focusedField === 'reset-password' ? showResetPassword : showPassword;
    characterState = isShowing ? 'password-visible' : 'password-hidden';
  } else if (focusedField === 'email' || focusedField === 'reset-code') {
    characterState = 'email';
  } else if (focusedField === 'name' || focusedField === 'lastName') {
    characterState = 'name';
  } else if (focusedField === 'username') {
    characterState = 'username';
  } else if (focusedField === 'company') {
    characterState = 'company';
  } else if (focusedField === 'phone') {
    characterState = 'phone';
  }

  // Manejo de envío de login/registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validaciones previas en Registro
    if (tab === 'register') {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
        setFeedback({
          type: 'error',
          message: 'Ingresa un correo electrónico válido.',
        });
        return;
      }
      if (!isPasswordValid(password)) {
        setFeedback({
          type: 'error',
          message: 'La contraseña no cumple con todos los requisitos de seguridad.',
        });
        return;
      }
      if (password !== confirmPassword) {
        setFeedback({
          type: 'error',
          message: 'Las contraseñas no coinciden.',
        });
        return;
      }
      const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
      const userCheck = validateUsernameFormat(cleanUser);
      if (!userCheck.valid) {
        setFeedback({
          type: 'error',
          message: userCheck.error || 'Este usuario no está disponible.',
        });
        return;
      }
      if (usernameStatus && !usernameStatus.available) {
        setFeedback({
          type: 'error',
          message: usernameStatus.error || 'Este usuario no está disponible.',
        });
        return;
      }
    }

    setLoading(true);

    try {
      if (tab === 'login') {
        let loginEmail = email.trim();

        // Si el usuario ingresó un nombre de usuario (ej. @manuel o manuel sin @)
        if (!loginEmail.includes('@') || !loginEmail.includes('.')) {
          const res = await fetch(`${getApiBaseUrl()}/auth/resolve-identifier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: loginEmail }),
          });
          const data = await res.json();
          if (!res.ok || !data.email) {
            setFeedback({
              type: 'error',
              message: 'No se encontró ninguna cuenta con este usuario o correo.',
            });
            setLoading(false);
            return;
          }
          loginEmail = data.email;
        }

        const credential = await signInWithEmailAndPassword(auth, loginEmail, password);

        // Comprobar si el usuario tiene autenticación en dos fases activa
        try {
          const userDocSnap = await getDoc(doc(db, 'users', credential.user.uid));
          const twoFactorData = userDocSnap.exists() ? userDocSnap.data()?.twoFactor : null;

          if (twoFactorData?.enabled === true) {
            setLoading(true);
            const res2fa = await send2FALoginCode(credential.user.uid, language);
            if (res2fa.success && res2fa.enabled !== false) {
              setPending2FAUser(credential.user);
              setPending2FAUid(credential.user.uid);
              setPending2FAMethod((twoFactorData.method as 'email' | 'sms') || 'email');
              setPending2FATarget(res2fa.maskedTarget || (twoFactorData.method === 'sms' ? twoFactorData.phone : credential.user.email) || '');
              setTab('2fa-challenge');
              setTwoFactorCode('');
              setTwoFactorCooldown(30);
              setLoading(false);
              return;
            }
          }
        } catch (twoFactorErr) {
          console.warn('No se pudo verificar 2FA:', twoFactorErr);
        }

        // Si no tiene 2FA activado, completar inicio de sesión normalmente
        setIsSuccessAnim(true);

        setTimeout(() => {
          if (onRequires2FA) {
            onRequires2FA(credential.user);
          }
          onAuthSuccess();
          onClose();
        }, 550);
      } else {
        // Registro de nueva cuenta
        const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
        const finalCheck = await checkUsernameAvailability(cleanUser);
        if (!finalCheck.valid) {
          setFeedback({
            type: 'error',
            message: finalCheck.error || 'Este usuario no está disponible.',
          });
          setLoading(false);
          return;
        }

        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

        const fullName = `${name.trim()} ${lastName.trim()}`.trim();
        await updateProfile(credential.user, {
          displayName: fullName || cleanUser,
        }).catch(() => {});

        // Guardar perfil completo en Firestore
        await setDoc(doc(db, 'users', credential.user.uid), {
          name: name.trim(),
          lastName: lastName.trim(),
          company: company.trim(),
          phone: phone.trim(),
          username: cleanUser,
          email: email.trim(),
          country: 'México',
          preferredLanguage: language || 'es',
          autoBugReport: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Registrar username único en colección usernames/{username}
        await setDoc(doc(db, 'usernames', cleanUser), {
          uid: credential.user.uid,
          createdAt: serverTimestamp(),
        });

        // Enviar correo de bienvenida institucional desde no-reply@distribuidoravarsan.com.mx
        try {
          await fetch(`${getApiBaseUrl()}/auth/welcome-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim(),
              name: name.trim() || cleanUser,
              username: cleanUser,
              language: language || 'es',
            }),
          });
        } catch (mailErr) {
          console.warn('No se pudo enviar correo de bienvenida:', mailErr);
        }

        setIsSuccessAnim(true);

        setTimeout(() => {
          onAuthSuccess();
          onClose();
        }, 550);
      }
    } catch (err: any) {
      console.error('Error autenticación:', err);
      let msg = 'Ocurrió un error al procesar tu solicitud.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = 'Correo electrónico, usuario o contraseña incorrectos.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Ya existe una cuenta con este correo electrónico.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'La contraseña debe tener al menos 8 caracteres y cumplir los requisitos de seguridad.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Ingresa un correo electrónico válido.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Demasiados intentos fallidos. Por favor, intenta más tarde o restablece tu contraseña.';
      }
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Manejador del flujo de recuperación con código de 6 dígitos
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor, escribe tu correo electrónico o nombre de usuario.',
      });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/password-reset/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: resetIdentifier.trim(),
          language: language || 'es',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'No se pudo enviar el código de recuperación.' });
        return;
      }

      setResolvedResetEmail(data.email || resetIdentifier.trim());
      setResetStep(2);
      setFeedback({
        type: 'success',
        message: 'Hemos enviado un código de 6 dígitos a tu correo registrado.',
      });
    } catch (err) {
      console.error('Error request reset code:', err);
      setFeedback({
        type: 'error',
        message: 'Error de conexión con el servidor. Intenta de nuevo en unos momentos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || resetCode.trim().length !== 6) {
      setFeedback({ type: 'error', message: 'El código debe tener 6 dígitos.' });
      return;
    }
    if (!isPasswordValid(resetNewPassword)) {
      setFeedback({
        type: 'error',
        message: 'La nueva contraseña no cumple los requisitos de seguridad.',
      });
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setFeedback({ type: 'error', message: 'Las contraseñas no coinciden.' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/password-reset/verify-and-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resolvedResetEmail,
          code: resetCode.trim(),
          newPassword: resetNewPassword,
          language: language || 'es',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Error al actualizar contraseña.' });
        return;
      }

      setFeedback({
        type: 'success',
        message: '¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.',
      });
      setTab('login');
      setResetStep(1);
      setResetCode('');
      setResetNewPassword('');
      setResetConfirmPassword('');
    } catch (err) {
      console.error('Error verify and update password:', err);
      setFeedback({ type: 'error', message: 'Error de conexión al actualizar contraseña.' });
    } finally {
      setLoading(false);
    }
  };

  // Manejador de verificación de código 2FA o código de respaldo en login
  const handleVerify2FALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = twoFactorCode.trim();
    if (!pending2FAUid || cleanCode.length < 6) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await verify2FALoginCode(pending2FAUid, cleanCode);
      if (res.success) {
        setIsSuccessAnim(true);
        setTimeout(() => {
          if (onRequires2FA && pending2FAUser) {
            onRequires2FA(pending2FAUser);
          }
          onAuthSuccess();
          onClose();
        }, 550);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Código incorrecto o expirado.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error de conexión al verificar el código.' });
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código 2FA en login
  const handleResend2FALoginCode = async () => {
    if (twoFactorCooldown > 0 || !pending2FAUid) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await send2FALoginCode(pending2FAUid, language);
      if (res.success) {
        setTwoFactorCooldown(30);
        setFeedback({ type: 'success', message: 'Nuevo código de verificación enviado.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'No se pudo reenviar el código.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error al reenviar el código de verificación.' });
    } finally {
      setLoading(false);
    }
  };

  // Cancelar login 2FA
  const handleCancel2FALogin = async () => {
    try {
      await signOut(auth);
    } catch {}
    setPending2FAUser(null);
    setPending2FAUid('');
    setTwoFactorCode('');
    setTab('login');
    setFeedback(null);
  };

  // Inicio de sesión con Google
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setFeedback(null);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', credential.user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        const defaultUsername = (credential.user.email?.split('@')[0] || `user${Date.now().toString().slice(-4)}`)
          .toLowerCase()
          .replace(/[^a-z0-9_.]/g, '');

        await setDoc(
          userRef,
          {
            name: credential.user.displayName || 'Cliente',
            lastName: '',
            company: '',
            phone: '',
            username: defaultUsername,
            email: credential.user.email,
            country: 'México',
            preferredLanguage: language || 'es',
            autoBugReport: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        try {
          await setDoc(doc(db, 'usernames', defaultUsername), {
            uid: credential.user.uid,
            createdAt: serverTimestamp(),
          });
        } catch {
          // Ignore if exists
        }
      }

      setIsSuccessAnim(true);

      setTimeout(() => {
        if (onRequires2FA) {
          onRequires2FA(credential.user);
        }
        onAuthSuccess();
        onClose();
      }, 550);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Error signInWithGoogle:', err);
        setFeedback({ type: 'error', message: 'No se pudo iniciar sesión con Google.' });
      }
    } finally {
      setGoogleLoading(false);
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
        className="modal modal--wide auth-modal-section"
        style={{ maxWidth: 540 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar ventana"
          data-testid="button-close-auth-modal"
        >
          <X size={18} />
        </button>

        {/* ÁREA VISUAL DE PERSONAJES ANIMADOS INTERACTIVOS */}
        <div className="auth-mascots-wrapper" style={{ margin: '0 auto 12px', textAlign: 'center' }}>
          <AuthCharacters formState={characterState} passwordLength={password.length} />
        </div>

        {/* Encabezado Corporativo */}
        <div className="modal-brand" style={{ marginBottom: 12, textAlign: 'center' }}>
          <div>
            <strong style={{ color: 'var(--navy)', fontSize: '1.05rem', letterSpacing: 0.5 }}>
              DISTRIBUIDORA VAR SAN
            </strong>
            <small style={{ color: 'var(--gold)', fontWeight: 600, display: 'block' }}>
              Portal de Cliente
            </small>
          </div>
        </div>

        <h2
          id="auth-modal-title"
          style={{ color: 'var(--navy)', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px', textAlign: 'center' }}
        >
          {tab === 'login'
            ? 'Iniciar sesión'
            : tab === 'register'
            ? 'Crear una cuenta'
            : tab === '2fa-challenge'
            ? 'Verificación en dos fases'
            : 'Recuperar contraseña'}
        </h2>
        <p className="modal-intro" style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#64748b', textAlign: 'center' }}>
          {tab === 'login'
            ? 'Accede a tu cuenta para consultar catálogos, pedidos y gestionar tu seguridad.'
            : tab === 'register'
            ? 'Completa tus datos para obtener acceso al portal corporativo de suministros.'
            : tab === '2fa-challenge'
            ? `Introduce el código de 6 dígitos enviado mediante ${pending2FAMethod === 'sms' ? 'Mensaje SMS' : 'Correo electrónico'}.`
            : 'Te enviaremos un código de 6 dígitos para restablecer tu contraseña con seguridad.'}
        </p>

        {/* Pestañas de Acceso (Solo en login/register) */}
        {tab !== 'forgot-password' && tab !== '2fa-challenge' && (
          <div className="account-tabs" style={{ marginBottom: 18 }}>
            <button
              type="button"
              className={`account-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setTab('login');
                setFeedback(null);
              }}
              data-testid="tab-login"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`account-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setTab('register');
                setFeedback(null);
              }}
              data-testid="tab-register"
            >
              Crear cuenta
            </button>
          </div>
        )}

        {/* Mensaje de feedback */}
        {feedback && (
          <div
            className={`account-message account-message--${feedback.type === 'success' ? 'success' : 'warning'}`}
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            style={{ marginBottom: 14 }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* VISTA 1 & 2: LOGIN / REGISTRO */}
        {tab !== 'forgot-password' && (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {tab === 'register' && (
              <>
                {/* Nombre y Apellido */}
                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label" htmlFor="reg-name">
                      Nombre <span style={{ color: '#b91c1c' }}>*</span>
                    </label>
                    <div className="input-with-icon">
                      <User size={15} className="input-icon" />
                      <input
                        id="reg-name"
                        type="text"
                        className="form-input"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        required
                        data-testid="input-register-name"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="reg-lastname">
                      Apellido
                    </label>
                    <input
                      id="reg-lastname"
                      type="text"
                      className="form-input"
                      placeholder="Tu apellido"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                      data-testid="input-register-lastname"
                    />
                  </div>
                </div>

                {/* Selector / Buscador Categorizado de Empresa con opción Otros */}
                <div onFocus={() => setFocusedField('company')} onBlur={() => setFocusedField(null)}>
                  <OrganizationSelector
                    value={company}
                    onChange={(val) => setCompany(val)}
                    required={false}
                  />
                </div>

                {/* Nombre de usuario (@username) */}
                <div className="form-field" style={{ marginTop: 8 }}>
                  <label className="form-label" htmlFor="reg-username">
                    Usuario <span style={{ color: '#b91c1c' }}>*</span>
                  </label>
                  <div className="input-with-icon">
                    <span style={{ position: 'absolute', left: 12, color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>
                      @
                    </span>
                    <input
                      id="reg-username"
                      type="text"
                      className={`form-input ${usernameStatus ? (usernameStatus.available ? 'form-input--valid' : 'form-input--invalid') : ''}`}
                      placeholder="nombredeusuario"
                      value={username.replace(/^@/, '')}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      style={{ paddingLeft: 30 }}
                      required
                      minLength={6}
                      maxLength={30}
                      data-testid="input-register-username"
                    />
                    {usernameChecking && (
                      <Loader2 size={15} className="animate-spin" style={{ position: 'absolute', right: 12, color: '#64748b' }} />
                    )}
                    {!usernameChecking && usernameStatus && usernameStatus.available && (
                      <CheckCircle2 size={15} style={{ position: 'absolute', right: 12, color: '#16a34a' }} />
                    )}
                  </div>
                  {usernameStatus && !usernameStatus.available && (
                    <span className="form-error-inline" style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>
                      {usernameStatus.error || 'Este usuario no está disponible.'}
                    </span>
                  )}
                </div>

                {/* Número celular */}
                <div className="form-field">
                  <label className="form-label" htmlFor="reg-phone">
                    Número celular
                  </label>
                  <div className="input-with-icon">
                    <Phone size={15} className="input-icon" />
                    <input
                      id="reg-phone"
                      type="tel"
                      className="form-input"
                      placeholder="+52 XXX XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      data-testid="input-register-phone"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Correo Electrónico o Usuario */}
            <div className="form-field">
              <label className="form-label" htmlFor="auth-email">
                {tab === 'login' ? 'Correo electrónico o nombre de usuario' : 'Correo electrónico'}{' '}
                <span style={{ color: '#b91c1c' }}>*</span>
              </label>
              <div className="input-with-icon">
                <Mail size={15} className="input-icon" />
                <input
                  id="auth-email"
                  type="text"
                  className="form-input"
                  placeholder={tab === 'login' ? 'usuario@email.com o @usuario' : 'usuario@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  data-testid="input-auth-email"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="auth-password">
                  Contraseña <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    className="link-button"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => {
                      setTab('forgot-password');
                      setFeedback(null);
                      setResetStep(1);
                      setResetIdentifier(email.trim());
                    }}
                    data-testid="link-login-forgot-password"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="input-with-icon">
                <Lock size={15} className="input-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder={tab === 'login' ? 'Escribe tu contraseña' : 'Crea una contraseña segura'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  minLength={tab === 'register' ? 8 : 6}
                  data-testid="input-auth-password"
                  style={{ paddingRight: 38 }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Checklist interactivo en registro */}
              {tab === 'register' && <PasswordStrengthMeter password={password} />}
            </div>

            {/* Confirmar Contraseña (solo registro) */}
            {tab === 'register' && (
              <div className="form-field">
                <label className="form-label" htmlFor="reg-confirm-pwd">
                  Confirmar contraseña <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <Lock size={15} className="input-icon" />
                  <input
                    id="reg-confirm-pwd"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    required
                    data-testid="input-register-confirm-password"
                    style={{ paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <span className="form-error-inline" style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>
                    Las contraseñas no coinciden.
                  </span>
                )}
              </div>
            )}

            {/* Botón Principal de Envío */}
            <button
              type="submit"
              className="button button--navy"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.94rem', marginTop: 8 }}
              disabled={Boolean(
                loading ||
                  (tab === 'register' &&
                    (!isPasswordValid(password) ||
                      password !== confirmPassword ||
                      !name.trim() ||
                      usernameChecking ||
                      (usernameStatus && !usernameStatus.available)))
              )}
              data-testid="button-submit-auth"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{tab === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}</span>
                </>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* VISTA 3: RECUPERACIÓN CON CÓDIGO DE 6 DÍGITOS */}
        {tab === 'forgot-password' && (
          <div className="auth-forgot-flow" style={{ marginTop: 6 }}>
            {resetStep === 1 ? (
              <form onSubmit={handleRequestResetCode} noValidate>
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <label className="form-label" htmlFor="reset-id">
                    Correo electrónico o usuario <span style={{ color: '#b91c1c' }}>*</span>
                  </label>
                  <div className="input-with-icon">
                    <Mail size={15} className="input-icon" />
                    <input
                      id="reset-id"
                      type="text"
                      className="form-input"
                      placeholder="usuario@email.com o @usuario"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="button button--navy"
                  style={{ width: '100%', padding: '11px 18px', fontSize: '0.92rem' }}
                  disabled={loading || !resetIdentifier.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Enviando código...</span>
                    </>
                  ) : (
                    <span>Enviar código de 6 dígitos</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndUpdatePassword} noValidate>
                {/* Código de 6 dígitos */}
                <div className="form-field" style={{ marginBottom: 14 }}>
                  <label className="form-label" htmlFor="reset-code">
                    Código de 6 dígitos <span style={{ color: '#b91c1c' }}>*</span>
                  </label>
                  <div className="input-with-icon">
                    <KeyRound size={15} className="input-icon" />
                    <input
                      id="reset-code"
                      type="text"
                      className="form-input"
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onFocus={() => setFocusedField('reset-code')}
                      onBlur={() => setFocusedField(null)}
                      required
                      maxLength={6}
                      style={{ letterSpacing: 4, fontWeight: 700, fontSize: '1.05rem', textAlign: 'center' }}
                    />
                  </div>
                </div>

                {/* Nueva Contraseña */}
                <div className="form-field" style={{ marginBottom: 14 }}>
                  <label className="form-label" htmlFor="reset-new-pwd">
                    Nueva contraseña <span style={{ color: '#b91c1c' }}>*</span>
                  </label>
                  <div className="input-with-icon">
                    <Lock size={15} className="input-icon" />
                    <input
                      id="reset-new-pwd"
                      type={showResetPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Crea una contraseña segura"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      onFocus={() => setFocusedField('reset-password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      style={{ paddingRight: 38 }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      aria-label={showResetPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      tabIndex={-1}
                    >
                      {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={resetNewPassword} />
                </div>

                {/* Confirmar Nueva Contraseña */}
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <label className="form-label" htmlFor="reset-confirm-pwd">
                    Confirmar nueva contraseña <span style={{ color: '#b91c1c' }}>*</span>
                  </label>
                  <div className="input-with-icon">
                    <Lock size={15} className="input-icon" />
                    <input
                      id="reset-confirm-pwd"
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Repite la nueva contraseña"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('reset-password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      style={{ paddingRight: 38 }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      aria-label={showResetConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      tabIndex={-1}
                    >
                      {showResetConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {resetConfirmPassword && resetNewPassword !== resetConfirmPassword && (
                    <span className="form-error-inline" style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>
                      Las contraseñas no coinciden.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="button button--navy"
                  style={{ width: '100%', padding: '11px 18px', fontSize: '0.92rem' }}
                  disabled={
                    loading ||
                    resetCode.length !== 6 ||
                    !isPasswordValid(resetNewPassword) ||
                    resetNewPassword !== resetConfirmPassword
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <span>Actualizar contraseña</span>
                  )}
                </button>
              </form>
            )}

            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <button
                type="button"
                className="link-button"
                style={{ fontSize: '0.84rem' }}
                onClick={() => {
                  setTab('login');
                  setFeedback(null);
                  setResetStep(1);
                }}
              >
                ← Volver a iniciar sesión
              </button>
            </div>
          </div>
        )}

        {/* VISTA 4: RETO DE AUTENTICACIÓN EN DOS PASOS EN LOGIN */}
        {tab === '2fa-challenge' && (
          <form onSubmit={handleVerify2FALogin} noValidate className="auth-forgot-flow" style={{ marginTop: 6 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 6px', color: 'var(--navy)', fontSize: '1.2rem', fontWeight: 800 }}>
                Verificación en Dos Pasos
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Tu cuenta tiene protección 2FA activa. Te enviaremos un código de 6 dígitos por SMS para confirmar tu identidad.
              </p>
            </div>

            {!isUsingBackupCode ? (
              <>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: '0.84rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                    Te enviamos un código de 6 dígitos por {pending2FAMethod === 'sms' ? 'SMS a tu número' : 'correo a'}{' '}
                    <strong style={{ color: 'var(--navy)' }}>{pending2FATarget}</strong>.
                  </p>
                </div>

                <div className="form-field" style={{ marginBottom: 16 }}>
                  <label className="form-label" htmlFor="login-2fa-code" style={{ textAlign: 'center', display: 'block', marginBottom: 8 }}>
                    Ingresa el código de 6 dígitos que recibiste por {pending2FAMethod === 'sms' ? 'SMS' : 'correo'}:
                  </label>
                  <div style={{ maxWidth: 280, margin: '0 auto' }}>
                    <input
                      id="login-2fa-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="form-input"
                      placeholder="_ _ _ _ _ _"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onFocus={() => setFocusedField('two-factor-code')}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoFocus
                      style={{
                        textAlign: 'center',
                        letterSpacing: 8,
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        padding: '12px 14px',
                      }}
                      data-testid="input-login-2fa-code"
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={handleResend2FALoginCode}
                    disabled={loading || twoFactorCooldown > 0}
                    style={{ fontSize: '0.82rem', color: twoFactorCooldown > 0 ? '#94a3b8' : 'var(--gold)', fontWeight: 600 }}
                  >
                    {twoFactorCooldown > 0
                      ? `¿No recibiste el código? Reenviar en ${twoFactorCooldown}s`
                      : '¿No recibiste el código? Reenviar código por SMS'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="button button--navy"
                  style={{ width: '100%', padding: '12px 20px', fontSize: '0.92rem', marginBottom: 14 }}
                  disabled={loading || twoFactorCode.trim().length !== 6}
                  data-testid="button-submit-2fa-login"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>Verificar y acceder</span>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      setIsUsingBackupCode(true);
                      setTwoFactorCode('');
                      setFeedback(null);
                    }}
                    style={{ fontSize: '0.82rem', color: 'var(--navy)', textDecoration: 'underline' }}
                  >
                    ¿No tienes acceso a tu teléfono? Usa un código de respaldo
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: '0.84rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                    Introduce uno de tus <strong>códigos de respaldo de un solo uso</strong> (formato <code>XXXX-XXXX</code>).
                  </p>
                </div>

                <div className="form-field" style={{ marginBottom: 16 }}>
                  <label className="form-label" htmlFor="login-backup-code" style={{ textAlign: 'center', display: 'block', marginBottom: 8 }}>
                    Código de respaldo:
                  </label>
                  <div style={{ maxWidth: 280, margin: '0 auto' }}>
                    <input
                      id="login-backup-code"
                      type="text"
                      maxLength={9}
                      className="form-input"
                      placeholder="XXXX-XXXX"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase())}
                      onFocus={() => setFocusedField('two-factor-code')}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoFocus
                      style={{
                        textAlign: 'center',
                        letterSpacing: 4,
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        fontSize: '1.15rem',
                        padding: '12px 14px',
                      }}
                      data-testid="input-login-backup-code"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="button button--navy"
                  style={{ width: '100%', padding: '12px 20px', fontSize: '0.92rem', marginBottom: 14 }}
                  disabled={loading || twoFactorCode.trim().length < 8}
                  data-testid="button-submit-backup-code"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>Verificar con código de respaldo</span>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      setIsUsingBackupCode(false);
                      setTwoFactorCode('');
                      setFeedback(null);
                    }}
                    style={{ fontSize: '0.82rem', color: 'var(--navy)', textDecoration: 'underline' }}
                  >
                    ← Volver a verificación por SMS
                  </button>
                </div>
              </>
            )}

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                className="link-button"
                style={{ fontSize: '0.84rem' }}
                onClick={handleCancel2FALogin}
              >
                ← Cancelar e iniciar con otra cuenta
              </button>
            </div>
          </form>
        )}

        {/* Separador y Google Sign-In (Solo en login/register) */}
        {tab !== 'forgot-password' && tab !== '2fa-challenge' && (
          <>
            <div className="modal-divider" style={{ margin: '18px 0 14px' }}>
              <span>o</span>
            </div>

            <button
              type="button"
              className="button button--outline google-btn"
              style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: '0.9rem' }}
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              data-testid="button-google-sign-in"
            >
              {googleLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Continuar con Google</span>
            </button>
          </>
        )}

        {/* Nota de Acceso Seguro */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, color: '#64748b', fontSize: '0.78rem' }}>
          <ShieldCheck size={14} style={{ color: '#16a34a' }} />
          <span>Acceso seguro protegido con cifrado SSL y Firebase Auth</span>
        </div>
      </section>
    </div>
  );
};
