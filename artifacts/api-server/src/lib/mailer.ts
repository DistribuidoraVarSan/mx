import { logger } from "./logger";

export const OFFICIAL_SENDER = "Distribuidora Var San <no-reply@distribuidora.com.mx>";

export const EMAIL_SENDERS = {
  default: OFFICIAL_SENDER,
  noReply: OFFICIAL_SENDER,
  verification: OFFICIAL_SENDER,
  security: OFFICIAL_SENDER,
  accounts: OFFICIAL_SENDER,
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
 * Utiliza el remitente único oficial: Distribuidora Var San <no-reply@distribuidoravarsan.com.mx>
 * o process.env.RESEND_FROM_EMAIL si se encuentra configurado en producción.
 */
export async function sendEmail({ to, subject, html, text, from }: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = from || process.env.RESEND_FROM_EMAIL || OFFICIAL_SENDER;

  if (!apiKey) {
    logger.warn(
      "RESEND_API_KEY no está configurada; se omite el envío de correo.",
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
