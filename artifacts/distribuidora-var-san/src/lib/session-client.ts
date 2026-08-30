import type { User as FirebaseUser } from "firebase/auth";

export interface SessionRecord {
  sessionId: string;
  os: string;
  browser: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  ip: string;
  country: string;
  region?: string | null;
  createdAt: string;
  lastActiveAt: string;
  revoked: boolean;
  isCurrent?: boolean;
}

export type DeviceSession = SessionRecord;

const STORAGE_SESSION_KEY = "varsan_session_id";

/**
 * Retorna la URL base del backend para llamadas HTTP.
 * - En desarrollo local (localhost / 127.0.0.1) usa '/api' (aprovecha el proxy de Vite).
 * - En producción (Firebase Hosting / dominio custom), utiliza VITE_API_URL o el backend en Render.
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta as any)?.env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api';
    }
  }

  return 'https://varsan-api.onrender.com/api';
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Genera un identificador de sesión local criptográficamente seguro.
 */
function generateSecureSessionId(): string {
  try {
    if (typeof window !== "undefined" && window.crypto) {
      if (typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
      }
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    // Fallback pasivo
  }
  return `sess-${Date.now()}-${Math.floor(Date.now() * 1.618).toString(36)}`;
}

/**
 * Obtiene el identificador de sesión local almacenado en el navegador,
 * o genera uno nuevo si no existe.
 */
export function getOrCreateSessionId(): string {
  try {
    let sid = window.sessionStorage.getItem(STORAGE_SESSION_KEY);
    if (!sid) {
      sid = window.localStorage.getItem(STORAGE_SESSION_KEY);
    }
    if (!sid) {
      sid = generateSecureSessionId();
      window.sessionStorage.setItem(STORAGE_SESSION_KEY, sid);
      window.localStorage.setItem(STORAGE_SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return generateSecureSessionId();
  }
}


/**
 * Limpia el identificador de sesión local (por ejemplo, al cerrar sesión manualmente).
 */
export function clearStoredSessionId(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_SESSION_KEY);
    window.localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch {
    // Modo privado o storage no disponible
  }
}

/**
 * Registra o actualiza la sesión del dispositivo activo en el backend mediante Firebase ID Token.
 */
export async function registerDeviceSession(user: FirebaseUser, language?: string): Promise<SessionRecord | null> {
  if (!user) return null;

  try {
    const idToken = await user.getIdToken();
    const clientSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/session/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": clientSessionId,
      },
      body: JSON.stringify({ clientSessionId, language }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn("No se pudo registrar la sesión del dispositivo:", errorData);
      return null;
    }

    const data = await response.json();
    return data.session || null;
  } catch (error) {
    console.error("Error de red al registrar la sesión:", error);
    return null;
  }
}

/**
 * Obtiene el listado de todas las sesiones registradas del usuario autenticado.
 */
export async function fetchUserSessions(user: FirebaseUser): Promise<SessionRecord[]> {
  if (!user) return [];

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/sessions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: { sessions?: SessionRecord[] } = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error("Error al obtener sesiones del usuario:", error);
    return [];
  }
}

/**
 * Invalida/revoca una sesión específica en el backend.
 */
export async function revokeUserSession(user: FirebaseUser, sessionId: string): Promise<boolean> {
  if (!user || !sessionId) return false;

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/sessions/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify({ sessionId }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error al revocar la sesión:", error);
    return false;
  }
}

/**
 * Invalida/revoca todas las demás sesiones excepto la sesión del dispositivo actual.
 */
export async function revokeAllOtherSessions(user: FirebaseUser): Promise<{ success: boolean; count?: number }> {
  if (!user) return { success: false };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/sessions/revoke-others`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify({ currentSessionId }),
    });

    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();
    return { success: true, count: data.revokedCount };
  } catch (error) {
    console.error("Error al revocar las otras sesiones:", error);
    return { success: false };
  }
}

/**
 * Invalida/revoca TODAS las sesiones del usuario (revocación global de seguridad).
 */
export async function revokeAllSessions(user: FirebaseUser): Promise<{ success: boolean; count?: number }> {
  if (!user) return { success: false };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/sessions/revoke-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
    });

    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();
    return { success: true, count: data.revokedCount };
  } catch (error) {
    console.error("Error al revocar todas las sesiones:", error);
    return { success: false };
  }
}

/**
 * Reporte de respuesta rápida 'No fui yo': revoca la sesión no reconocida y alerta por correo.
 */
export async function reportItWasntMe(
  user: FirebaseUser,
  sessionId?: string,
  language?: string,
): Promise<{ success: boolean; message?: string }> {
  if (!user) return { success: false, message: "Usuario no autenticado." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/security/it-wasnt-me`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify({ sessionId, language }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.error || "No se pudo reportar la actividad." };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error al reportar actividad sospechosa:", error);
    return { success: false, message: "Error de red al procesar el reporte de seguridad." };
  }
}

export type SecurityActivityType =
  | "login"
  | "new_device"
  | "2fa_enabled"
  | "2fa_disabled"
  | "backup_code_used"
  | "rescue_code_used"
  | "session_revoked"
  | "sessions_revoked_others"
  | "sessions_revoked_all"
  | "suspicious_activity_reported"
  | "password_reset";

export interface SecurityActivityRecord {
  id: string;
  type: SecurityActivityType;
  title: string;
  description: string;
  ip: string;
  os: string;
  browser: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  country: string;
  region?: string | null;
  timestamp: string;
}

/**
 * Obtiene el historial de actividad de seguridad del usuario autenticado.
 */
export async function fetchSecurityActivity(user: FirebaseUser): Promise<SecurityActivityRecord[]> {
  if (!user) return [];

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/security-activity`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.activities || [];
  } catch (error) {
    console.error("Error al obtener actividad de seguridad:", error);
    return [];
  }
}


export interface TwoFactorStatus {
  enabled: boolean;
  method?: "email" | "sms";
  phone?: string;
  enabledAt?: string;
  verifiedAt?: string;
}

/**
 * Consulta el estado de 2FA del usuario en el backend.
 */
export async function fetch2FAStatus(user: FirebaseUser): Promise<TwoFactorStatus | null> {
  if (!user) return null;

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${getApiBaseUrl()}/auth/2fa/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error al consultar estado 2FA:", error);
    return null;
  }
}

/**
 * Inicia el proceso de configuración de 2FA enviando un código de 6 dígitos al correo o celular.
 */
export async function request2FASetupCode(
  user: FirebaseUser,
  params: { phone: string; method: "email" | "sms"; language?: string },
): Promise<{ success: boolean; message?: string; error?: string; method?: string; phone?: string }> {
  if (!user) return { success: false, error: "Usuario no autenticado." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${getApiBaseUrl()}/auth/2fa/request-setup-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify(params),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.message || data.error || "No se pudo solicitar el código de 2FA." };
    }

    return { success: true, message: data.message, method: data.method, phone: data.phone };
  } catch (error) {
    console.error("Error al solicitar código 2FA:", error);
    return { success: false, error: "Error de conexión al solicitar el código." };
  }
}

/**
 * Confirma la activación de 2FA con el código de 6 dígitos recibido por el usuario.
 */
export async function verifyAndEnable2FA(
  user: FirebaseUser,
  code: string,
  language?: string,
): Promise<{ success: boolean; message?: string; error?: string; twoFactor?: any }> {
  if (!user || !code) return { success: false, error: "Código requerido." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${getApiBaseUrl()}/auth/2fa/verify-and-enable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify({ code, language }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "No se pudo activar 2FA." };
    }

    return { success: true, message: data.message, twoFactor: data.twoFactor };
  } catch (error) {
    console.error("Error al activar 2FA:", error);
    return { success: false, error: "Error de conexión al activar 2FA." };
  }
}

/**
 * Envía el código de seguridad 2FA durante el inicio de sesión.
 */
export async function send2FALoginCode(
  uid: string,
  language?: string,
): Promise<{ success: boolean; enabled?: boolean; message?: string; error?: string; method?: string; maskedTarget?: string }> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/2fa/send-login-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid, language }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "No se pudo enviar el código 2FA." };
    }

    return {
      success: true,
      enabled: data.enabled !== false,
      message: data.message,
      method: data.method,
      maskedTarget: data.maskedTarget,
    };
  } catch (error) {
    console.error("Error al enviar código 2FA de login:", error);
    return { success: false, error: "Error de conexión al solicitar código de verificación." };
  }
}

/**
 * Valida el código 2FA de 6 dígitos durante el inicio de sesión.
 */
export async function verify2FALoginCode(
  uid: string,
  code: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/2fa/verify-login-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid, code }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "Código incorrecto o expirado." };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error al verificar código 2FA de login:", error);
    return { success: false, error: "Error de conexión al verificar el código." };
  }
}

/**
 * Desactiva 2FA del usuario autenticado.
 */
export async function disable2FA(
  user: FirebaseUser,
  params?: { language?: string },
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!user) return { success: false, error: "Usuario no autenticado." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${getApiBaseUrl()}/auth/2fa/disable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify(params || {}),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "No se pudo desactivar 2FA." };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error al desactivar 2FA:", error);
    return { success: false, error: "Error de red al desactivar 2FA." };
  }
}

/**
 * Obtiene los códigos de respaldo 2FA del usuario autenticado.
 */
export async function fetch2FABackupCodes(
  user: FirebaseUser,
): Promise<{ success: boolean; backupCodes?: string[]; total?: number; unused?: number; error?: string }> {
  if (!user) return { success: false, error: "Usuario no autenticado." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${getApiBaseUrl()}/auth/2fa/backup-codes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "No se pudieron obtener los códigos de respaldo." };
    }

    return {
      success: true,
      backupCodes: data.backupCodes || [],
      total: data.total,
      unused: data.unused,
    };
  } catch (error) {
    console.error("Error al obtener códigos de respaldo:", error);
    return { success: false, error: "Error de red al consultar códigos de respaldo." };
  }
}

/**
 * Regenera un conjunto nuevo de códigos de respaldo 2FA.
 */
export async function regenerate2FABackupCodes(
  user: FirebaseUser,
  language?: string,
): Promise<{ success: boolean; backupCodes?: string[]; message?: string; error?: string }> {
  if (!user) return { success: false, error: "Usuario no autenticado." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${getApiBaseUrl()}/auth/2fa/backup-codes/regenerate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify({ language }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "No se pudieron regenerar los códigos." };
    }

    return { success: true, backupCodes: data.backupCodes || [], message: data.message };
  } catch (error) {
    console.error("Error al regenerar códigos de respaldo:", error);
    return { success: false, error: "Error de red al regenerar códigos." };
  }
}

/**
 * Envía por correo los códigos de respaldo existentes al usuario.
 */
export async function send2FABackupCodesEmail(
  user: FirebaseUser,
  language?: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!user) return { success: false, error: "Usuario no autenticado." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${getApiBaseUrl()}/auth/2fa/send-backup-codes-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify({ language }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "No se pudo enviar el correo con los códigos." };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error al enviar códigos de respaldo por correo:", error);
    return { success: false, error: "Error de red al enviar el correo." };
  }
}

export interface TwoFactorSetupData {
  status?: string;
  secretKey?: string;
  otpauthUri?: string;
  totpUri?: string;
  backupCodes?: string[];
  method?: string;
  phone?: string;
}

// Aliases para compatibilidad con código existente
export async function setup2FA(
  user: FirebaseUser,
  params?: { phone?: string; method?: "email" | "sms"; language?: string },
): Promise<any> {
  return request2FASetupCode(user, {
    phone: params?.phone || (user as any).phoneNumber || "+525500000000",
    method: params?.method || "email",
    language: params?.language,
  });
}

export const enable2FA = verifyAndEnable2FA;

export async function verify2FAChallenge(
  userOrUid: FirebaseUser | string,
  params?: { code?: string; backupCode?: string; rescueCode?: string; language?: string } | string,
): Promise<{ success: boolean; message?: string; error?: string; remainingAttempts?: number }> {
  const uid = typeof userOrUid === "string" ? userOrUid : userOrUid?.uid;
  const code = typeof params === "string" ? params : (params?.code || params?.backupCode || params?.rescueCode || "");
  return verify2FALoginCode(uid, code);
}

/**
 * Solicita un código OTP de rescate de 6 dígitos enviado al correo registrado.
 */
export async function request2FARescueCode(
  user: FirebaseUser,
  language?: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!user) return { success: false, error: "Usuario no autenticado." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/2fa/request-rescue-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify({ language }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "No se pudo enviar el código de rescate." };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error al solicitar código de rescate:", error);
    return { success: false, error: "Error de red al solicitar código de rescate." };
  }
}

/**
 * Notifica al backend que la contraseña ha sido actualizada mediante Firebase Auth.
 */
export async function notifyPasswordChanged(
  user: FirebaseUser,
  language?: string,
): Promise<{ success: boolean }> {
  if (!user) return { success: false };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/account/password-changed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify({ language }),
    });

    return { success: response.ok };
  } catch (error) {
    console.warn("No se pudo notificar cambio de contraseña al backend:", error);
    return { success: false };
  }
}

/**
 * Solicita el cambio seguro de correo electrónico en Firebase Auth y backend.
 */
export async function requestChangeEmail(
  user: FirebaseUser,
  newEmail: string,
  twoFactorCode?: string,
  language?: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!user || !newEmail) return { success: false, error: "Correo requerido." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/account/change-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify({ newEmail, twoFactorCode, language }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "No se pudo actualizar el correo electrónico." };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error al solicitar cambio de correo:", error);
    return { success: false, error: "Error de conexión al procesar el cambio de correo." };
  }
}

/**
 * Solicita la desactivación segura de la cuenta.
 */
export async function requestDeactivateAccount(
  user: FirebaseUser,
  twoFactorCode?: string,
  language?: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!user) return { success: false, error: "Usuario no autenticado." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/account/deactivate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify({ confirm: true, twoFactorCode, language }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "No se pudo desactivar la cuenta." };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error al desactivar cuenta:", error);
    return { success: false, error: "Error de red al desactivar la cuenta." };
  }
}

/**
 * Solicita la eliminación definitiva e irrevocable de la cuenta y sus datos.
 */
export async function requestDeleteAccount(
  user: FirebaseUser,
  twoFactorCode?: string,
  language?: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!user) return { success: false, error: "Usuario no autenticado." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/account/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
      body: JSON.stringify({ confirm: true, twoFactorCode, language }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "No se pudo eliminar la cuenta." };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    return { success: false, error: "Error de red al eliminar la cuenta." };
  }
}

/**
 * Envía un informe de error técnico / bug report a soporte.
 */
export async function submitBugReport(params: {
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  severity?: "low" | "medium" | "high" | "critical";
  appVersion?: string;
  technicalDetails?: {
    os?: string;
    browser?: string;
    deviceType?: string;
    language?: string;
  };
}): Promise<{ success: boolean; ticketId?: string; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/support/bug-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || "No se pudo enviar el informe de fallos." };
    }

    return { success: true, ticketId: data.ticketId, message: data.message };
  } catch (error) {
    console.error("Error al enviar informe de fallos:", error);
    return { success: false, error: "Error de red al enviar el informe." };
  }
}

export interface BrowserStorageInfo {
  quotaBytes?: number;
  usageBytes?: number;
  percentUsed?: number;
  localStorageBytes: number;
  localStorageKeys: number;
  sessionStorageBytes: number;
  sessionStorageKeys: number;
  cookieCount: number;
  indexedDbSupported: boolean;
  cacheStorageSupported: boolean;
  serviceWorkerSupported: boolean;
}

/**
 * Mide de forma segura y precisa el almacenamiento LOCAL DEL NAVEGADOR.
 */
export async function getBrowserStorageEstimate(): Promise<BrowserStorageInfo> {
  let quotaBytes: number | undefined;
  let usageBytes: number | undefined;
  let percentUsed: number | undefined;

  // 1. navigator.storage.estimate()
  if (typeof navigator !== "undefined" && navigator.storage && typeof navigator.storage.estimate === "function") {
    try {
      const estimate = await navigator.storage.estimate();
      quotaBytes = estimate.quota;
      usageBytes = estimate.usage;
      if (quotaBytes && usageBytes) {
        percentUsed = Math.min(100, Math.round((usageBytes / quotaBytes) * 100));
      }
    } catch {
      // Ignorar fallo de permiso o modo privado
    }
  }

  // 2. localStorage
  let localStorageBytes = 0;
  let localStorageKeys = 0;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorageKeys = window.localStorage.length;
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i) || "";
        const val = window.localStorage.getItem(key) || "";
        localStorageBytes += (key.length + val.length) * 2; // UTF-16 approx
      }
    }
  } catch {}

  // 3. sessionStorage
  let sessionStorageBytes = 0;
  let sessionStorageKeys = 0;
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorageKeys = window.sessionStorage.length;
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i) || "";
        const val = window.sessionStorage.getItem(key) || "";
        sessionStorageBytes += (key.length + val.length) * 2;
      }
    }
  } catch {}

  // 4. Cookies accesibles vía document.cookie (No HttpOnly)
  let cookieCount = 0;
  try {
    if (typeof document !== "undefined" && document.cookie) {
      cookieCount = document.cookie.split(";").filter((c) => c.trim().length > 0).length;
    }
  } catch {}

  // 5. Soporte de APIs avanzadas
  const indexedDbSupported = typeof window !== "undefined" && "indexedDB" in window;
  const cacheStorageSupported = typeof window !== "undefined" && "caches" in window;
  const serviceWorkerSupported = typeof navigator !== "undefined" && "serviceWorker" in navigator;

  return {
    quotaBytes,
    usageBytes,
    percentUsed,
    localStorageBytes,
    localStorageKeys,
    sessionStorageBytes,
    sessionStorageKeys,
    cookieCount,
    indexedDbSupported,
    cacheStorageSupported,
    serviceWorkerSupported,
  };
}

/**
 * Limpia de forma segura los datos temporales del navegador local (sin destruir credenciales activas esenciales).
 */
export function clearSafeBrowserStorage(): { clearedCount: number } {
  let clearedCount = 0;
  try {
    // Limpiamos sessionStorage excepto la sesión activa
    if (typeof window !== "undefined" && window.sessionStorage) {
      const keysToPreserve = [STORAGE_SESSION_KEY];
      const allKeys = Object.keys(window.sessionStorage);
      for (const k of allKeys) {
        if (!keysToPreserve.includes(k)) {
          window.sessionStorage.removeItem(k);
          clearedCount++;
        }
      }
    }
  } catch {}

  return { clearedCount };
}
