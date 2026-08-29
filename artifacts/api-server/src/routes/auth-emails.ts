import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { sendEmail, EMAIL_SENDERS } from "../lib/mailer";
import {
  buildVerificationCodeEmail,
  buildPasswordResetEmail,
  buildPasswordChangedEmail,
  buildNewDeviceLoginEmail,
  buildSecurityAlertEmail,
  resolveEmailLanguage,
} from "../lib/email-templates";
import { requireAuth } from "../middlewares/auth";
import { authRateLimit, strictActionRateLimit } from "../middlewares/rate-limit";
import { adminDb } from "../lib/firebase-admin";
import { recordSecurityActivity } from "../lib/security-activity";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo electrónico inválido."),
  code: z.string().trim().min(4).max(12, "Código inválido."),
  recipientName: z.string().trim().max(100).optional(),
  language: z.string().optional(),
});

const ALLOWED_RESET_ORIGINS_PROD = [
  "https://distribuidoravarsan.com.mx",
  "https://www.distribuidoravarsan.com.mx",
  "https://distribuidora-var-san.firebaseapp.com",
  "https://distribuidora-var-san.web.app",
];

const ALLOWED_RESET_ORIGINS_DEV = [
  ...ALLOWED_RESET_ORIGINS_PROD,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

export function isValidResetUrl(urlStr?: string): boolean {
  if (!urlStr) return true;
  try {
    const parsed = new URL(urlStr);
    const isDev = process.env.NODE_ENV !== "production";
    const allowedOrigins = isDev ? ALLOWED_RESET_ORIGINS_DEV : ALLOWED_RESET_ORIGINS_PROD;
    return allowedOrigins.includes(parsed.origin);
  } catch {
    return false;
  }
}

const SendPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo electrónico inválido."),
  resetCode: z.string().trim().min(4).max(12).optional(),
  resetUrl: z
    .string()
    .trim()
    .url("URL de restablecimiento inválida.")
    .refine((val) => isValidResetUrl(val), {
      message: "La URL de restablecimiento debe pertenecer a un dominio oficial autorizado.",
    })
    .optional(),
  recipientName: z.string().trim().max(100).optional(),
  language: z.string().optional(),
});

const SendSecurityAlertSchema = z.object({
  alertTitle: z.string().trim().min(3).max(200),
  alertDetails: z.string().trim().min(5).max(2000),
  actionUrl: z
    .string()
    .trim()
    .url("URL de acción no válida.")
    .refine((val) => isValidResetUrl(val), {
      message: "La URL de acción debe pertenecer a un dominio oficial autorizado.",
    })
    .optional(),
  recipientName: z.string().trim().max(100).optional(),
  language: z.string().optional(),
});

/**
 * Consulta el perfil del usuario (nombre real y preferencia de idioma) guardada en Firestore.
 */
async function fetchUserData(uidOrEmail: { uid?: string; email?: string }): Promise<{ name?: string; preferredLanguage?: string }> {
  try {
    if (uidOrEmail.uid) {
      const doc = await adminDb.collection("users").doc(uidOrEmail.uid).get();
      if (doc.exists) {
        const data = doc.data();
        return {
          name: typeof data?.name === "string" && data.name.trim().length > 0 ? data.name.trim() : undefined,
          preferredLanguage: typeof data?.preferredLanguage === "string" ? data.preferredLanguage : undefined,
        };
      }
    }
    if (uidOrEmail.email) {
      const snap = await adminDb.collection("users").where("email", "==", uidOrEmail.email.toLowerCase().trim()).limit(1).get();
      if (!snap.empty) {
        const data = snap.docs[0].data();
        return {
          name: typeof data?.name === "string" && data.name.trim().length > 0 ? data.name.trim() : undefined,
          preferredLanguage: typeof data?.preferredLanguage === "string" ? data.preferredLanguage : undefined,
        };
      }
    }
  } catch (err) {
    logger.warn({ err }, "No se pudo consultar datos de usuario en Firestore");
  }
  return {};
}

/**
 * POST /api/auth/send-verification
 * Envía un correo con código de verificación desde el remitente de verificación oficial.
 */
router.post(
  "/auth/send-verification",
  strictActionRateLimit,
  async (req: Request, res: Response) => {
    const parseResult = SendVerificationSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: "Datos inválidos.",
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { email, code, recipientName, language: reqLang } = parseResult.data;

    try {
      const userData = await fetchUserData({ email });
      const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
      const resolvedName = recipientName || userData.name || "Cliente Var San";
      const { subject, html, text } = buildVerificationCodeEmail(emailLang, {
        code,
        recipientName: resolvedName,
        expiresInMinutes: 10,
      });

      await sendEmail({
        to: email,
        subject,
        html,
        text,
        from: EMAIL_SENDERS.verification,
      });

      res.status(200).json({ status: "ok", message: "Código de verificación enviado." });
    } catch (err) {
      logger.error({ err, email }, "Error al enviar código de verificación");
      res.status(500).json({ error: "No se pudo enviar el correo de verificación." });
    }
  },
);

/**
 * POST /api/auth/send-password-reset
 * Envía correo para restablecimiento de contraseña desde el remitente de seguridad oficial.
 */
router.post(
  "/auth/send-password-reset",
  strictActionRateLimit,
  async (req: Request, res: Response) => {
    const parseResult = SendPasswordResetSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: "Datos inválidos.",
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { email, resetCode, resetUrl, recipientName, language: reqLang } = parseResult.data;

    try {
      const userData = await fetchUserData({ email });
      const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
      const resolvedName = recipientName || userData.name || "Cliente Var San";
      const { subject, html, text } = buildPasswordResetEmail(emailLang, {
        resetCode,
        resetUrl,
        recipientName: resolvedName,
        expiresInMinutes: 15,
      });

      await sendEmail({
        to: email,
        subject,
        html,
        text,
        from: EMAIL_SENDERS.security,
      });

      res.status(200).json({ status: "ok", message: "Correo de restablecimiento enviado." });
    } catch (err) {
      logger.error({ err, email }, "Error al enviar restablecimiento de contraseña");
      res.status(500).json({ error: "No se pudo enviar el correo de restablecimiento." });
    }
  },
);

/**
 * POST /api/auth/send-security-alert
 * Envía una alerta de seguridad general al usuario autenticado.
 */
router.post(
  "/auth/send-security-alert",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = SendSecurityAlertSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: "Datos inválidos.",
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { alertTitle, alertDetails, recipientName, language: reqLang } = parseResult.data;
    const uid = req.user!.uid;
    const email = req.user!.email;

    if (!email) {
      res.status(400).json({ error: "No hay correo electrónico asociado." });
      return;
    }

    try {
      await recordSecurityActivity(uid, {
        type: "suspicious_activity_reported",
        title: alertTitle,
        description: alertDetails,
      });

      const userData = await fetchUserData({ uid, email });
      const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
      const resolvedName = recipientName || userData.name || req.user!.name || "Cliente Var San";
      const { subject, html, text } = buildSecurityAlertEmail(emailLang, {
        alertTitle,
        alertDetails,
        recipientName: resolvedName,
      });

      await sendEmail({
        to: email,
        subject,
        html,
        text,
        from: EMAIL_SENDERS.security,
      });

      res.status(200).json({ status: "ok", message: "Alerta de seguridad enviada." });
    } catch (err) {
      logger.error({ err, uid }, "Error al enviar alerta de seguridad");
      res.status(500).json({ error: "No se pudo enviar la alerta de seguridad." });
    }
  },
);

export default router;
