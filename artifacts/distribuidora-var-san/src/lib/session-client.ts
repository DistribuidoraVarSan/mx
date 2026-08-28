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
const API_BASE_URL = "https://varsan-api.onrender.com/api";

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
      sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}-${Math.random().toString(36).slice(2, 11)}`;
      window.sessionStorage.setItem(STORAGE_SESSION_KEY, sid);
      window.localStorage.setItem(STORAGE_SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

export interface TwoFactorStatus {
  enabled: boolean;
  enabledAt?: string;
  backupCodesRemaining?: number;
}

export interface TwoFactorSetupData {
  status: string;
  secretKey: string;
  otpauthUri: string;
  backupCodes: string[];
}

/**
 * Consulta el estado de 2FA del usuario en el backend.
 */
export async function fetch2FAStatus(user: FirebaseUser): Promise<TwoFactorStatus | null> {
  if (!user) return null;

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/2fa/status`, {
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
 * Inicia el proceso de configuración de 2FA obteniendo secreto y códigos de respaldo.
 */
export async function setup2FA(user: FirebaseUser): Promise<TwoFactorSetupData | null> {
  if (!user) return null;

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/2fa/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "x-session-id": currentSessionId,
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error al iniciar setup 2FA:", error);
    return null;
  }
}

/**
 * Confirma la activación de 2FA con el primer código TOTP ingresado por el usuario.
 */
export async function enable2FA(
  user: FirebaseUser,
  code: string,
  language?: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!user || !code) return { success: false, error: "Código requerido." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
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

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error al activar 2FA:", error);
    return { success: false, error: "Error de conexión al activar 2FA." };
  }
}

/**
 * Valida el reto 2FA en el login mediante TOTP, código de respaldo o código de rescate.
 */
export async function verify2FAChallenge(
  user: FirebaseUser,
  params: { code?: string; backupCode?: string; rescueCode?: string; language?: string },
): Promise<{ success: boolean; message?: string; error?: string; remainingAttempts?: number }> {
  if (!user) return { success: false, error: "Usuario no autenticado." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
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
      return {
        success: false,
        error: data.error || "Código de verificación inválido.",
        remainingAttempts: data.remainingAttempts,
      };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error al verificar 2FA:", error);
    return { success: false, error: "Error de conexión con el servidor de autenticación." };
  }
}

/**
 * Desactiva 2FA previa validación de código de seguridad.
 */
export async function disable2FA(
  user: FirebaseUser,
  params: { code?: string; backupCode?: string; language?: string },
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!user) return { success: false, error: "Usuario no autenticado." };

  try {
    const idToken = await user.getIdToken();
    const currentSessionId = getOrCreateSessionId();

    const response = await fetch(`${API_BASE_URL}/auth/2fa/disable`, {
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
      return { success: false, error: data.error || "No se pudo desactivar 2FA." };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error al desactivar 2FA:", error);
    return { success: false, error: "Error de red al desactivar 2FA." };
  }
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
