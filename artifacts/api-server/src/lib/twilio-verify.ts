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
  channel: "sms" = "sms"
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
