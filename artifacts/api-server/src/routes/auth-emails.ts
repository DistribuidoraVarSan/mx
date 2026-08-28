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
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo electrónico inválido."),
  code: z.string().trim().min(4).max(12, "Código inválido."),
  recipientName: z.string().trim().max(100).optional(),
  language: z.string().optional(),
});

const SendPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo electrónico inválido."),
  resetCode: z.string().trim().min(4).max(12).optional(),
  resetUrl: z.string().url().optional(),
  recipientName: z.string().trim().max(100).optional(),
  language: z.string().optional(),
});

const SendSecurityAlertSchema = z.object({
  alertTitle: z.string().trim().min(3).max(200),
  alertDetails: z.string().trim().min(5).max(2000),
  actionUrl: z.string().url().optional(),
  language: z.string().optional(),
});

/**
 * Consulta la preferencia de idioma guardada en Firestore para un usuario o correo dado.
 */
async function fetchUserPreferredLanguage(uidOrEmail: { uid?: string; email?: string }): Promise<string | undefined> {
  try {
    if (uidOrEmail.uid) {
      const doc = await adminDb.collection("users").doc(uidOrEmail.uid).get();
      if (doc.exists) {
        const data = doc.data();
        if (data?.preferredLanguage) return data.preferredLanguage;
      }
    }
    if (uidOrEmail.email) {
      const snap = await adminDb.collection("users").where("email", "==", uidOrEmail.email).limit(1).get();
      if (!snap.empty) {
        const data = snap.docs[0].data();
        if (data?.preferredLanguage) return data.preferredLanguage;
      }
    }
  } catch (err) {
    logger.warn({ err }, "No se pudo consultar preferredLanguage en Firestore");
  }
  return undefined;
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
      const userLang = await fetchUserPreferredLanguage({ email });
      const emailLang = resolveEmailLanguage(reqLang, userLang);
      const { subject, html, text } = buildVerificationCodeEmail(emailLang, {
        code,
        recipientName,
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
      const userLang = await fetchUserPreferredLanguage({ email });
      const emailLang = resolveEmailLanguage(reqLang, userLang);
      const { subject, html, text } = buildPasswordResetEmail(emailLang, {
        resetCode,
        resetUrl,
        recipientName,
        expiresInMinutes: 15,
      });

      await sendEmail({
        to: email,
        subject,
        html,
        text,
        from: EMAIL_SENDERS.security,
      });

      res.status(200).json({ status: "ok", message: "Instrucciones de recuperación enviadas." });
    } catch (err) {
      logger.error({ err, email }, "Error al enviar correo de recuperación de contraseña");
      res.status(500).json({ error: "No se pudo enviar el correo de recuperación." });
    }
  },
);

/**
 * POST /api/auth/send-security-alert
 * Envía una alerta de seguridad desde el remitente de seguridad oficial al usuario autenticado.
 */
router.post(
  "/auth/send-security-alert",
  authRateLimit,
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

    const uid = req.user!.uid;
    const email = req.user!.email;

    if (!email) {
      res.status(400).json({ error: "El usuario no tiene correo asociado." });
      return;
    }

    const { alertTitle, alertDetails, actionUrl, language: reqLang } = parseResult.data;

    try {
      const userLang = await fetchUserPreferredLanguage({ uid, email });
      const emailLang = resolveEmailLanguage(reqLang, userLang);
      const { subject, html, text } = buildSecurityAlertEmail(emailLang, {
        recipientName: req.user!.name,
        alertTitle,
        alertDetails,
        actionUrl,
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
