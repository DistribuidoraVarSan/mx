import { buildEmiliaWelcomeEmail, type EmailContent, type EmailLanguage, type WelcomeEmailParams } from "./email-templates";

export type { WelcomeEmailParams, EmailContent };

/**
 * Correo de bienvenida de Emilia enviado automáticamente al confirmarse una nueva
 * suscripción al newsletter de Distribuidora Var San.
 * Soporta los 8 idiomas oficiales respetando el diseño institucional existente.
 */
export function buildWelcomeEmail(
  params: WelcomeEmailParams,
  language: EmailLanguage = "es",
): EmailContent {
  return buildEmiliaWelcomeEmail(language, params);
}