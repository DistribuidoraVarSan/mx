import { logger } from "./logger";

export interface TwilioVerifyConfig {
  accountSid: string;
  authToken: string;
  serviceSid: string;
}

export function getTwilioVerifyConfig(): TwilioVerifyConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();

  if (!accountSid || !authToken || !serviceSid) {
    return null;
  }

  return { accountSid, authToken, serviceSid };
}

/**
 * Inicia una verificación SMS mediante Twilio Verify v2
 * POST https://verify.twilio.com/v2/Services/{ServiceSid}/Verifications
 */
export async function sendTwilioVerification(
  phoneNumber: string,
  channel: "sms" = "sms",
  locale: string = "es"
): Promise<{ success: boolean; status?: string; sid?: string; error?: string }> {
  const config = getTwilioVerifyConfig();
  if (!config) {
    logger.warn("Twilio Verify no configurado: faltan variables de entorno");
    return { success: false, error: "SMS_PROVIDER_NOT_CONFIGURED" };
  }

  try {
    const url = `https://verify.twilio.com/v2/Services/${encodeURIComponent(config.serviceSid)}/Verifications`;
    const authHeader = "Basic " + Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");

    const params = new URLSearchParams();
    params.append("To", phoneNumber);
    params.append("Channel", channel);
    if (locale) {
      params.append("Locale", locale);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = (await response.json().catch(() => ({}))) as Record<string, any>;

    if (!response.ok) {
      logger.error({ status: response.status, data }, "Error en Twilio Verify Verifications");
      return {
        success: false,
        error: data.message || `Error en Twilio Verify: HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      status: data.status,
      sid: data.sid,
    };
  } catch (err: any) {
    logger.error({ err }, "Error de red al conectar con Twilio Verify");
    return {
      success: false,
      error: err.message || "Error de conexión con Twilio Verify",
    };
  }
}

/**
 * Valida un código introducido por el cliente mediante Twilio Verify v2
 * POST https://verify.twilio.com/v2/Services/{ServiceSid}/VerificationCheck
 */
export async function checkTwilioVerification(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; approved: boolean; status?: string; error?: string }> {
  const config = getTwilioVerifyConfig();
  if (!config) {
    return { success: false, approved: false, error: "SMS_PROVIDER_NOT_CONFIGURED" };
  }

  try {
    const url = `https://verify.twilio.com/v2/Services/${encodeURIComponent(config.serviceSid)}/VerificationCheck`;
    const authHeader = "Basic " + Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");

    const params = new URLSearchParams();
    params.append("To", phoneNumber);
    params.append("Code", code.trim());

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = (await response.json().catch(() => ({}))) as Record<string, any>;

    if (!response.ok) {
      logger.error({ status: response.status, data }, "Error en Twilio Verify VerificationCheck");
      return {
        success: false,
        approved: false,
        error: data.message || `Error al validar código con Twilio Verify: HTTP ${response.status}`,
      };
    }

    const approved = data.status === "approved" && data.valid === true;
    return {
      success: true,
      approved,
      status: data.status,
    };
  } catch (err: any) {
    logger.error({ err }, "Error de red al verificar código con Twilio Verify");
    return {
      success: false,
      approved: false,
      error: err.message || "Error de conexión con Twilio Verify",
    };
  }
}

/**
 * Actualiza la configuración del servicio Twilio Verify (FriendlyName y longitud de código)
 * POST https://verify.twilio.com/v2/Services/{ServiceSid}
 */
export async function updateTwilioVerifyServiceConfig(
  friendlyName: string = "Distribuidora Var San",
  codeLength: number = 6
): Promise<{ success: boolean; friendlyName?: string; codeLength?: number; error?: string }> {
  const config = getTwilioVerifyConfig();
  if (!config) {
    return { success: false, error: "SMS_PROVIDER_NOT_CONFIGURED" };
  }

  try {
    const url = `https://verify.twilio.com/v2/Services/${encodeURIComponent(config.serviceSid)}`;
    const authHeader = "Basic " + Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");

    const params = new URLSearchParams();
    params.append("FriendlyName", friendlyName);
    params.append("CodeLength", String(codeLength));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = (await response.json().catch(() => ({}))) as Record<string, any>;
    if (!response.ok) {
      logger.error({ status: response.status, data }, "Error al actualizar configuración de Twilio Verify");
      return { success: false, error: data.message || `Error HTTP ${response.status}` };
    }

    return {
      success: true,
      friendlyName: data.friendly_name,
      codeLength: data.code_length,
    };
  } catch (err: any) {
    logger.error({ err }, "Error de red al actualizar Twilio Verify");
    return { success: false, error: err.message };
  }
}

/**
 * Obtiene los detalles actuales del servicio Twilio Verify
 * GET https://verify.twilio.com/v2/Services/{ServiceSid}
 */
export async function getTwilioVerifyServiceDetails(): Promise<{
  success: boolean;
  friendlyName?: string;
  codeLength?: number;
  sid?: string;
  error?: string;
}> {
  const config = getTwilioVerifyConfig();
  if (!config) {
    return { success: false, error: "SMS_PROVIDER_NOT_CONFIGURED" };
  }

  try {
    const url = `https://verify.twilio.com/v2/Services/${encodeURIComponent(config.serviceSid)}`;
    const authHeader = "Basic " + Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json().catch(() => ({}))) as Record<string, any>;
    if (!response.ok) {
      return { success: false, error: data.message || `Error HTTP ${response.status}` };
    }

    return {
      success: true,
      friendlyName: data.friendly_name,
      codeLength: data.code_length,
      sid: data.sid,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Consulta las plantillas de mensajes disponibles en la cuenta de Twilio Verify
 * GET https://verify.twilio.com/v2/Templates
 */
export async function listTwilioVerifyTemplates(): Promise<{
  success: boolean;
  templates?: Array<Record<string, any>>;
  error?: string;
}> {
  const config = getTwilioVerifyConfig();
  if (!config) {
    return { success: false, error: "SMS_PROVIDER_NOT_CONFIGURED" };
  }

  try {
    const url = `https://verify.twilio.com/v2/Templates`;
    const authHeader = "Basic " + Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json().catch(() => ({}))) as Record<string, any>;
    if (!response.ok) {
      return { success: false, error: data.message || `Error HTTP ${response.status}` };
    }

    return {
      success: true,
      templates: data.templates || [],
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
