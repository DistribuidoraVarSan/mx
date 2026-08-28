import { logger } from "./logger";

export const EMAIL_SENDERS = {
  verification: "Distribuidora Var San <verificacion@distribuidoravarsan.com.mx>",
  security: "Distribuidora Var San <seguridad@distribuidoravarsan.com.mx>",
  accounts: "Distribuidora Var San <cuentas@distribuidoravarsan.com.mx>",
} as const;

export type EmailSenderKey = keyof typeof EMAIL_SENDERS;

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Envía un correo transaccional a través de la API de Resend.
 *
 * Requiere la variable de entorno RESEND_API_KEY.
 * Si se especifica `from`, se utiliza dicho remitente; de lo contrario, se
 * utiliza `process.env.RESEND_FROM_EMAIL` como fallback predeterminado.
 * Nunca se exponen credenciales al frontend: solo existen en este proceso de servidor.
 */
export async function sendEmail({ to, subject, html, text, from }: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = from || process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !sender) {
    logger.warn(
      "RESEND_API_KEY o remitente no están configurados; se omite el envío de correo.",
    );
    return;
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: sender, to, subject, html, text }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend respondió con ${response.status}: ${body}`);
  }
}
