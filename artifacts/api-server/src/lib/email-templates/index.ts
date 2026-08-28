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
 * Resuelve el idioma de correo a utilizar aplicando la cascada segura:
 * 1. requestedLanguage (si viene en el payload y es soportado)
 * 2. userPreferredLanguage (si está en Firestore / perfil y es soportado)
 * 3. DEFAULT_EMAIL_LANGUAGE ('es') como fallback garantizado.
 */
export function resolveEmailLanguage(
  requestedLanguage?: unknown,
  userPreferredLanguage?: unknown,
): EmailLanguage {
  if (isSupportedEmailLanguage(requestedLanguage)) {
    return requestedLanguage;
  }
  if (isSupportedEmailLanguage(userPreferredLanguage)) {
    return userPreferredLanguage;
  }
  return DEFAULT_EMAIL_LANGUAGE;
}
