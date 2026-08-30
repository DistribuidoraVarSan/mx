import { logger } from "./logger";

export const OFFICIAL_SENDER = "Distribuidora Var San <no-reply@distribuidoravarsan.com.mx>";

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

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Error estructurado emitido cuando la API de Resend rechaza una solicitud.
 * Preserva el código de estado HTTP, nombre, mensaje y Request-ID sin exponer secretos.
 */
export class ResendApiError extends Error {
  statusCode: number;
  errorName?: string;
  errorCode?: string;
  errorMessage?: string;
  requestId?: string;

  constructor(statusCode: number, rawBody: string, headers?: Headers) {
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawBody);
    } catch {}
    const name = parsed.name || "ResendError";
    const message = parsed.message || rawBody || `HTTP ${statusCode}`;
    super(`Resend error (${statusCode}) [${name}]: ${message}`);
    this.name = "ResendApiError";
    this.statusCode = statusCode;
    this.errorName = parsed.name;
    this.errorCode = parsed.code || parsed.error;
    this.errorMessage = parsed.message;
    this.requestId = headers?.get("x-request-id") || undefined;
  }
}

/**
 * Envía un correo transaccional a través de la API de Resend.
 *
 * Requiere la variable de entorno RESEND_API_KEY.
 * Utiliza el remitente único oficial: Distribuidora Var San <no-reply@distribuidoravarsan.com.mx>
 * o process.env.RESEND_FROM_EMAIL si se encuentra configurado en producción.
 */
export async function sendEmail({ to, subject, html, text, from }: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL || from || OFFICIAL_SENDER;

  if (!apiKey) {
    logger.warn(
      "RESEND_API_KEY no está configurada; se omite el envío de correo.",
    );
    throw new ResendApiError(
      401,
      JSON.stringify({ name: "missing_api_key", message: "La variable RESEND_API_KEY no está configurada en el entorno del servidor." }),
    );
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: sender, to, subject, html, text }),
  });

  const responseText = await response.text().catch(() => "");
  let responseData: any = {};
  try {
    responseData = JSON.parse(responseText);
  } catch {}

  if (!response.ok) {
    logger.error(
      {
        resendStatus: response.status,
        resendErrorName: responseData.name,
        resendErrorMessage: responseData.message,
        requestId: response.headers.get("x-request-id"),
        from: sender,
        to,
      },
      "Error en respuesta de la API de Resend",
    );
    throw new ResendApiError(response.status, responseText, response.headers);
  }

  return {
    success: true,
    messageId: responseData.id,
  };
}
