import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { adminDb } from "../lib/firebase-admin";
import { requireAuth } from "../middlewares/auth";
import { strictActionRateLimit, authRateLimit } from "../middlewares/rate-limit";
import { sendEmail, EMAIL_SENDERS } from "../lib/mailer";
import {
  generateTotpSecret,
  generateOtpauthUri,
  generateBackupCodes,
  hashSecurityCode,
  verifyTotp,
  encryptTotpSecret,
  decryptTotpSecret,
  generateRescueCode,
} from "../lib/totp";
import {
  buildVerificationCodeEmail,
  buildSecurityAlertEmail,
  resolveEmailLanguage,
} from "../lib/email-templates";
import { recordSecurityActivity } from "../lib/security-activity";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const Enable2FASchema = z.object({
  code: z.string().trim().min(6).max(8, "Código inválido."),
  language: z.string().optional(),
});

const Verify2FASchema = z.object({
  code: z.string().trim().optional(),
  backupCode: z.string().trim().optional(),
  rescueCode: z.string().trim().optional(),
  language: z.string().optional(),
}).refine((data) => data.code || data.backupCode || data.rescueCode, {
  message: "Debes proporcionar un código TOTP, un código de respaldo o un código de rescate.",
});

const Disable2FASchema = z.object({
  code: z.string().trim().optional(),
  backupCode: z.string().trim().optional(),
  language: z.string().optional(),
}).refine((data) => data.code || data.backupCode, {
  message: "Debes proporcionar tu código 2FA actual o un código de respaldo para desactivar.",
});

const RequestRescueSchema = z.object({
  language: z.string().optional(),
});

/**
 * Consulta la preferencia de idioma del usuario en Firestore.
 */
async function getUserLanguage(uid: string, fallbackLang?: string): Promise<string> {
  try {
    const doc = await adminDb.collection("users").doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      if (data?.preferredLanguage) return data.preferredLanguage;
    }
  } catch {}
  return resolveEmailLanguage(fallbackLang);
}

/**
 * GET /api/auth/2fa/status
 * Consulta el estado actual de 2FA para el usuario autenticado.
 * IMPORTANTE: NUNCA devuelve secretos, claves ni códigos en texto plano.
 */
router.get(
  "/auth/2fa/status",
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;

    try {
      const secDoc = await adminDb
        .collection("users")
        .doc(uid)
        .collection("security")
        .doc("2fa")
        .get();

      if (!secDoc.exists) {
        res.status(200).json({
          enabled: false,
        });
        return;
      }

      const data = secDoc.data();
      const enabled = data?.enabled === true;
      const enabledAt = (data?.enabledAt as string) || undefined;
      const backupCodesRemaining = Array.isArray(data?.backupCodes) ? data.backupCodes.length : 0;

      res.status(200).json({
        enabled,
        enabledAt,
        backupCodesRemaining,
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al consultar estado de 2FA");
      res.status(500).json({ error: "No se pudo consultar el estado de 2FA." });
    }
  },
);

/**
 * POST /api/auth/2fa/setup
 * Inicia el proceso de configuración de 2FA generando secreto temporal y códigos de respaldo.
 * ÚNICA vez que se retornan los códigos y el secreto para que el usuario los guarde y configure su app.
 */
router.post(
  "/auth/2fa/setup",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;
    const email = req.user!.email;

    try {
      const secretBase32 = generateTotpSecret();
      const otpauthUri = generateOtpauthUri(email || "cliente", secretBase32);
      const backupCodes = generateBackupCodes(8);

      const encryptedSecret = encryptTotpSecret(secretBase32);
      const hashedBackupCodes = backupCodes.map((code) => hashSecurityCode(code, uid));

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

      // Guardamos la configuración temporal pendiente de confirmación
      await adminDb
        .collection("users")
        .doc(uid)
        .collection("security")
        .doc("2fa_setup")
        .set({
          encryptedSecret,
          hashedBackupCodes,
          expiresAt,
          createdAt: new Date().toISOString(),
        });

      res.status(200).json({
        status: "ok",
        secretKey: secretBase32,
        otpauthUri,
        backupCodes,
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al iniciar configuración de 2FA");
      res.status(500).json({ error: "No se pudo generar la configuración de 2FA." });
    }
  },
);

/**
 * POST /api/auth/2fa/enable
 * Confirma y activa permanentemente 2FA tras verificar el primer código OTP.
 */
router.post(
  "/auth/2fa/enable",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = Enable2FASchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Código de verificación de 6 dígitos requerido." });
      return;
    }

    const uid = req.user!.uid;
    const email = req.user!.email;
    const { code, language: reqLang } = parseResult.data;

    try {
      const setupDocRef = adminDb
        .collection("users")
        .doc(uid)
        .collection("security")
        .doc("2fa_setup");

      const setupDoc = await setupDocRef.get();
      if (!setupDoc.exists) {
        res.status(400).json({
          error: "No hay una configuración de 2FA pendiente o ya expiró. Por favor genera una nueva.",
        });
        return;
      }

      const setupData = setupDoc.data()!;
      const expiresAtMs = new Date(setupData.expiresAt).getTime();
      if (Date.now() > expiresAtMs) {
        await setupDocRef.delete();
        res.status(400).json({
          error: "La sesión de configuración de 2FA ha expirado. Por favor inicia el proceso nuevamente.",
        });
        return;
      }

      const secretBase32 = decryptTotpSecret(setupData.encryptedSecret);
      const verifyResult = verifyTotp(secretBase32, code, { window: 1 });

      if (!verifyResult.valid) {
        res.status(400).json({
          error: "El código ingresado no coincide con el autenticador. Verifica la hora de tu dispositivo e intenta de nuevo.",
        });
        return;
      }

      const nowIso = new Date().toISOString();

      // Guardamos la configuración definitiva
      await adminDb
        .collection("users")
        .doc(uid)
        .collection("security")
        .doc("2fa")
        .set({
          enabled: true,
          encryptedSecret: setupData.encryptedSecret,
          backupCodes: setupData.hashedBackupCodes,
          enabledAt: nowIso,
          lastVerifiedStep: verifyResult.step ?? 0,
        });

      // Eliminamos el setup temporal
      await setupDocRef.delete();

      // Marcamos la sesión activa como verificada con 2FA
      if (req.sessionId) {
        await adminDb
          .collection("users")
          .doc(uid)
          .collection("sessions")
          .doc(req.sessionId)
          .set({ twoFactorVerified: true, twoFactorVerifiedAt: nowIso }, { merge: true });
      }

      await recordSecurityActivity(uid, {
        type: "2fa_enabled",
        title: "Autenticación en dos pasos activada",
        description: "Se configuró y activó correctamente la protección 2FA TOTP en tu cuenta.",
      });

      // Enviar correo de confirmación de activación
      const userLang = await getUserLanguage(uid, reqLang);
      const emailLang = resolveEmailLanguage(userLang);
      const { subject, html, text } = buildSecurityAlertEmail(emailLang, {
        recipientName: req.user!.name || "Cliente",
        alertTitle: "2FA Activado exitosamente",
        alertDetails: "La autenticación en dos pasos (2FA) ha sido activada en tu cuenta de Distribuidora Var San.",
      });

      if (email) {
        sendEmail({
          to: email,
          subject,
          html,
          text,
          from: EMAIL_SENDERS.security,
        }).catch((emailErr) => {
          logger.warn({ err: emailErr, uid }, "No se pudo enviar correo de confirmación de 2FA");
        });
      }

      res.status(200).json({
        status: "ok",
        message: "¡Autenticación en dos pasos activada exitosamente!",
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al activar 2FA");
      res.status(500).json({ error: "No se pudo activar el segundo factor." });
    }
  },
);

/**
 * POST /api/auth/2fa/verify
 * Valida el reto 2FA en login mediante TOTP, código de respaldo o código de rescate por correo.
 */
router.post(
  "/auth/2fa/verify",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = Verify2FASchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Parámetros de verificación inválidos." });
      return;
    }

    const uid = req.user!.uid;
    const email = req.user!.email;
    const { code, backupCode, rescueCode, language: reqLang } = parseResult.data;

    try {
      const secDocRef = adminDb
        .collection("users")
        .doc(uid)
        .collection("security")
        .doc("2fa");

      const secDoc = await secDocRef.get();
      if (!secDoc.exists || secDoc.data()?.enabled !== true) {
        // Si no tiene 2FA activado, marcamos verificado automáticamente
        if (req.sessionId) {
          await adminDb
            .collection("users")
            .doc(uid)
            .collection("sessions")
            .doc(req.sessionId)
            .set({ twoFactorVerified: true }, { merge: true });
        }
        res.status(200).json({ status: "ok", twoFactorVerified: true, message: "2FA no requerido." });
        return;
      }

      const secData = secDoc.data()!;
      const attemptsDocRef = adminDb
        .collection("users")
        .doc(uid)
        .collection("security")
        .doc("2fa_attempts");

      const attemptsDoc = await attemptsDocRef.get();
      const attemptsData = attemptsDoc.exists ? attemptsDoc.data() : null;
      const failedCount = attemptsData?.failedCount || 0;
      const lockedUntilMs = attemptsData?.lockedUntil ? new Date(attemptsData.lockedUntil).getTime() : 0;

      if (Date.now() < lockedUntilMs) {
        res.status(429).json({
          error: "Demasiados intentos fallidos. Por favor espera 15 minutos antes de intentar de nuevo.",
          code: "2FA_LOCKED",
        });
        return;
      }

      let isVerified = false;
      let usedMethod = "totp";

      // 1. Verificación por TOTP
      if (code) {
        const secretBase32 = decryptTotpSecret(secData.encryptedSecret);
        const lastStep = secData.lastVerifiedStep;
        const result = verifyTotp(secretBase32, code, { window: 1, lastVerifiedStep: lastStep });

        if (result.valid) {
          isVerified = true;
          usedMethod = "totp";
          await secDocRef.update({ lastVerifiedStep: result.step });
        }
      }

      // 2. Verificación por Backup Code (Consumo Atómico con Transacción)
      if (!isVerified && backupCode) {
        const hashedInput = hashSecurityCode(backupCode, uid);
        let remainingBackupCount = 0;

        try {
          const transactionResult = await adminDb.runTransaction(async (transaction) => {
            const secDoc = await transaction.get(secDocRef);
            if (!secDoc.exists || secDoc.data()?.enabled !== true) {
              return { success: false, reason: "not_enabled" };
            }

            const secData = secDoc.data()!;
            const storedHashes: string[] = Array.isArray(secData.backupCodes) ? [...secData.backupCodes] : [];
            const index = storedHashes.indexOf(hashedInput);

            if (index === -1) {
              return { success: false, reason: "invalid_code" };
            }

            // Eliminación atómica dentro de la transacción (un solo uso sin race conditions)
            storedHashes.splice(index, 1);
            transaction.update(secDocRef, { backupCodes: storedHashes });

            remainingBackupCount = storedHashes.length;
            return { success: true };
          });

          if (transactionResult.success) {
            isVerified = true;
            usedMethod = "backup_code";

            await recordSecurityActivity(uid, {
              type: "backup_code_used",
              title: "Código de respaldo 2FA utilizado",
              description: `Se utilizó un código de respaldo de un solo uso. Quedan ${remainingBackupCount} códigos disponibles.`,
            });

            // Notificamos por correo el uso del código de respaldo
            if (email) {
              const userLang = await getUserLanguage(uid, reqLang);
              const emailLang = resolveEmailLanguage(userLang);
              const { subject, html, text } = buildSecurityAlertEmail(emailLang, {
                recipientName: req.user!.name || "Cliente",
                alertTitle: "Uso de código de respaldo 2FA",
                alertDetails: `Se utilizó un código de respaldo de un solo uso para acceder a tu cuenta. Te quedan ${remainingBackupCount} códigos de respaldo disponibles.`,
              });
              sendEmail({ to: email, subject, html, text, from: EMAIL_SENDERS.security }).catch(() => {});
            }
          }
        } catch (txErr) {
          logger.warn({ err: txErr, uid }, "Conflicto o error en transacción de backup code");
        }
      }

      // 3. Verificación por Código de Rescate (Transacción Atómica con límite de 3 intentos y expiración)
      if (!isVerified && rescueCode) {
        const rescueDocRef = adminDb
          .collection("users")
          .doc(uid)
          .collection("security")
          .doc("2fa_rescue");

        const hashedInput = hashSecurityCode(rescueCode, uid);

        try {
          const rescueResult = await adminDb.runTransaction(async (transaction) => {
            const rescueDoc = await transaction.get(rescueDocRef);
            if (!rescueDoc.exists) {
              return { success: false, reason: "not_found" };
            }

            const rescueData = rescueDoc.data()!;
            const expiresMs = new Date(rescueData.expiresAt).getTime();
            const attempts = typeof rescueData.attempts === "number" ? rescueData.attempts : 0;

            // Si expiró o alcanzó el límite de intentos, invalidar/eliminar de inmediato
            if (Date.now() > expiresMs || attempts >= 3) {
              transaction.delete(rescueDocRef);
              return { success: false, reason: "expired_or_locked" };
            }

            if (rescueData.hashedCode === hashedInput) {
              // Código correcto: eliminar inmediatamente el documento de rescate (un solo uso atómico)
              transaction.delete(rescueDocRef);
              return { success: true };
            } else {
              // Intento incorrecto: incrementar contador de intentos
              const newAttempts = attempts + 1;
              if (newAttempts >= 3) {
                transaction.delete(rescueDocRef); // Invalida definitivamente al 3er fallo
              } else {
                transaction.update(rescueDocRef, { attempts: newAttempts });
              }
              return { success: false, reason: "invalid_code", attemptsRemaining: Math.max(0, 3 - newAttempts) };
            }
          });

          if (rescueResult.success) {
            isVerified = true;
            usedMethod = "rescue_email";

            await recordSecurityActivity(uid, {
              type: "rescue_code_used",
              title: "Código de rescate 2FA utilizado",
              description: "Se verificó el acceso de emergencia mediante el código enviado por correo.",
            });
          }

        } catch (rescueErr) {
          logger.warn({ err: rescueErr, uid }, "Error en transacción de código de rescate");
        }
      }


      if (!isVerified) {
        const newFailedCount = failedCount + 1;
        const lockUpdates: Record<string, any> = { failedCount: newFailedCount };

        if (newFailedCount >= 5) {
          lockUpdates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        }

        await attemptsDocRef.set(lockUpdates, { merge: true });

        res.status(400).json({
          error: "Código de autenticación incorrecto o expirado.",
          code: "INVALID_2FA_CODE",
          remainingAttempts: Math.max(0, 5 - newFailedCount),
        });
        return;
      }

      // Si fue exitoso, limpiamos intentos fallidos
      await attemptsDocRef.delete().catch(() => {});

      const nowIso = new Date().toISOString();

      // Marcamos la sesión activa como verificada
      if (req.sessionId) {
        await adminDb
          .collection("users")
          .doc(uid)
          .collection("sessions")
          .doc(req.sessionId)
          .set({ twoFactorVerified: true, twoFactorVerifiedAt: nowIso }, { merge: true });
      }

      res.status(200).json({
        status: "ok",
        twoFactorVerified: true,
        method: usedMethod,
        message: "Verificación de dos pasos completada correctamente.",
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al verificar código 2FA");
      res.status(500).json({ error: "No se pudo procesar la verificación 2FA." });
    }
  },
);

/**
 * POST /api/auth/2fa/disable
 * Desactiva 2FA previa validación de código de seguridad.
 */
router.post(
  "/auth/2fa/disable",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = Disable2FASchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Se requiere un código 2FA válido para desactivar la protección." });
      return;
    }

    const uid = req.user!.uid;
    const email = req.user!.email;
    const { code, backupCode, language: reqLang } = parseResult.data;

    try {
      const secDocRef = adminDb
        .collection("users")
        .doc(uid)
        .collection("security")
        .doc("2fa");

      const secDoc = await secDocRef.get();
      if (!secDoc.exists || secDoc.data()?.enabled !== true) {
        res.status(400).json({ error: "La autenticación en dos pasos no está activa." });
        return;
      }

      const secData = secDoc.data()!;
      let isValid = false;

      if (code) {
        const secretBase32 = decryptTotpSecret(secData.encryptedSecret);
        const verifyRes = verifyTotp(secretBase32, code, { window: 1 });
        if (verifyRes.valid) isValid = true;
      }

      if (!isValid && backupCode) {
        const hashedInput = hashSecurityCode(backupCode, uid);
        const storedHashes: string[] = Array.isArray(secData.backupCodes) ? secData.backupCodes : [];
        if (storedHashes.includes(hashedInput)) isValid = true;
      }

      if (!isValid) {
        res.status(400).json({ error: "Código incorrecto. No se puede desactivar 2FA sin verificación válida." });
        return;
      }

      await secDocRef.delete();

      await recordSecurityActivity(uid, {
        type: "2fa_disabled",
        title: "Autenticación en dos pasos desactivada",
        description: "Se desactivó la protección 2FA en tu cuenta.",
      });

      // Enviar correo de alerta por desactivación
      if (email) {
        const userLang = await getUserLanguage(uid, reqLang);
        const emailLang = resolveEmailLanguage(userLang);
        const { subject, html, text } = buildSecurityAlertEmail(emailLang, {
          recipientName: req.user!.name || "Cliente",
          alertTitle: "2FA Desactivado",
          alertDetails: "La autenticación en dos pasos (2FA) ha sido desactivada en tu cuenta. Si no realizaste esta acción, cambia tu contraseña de inmediato.",
        });
        sendEmail({ to: email, subject, html, text, from: EMAIL_SENDERS.security }).catch(() => {});
      }

      res.status(200).json({
        status: "ok",
        message: "Autenticación en dos pasos desactivada correctamente.",
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al desactivar 2FA");
      res.status(500).json({ error: "No se pudo desactivar el segundo factor." });
    }
  },
);

/**
 * POST /api/auth/2fa/request-rescue-code
 * Envía un código OTP temporal de 6 dígitos al correo del usuario como respaldo de emergencia.
 */
router.post(
  "/auth/2fa/request-rescue-code",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = RequestRescueSchema.safeParse(req.body);
    const reqLang = parseResult.success ? parseResult.data.language : undefined;

    const uid = req.user!.uid;
    const email = req.user!.email;

    if (!email) {
      res.status(400).json({ error: "No hay correo electrónico asociado a esta cuenta." });
      return;
    }

    try {
      const rescueCode = generateRescueCode();
      const hashedCode = hashSecurityCode(rescueCode, uid);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

      await adminDb
        .collection("users")
        .doc(uid)
        .collection("security")
        .doc("2fa_rescue")
        .set({
          hashedCode,
          expiresAt,
          attempts: 0,
          maxAttempts: 3,
          createdAt: new Date().toISOString(),
        });

      const userLang = await getUserLanguage(uid, reqLang);
      const emailLang = resolveEmailLanguage(userLang);

      const { subject, html, text } = buildVerificationCodeEmail(emailLang, {
        code: rescueCode,
        recipientName: req.user!.name || "Cliente",
        expiresInMinutes: 10,
      });

      await sendEmail({
        to: email,
        subject: `[Seguridad] ${subject}`,
        html,
        text,
        from: EMAIL_SENDERS.security,
      });

      res.status(200).json({
        status: "ok",
        message: "Se envió un código de rescate temporal a tu correo electrónico registrado.",
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al solicitar código de rescate 2FA");
      res.status(500).json({ error: "No se pudo enviar el código de rescate por correo." });
    }
  },
);

export default router;
