import { logger } from "./logger";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Envía un correo transaccional a través de la API de Resend.
 *
 * Requiere las variables de entorno RESEND_API_KEY y RESEND_FROM_EMAIL.
 * Nunca se exponen al frontend: solo existen en este proceso de servidor.
 *
 * Si el servicio no está configurado (por ejemplo, en un entorno de
 * desarrollo sin credenciales), se registra una advertencia y no se envía
 * el correo, para no romper el flujo de suscripción.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    logger.warn(
      "RESEND_API_KEY o RESEND_FROM_EMAIL no están configurados; se omite el envío de correo.",
    );
    return;
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend respondió con ${response.status}: ${body}`);
  }
}
