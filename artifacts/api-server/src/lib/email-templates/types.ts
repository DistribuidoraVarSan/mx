import { ASSISTANT_LANGUAGES, type AssistantLanguage } from "../assistant-knowledge";

export type EmailLanguage = AssistantLanguage;

export const SUPPORTED_EMAIL_LANGUAGES = ASSISTANT_LANGUAGES;
export const DEFAULT_EMAIL_LANGUAGE: EmailLanguage = "es";

export function isSupportedEmailLanguage(value: unknown): value is EmailLanguage {
  return typeof value === "string" && (SUPPORTED_EMAIL_LANGUAGES as readonly string[]).includes(value);
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

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface WelcomeEmailParams {
  unsubscribeUrl: string;
  recipientName?: string;
}

export interface VerificationCodeEmailParams {
  code: string;
  recipientName?: string;
  expiresInMinutes?: number;
}

export interface PasswordResetEmailParams {
  resetCode?: string;
  resetUrl?: string;
  recipientName?: string;
  expiresInMinutes?: number;
}

export interface PasswordChangedEmailParams {
  recipientName?: string;
  changedAt?: string;
  securityContactUrl?: string;
}

export interface NewDeviceLoginEmailParams {
  recipientName?: string;
  deviceType?: string;
  os?: string;
  browser?: string;
  ip?: string;
  country?: string;
  region?: string | null;
  loginTime?: string;
  revokeUrl?: string;
}

export interface TwoFactorStatusEmailParams {
  recipientName?: string;
  enabled: boolean;
  timestamp?: string;
}

export interface SecurityAlertEmailParams {
  recipientName?: string;
  alertTitle: string;
  alertDetails: string;
  timestamp?: string;
  actionUrl?: string;
}

export interface EmailChangeNotificationParams {
  recipientName?: string;
  oldEmail: string;
  newEmail: string;
  timestamp?: string;
}

export interface AccountDeletionEmailParams {
  recipientName?: string;
  confirmationCode?: string;
  deletionDate?: string;
}

export interface AccountDeactivationEmailParams {
  recipientName?: string;
  deactivationDate?: string;
}
