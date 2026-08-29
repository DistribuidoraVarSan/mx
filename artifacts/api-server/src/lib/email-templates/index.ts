import {
  type EmailLanguage,
  SUPPORTED_EMAIL_LANGUAGES,
  DEFAULT_EMAIL_LANGUAGE,
  isSupportedEmailLanguage,
} from "./types";

export * from "./types";
export * from "./emilia-welcome";
export * from "./auth-emails";

/**
 * Resuelve el idioma de correo a utilizar aplicando la regla oficial de precedencia:
 * 1. userPreferredLanguage (Preferencia guardada del usuario en Firestore).
 * 2. requestedLanguage (Idioma solicitado por la petición del cliente si no hay preferencia previa).
 * 3. DEFAULT_EMAIL_LANGUAGE ('es') como fallback institucional garantizado.
 */
export function resolveEmailLanguage(
  userPreferredLanguage?: unknown,
  requestedLanguage?: unknown,
): EmailLanguage {
  if (isSupportedEmailLanguage(userPreferredLanguage)) {
    return userPreferredLanguage;
  }
  if (isSupportedEmailLanguage(requestedLanguage)) {
    return requestedLanguage;
  }
  return DEFAULT_EMAIL_LANGUAGE;
}

/**
 * Escapa caracteres especiales de HTML para prevenir inyección de código y marcado en correos.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
