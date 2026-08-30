import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "../lib/firebase-admin";
import { requireAuth } from "../middlewares/auth";
import { strictActionRateLimit, authRateLimit } from "../middlewares/rate-limit";
import { sendEmail, EMAIL_SENDERS } from "../lib/mailer";
import { db, newsletterSubscribersTable, eq } from "@workspace/db";
import {
  buildPasswordChangedEmail,
  buildEmailChangedEmail,
  buildAccountDeactivatedEmail,
  buildAccountDeletedEmail,
  resolveEmailLanguage,
} from "../lib/email-templates";
import { recordSecurityActivity } from "../lib/security-activity";
import { decryptTotpSecret, verifyTotp, hashSecurityCode } from "../lib/totp";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const UpdateProfileSchema = z.object({
  name: z.string().max(150),
  lastName: z.string().max(150).optional(),
  company: z.string().max(150).optional(),
  country: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
});

const PasswordChangedSchema = z.object({
  language: z.string().optional(),
});

const ChangeEmailSchema = z.object({
  newEmail: z.string().trim().toLowerCase().email("Correo electrónico inválido."),
  twoFactorCode: z.string().trim().optional(),
  language: z.string().optional(),
});

const DeactivateAccountSchema = z.object({
  confirm: z.boolean(),
  twoFactorCode: z.string().trim().optional(),
  language: z.string().optional(),
});

const DeleteAccountSchema = z.object({
  confirm: z.boolean(),
  twoFactorCode: z.string().trim().optional(),
  language: z.string().optional(),
});

/**
 * Consulta la información del perfil del usuario (nombre real y preferencia de idioma) en Firestore.
 */
async function fetchUserData(uid: string): Promise<{ name?: string; preferredLanguage?: string }> {
  try {
    const doc = await adminDb.collection("users").doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      return {
        name: typeof data?.name === "string" && data.name.trim().length > 0 ? data.name.trim() : undefined,
        preferredLanguage: typeof data?.preferredLanguage === "string" ? data.preferredLanguage : undefined,
      };
    }
  } catch (err) {
    logger.warn({ err, uid }, "No se pudo consultar información de perfil en Firestore");
  }
  return {};
}

/**
 * Verifica 2FA si el usuario tiene el segundo factor habilitado en su cuenta.
 */
async function verifyTwoFactorIfEnabled(uid: string, code?: string): Promise<{ valid: boolean; error?: string }> {
  try {
    let secDocRef = adminDb.collection("users").doc(uid).collection("security").doc("2fa");
    let secDoc = await secDocRef.get();
    if (!secDoc.exists) {
      secDocRef = adminDb.collection("users").doc(uid).collection("security").doc("2fa_config");
      secDoc = await secDocRef.get();
    }

    if (!secDoc.exists || !secDoc.data()?.enabled) {
      return { valid: true }; // No tiene 2FA activado
    }

    if (!code) {
      return { valid: false, error: "Esta operación requiere tu código de autenticación en dos pasos (2FA)." };
    }

    const secData = secDoc.data()!;
    const cleanCode = code.replace(/\s+/g, "");

    // 1. TOTP
    if (cleanCode.length === 6 && /^\d+$/.test(cleanCode)) {
      const secretBase32 = decryptTotpSecret(secData.encryptedSecret);
      const verifyRes = verifyTotp(secretBase32, cleanCode, { window: 1 });
      if (verifyRes.valid) return { valid: true };
    }

    // 2. Backup code
    const hashed = hashSecurityCode(cleanCode, uid);
    const backupCodes: string[] = Array.isArray(secData.backupCodes) ? secData.backupCodes : [];
    if (backupCodes.includes(hashed)) {
      // Consumir backup code
      await secDocRef.update({
        backupCodes: backupCodes.filter((c) => c !== hashed),
      });
      return { valid: true };
    }

    return { valid: false, error: "Código de autenticación 2FA incorrecto o expirado." };
  } catch (err) {
    logger.error({ err, uid }, "Error al verificar 2FA en operación de cuenta");
    return { valid: false, error: "Error al validar autenticación en dos pasos." };
  }
}

/**
 * POST /api/auth/account/password-changed
 * Notificación oficial de contraseña cambiada en Firebase Auth.
 */
router.post(
  "/auth/account/password-changed",
  authRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = PasswordChangedSchema.safeParse(req.body);
    const { language: reqLang } = parseResult.success ? parseResult.data : {};

    const uid = req.user!.uid;
    const email = req.user!.email;

    try {
      await recordSecurityActivity(uid, {
        type: "password_reset",
        title: "Contraseña actualizada",
        description: "Se actualizó la contraseña de acceso a la cuenta exitosamente.",
      });

      if (email) {
        const userData = await fetchUserData(uid);
        const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
        const recipientName = userData.name || req.user!.name || "Cliente Var San";
        const { subject, html, text } = buildPasswordChangedEmail(emailLang, {
          recipientName,
        });

        sendEmail({
          to: email,
          subject,
          html,
          text,
          from: EMAIL_SENDERS.security,
        }).catch(() => {});
      }

      res.status(200).json({ status: "ok", message: "Notificación de contraseña procesada." });
    } catch (err) {
      logger.error({ err, uid }, "Error al notificar cambio de contraseña");
      res.status(500).json({ error: "No se pudo procesar la notificación de cambio de contraseña." });
    }
  },
);

/**
 * POST /api/auth/account/change-email
 * Actualiza la dirección de correo del usuario en Firebase Auth y Firestore.
 */
router.post(
  "/auth/account/change-email",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = ChangeEmailSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: "Correo electrónico no válido.",
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { newEmail, twoFactorCode, language: reqLang } = parseResult.data;
    const uid = req.user!.uid;
    const oldEmail = req.user!.email;

    if (newEmail.toLowerCase() === oldEmail.toLowerCase()) {
      res.status(400).json({ error: "El nuevo correo electrónico debe ser diferente al actual." });
      return;
    }

    try {
      // 1. Verificación 2FA si está habilitado
      const twoFactorCheck = await verifyTwoFactorIfEnabled(uid, twoFactorCode);
      if (!twoFactorCheck.valid) {
        res.status(403).json({ error: twoFactorCheck.error });
        return;
      }

      // 2. Actualizar en Firebase Auth
      await adminAuth.updateUser(uid, {
        email: newEmail,
        emailVerified: false,
      });

      // 3. Actualizar en Firestore
      await adminDb.collection("users").doc(uid).set(
        {
          email: newEmail,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      // 4. Registrar en Actividad de Seguridad
      await recordSecurityActivity(uid, {
        type: "email_changed" as any,
        title: "Correo electrónico actualizado",
        description: `Se cambió el correo de la cuenta a ${newEmail}.`,
      });

      // 5. Enviar notificación transaccional a ambos correos desde cuentas@
      const userData = await fetchUserData(uid);
      const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
      const recipientName = userData.name || req.user!.name || "Cliente Var San";
      const { subject, html, text } = buildEmailChangedEmail(emailLang, {
        recipientName,
        oldEmail,
        newEmail,
      });

      // Enviar a la nueva dirección
      sendEmail({
        to: newEmail,
        subject,
        html,
        text,
        from: EMAIL_SENDERS.accounts,
      }).catch(() => {});

      // Enviar a la dirección previa como medida de seguridad
      if (oldEmail) {
        sendEmail({
          to: oldEmail,
          subject,
          html,
          text,
          from: EMAIL_SENDERS.security,
        }).catch(() => {});
      }

      res.status(200).json({
        status: "ok",
        message: "Correo electrónico actualizado exitosamente.",
      });
    } catch (err: any) {
      logger.error({ err, uid }, "Error al cambiar correo electrónico");
      if (err?.code === "auth/email-already-exists") {
        res.status(409).json({ error: "La nueva dirección de correo ya está en uso." });
        return;
      }
      res.status(500).json({ error: "No se pudo actualizar el correo electrónico." });
    }
  },
);

/**
 * POST /api/auth/account/deactivate
 * Desactiva la cuenta del usuario en Firebase Auth y revoca todas sus sesiones.
 */
router.post(
  "/auth/account/deactivate",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = DeactivateAccountSchema.safeParse(req.body);

    if (!parseResult.success || !parseResult.data.confirm) {
      res.status(400).json({ error: "Se requiere confirmación explícita para desactivar la cuenta." });
      return;
    }

    const { twoFactorCode, language: reqLang } = parseResult.data;
    const uid = req.user!.uid;
    const email = req.user!.email;
    const now = new Date().toISOString();

    try {
      // 1. Verificación 2FA si está habilitado
      const twoFactorCheck = await verifyTwoFactorIfEnabled(uid, twoFactorCode);
      if (!twoFactorCheck.valid) {
        res.status(403).json({ error: twoFactorCheck.error });
        return;
      }

      // 2. Deshabilitar usuario en Firebase Auth
      await adminAuth.updateUser(uid, { disabled: true });

      // 3. Marcar estado en Firestore
      await adminDb.collection("users").doc(uid).set(
        {
          status: "deactivated",
          deactivatedAt: now,
        },
        { merge: true },
      );

      // 4. Revocar todas las sesiones
      const sessionsSnap = await adminDb.collection("users").doc(uid).collection("sessions").get();
      const batch = adminDb.batch();
      sessionsSnap.docs.forEach((d) => {
        batch.update(d.ref, { revoked: true, revokedAt: now });
      });
      await batch.commit();

      // 5. Registrar evento de seguridad
      await recordSecurityActivity(uid, {
        type: "account_deactivated" as any,
        title: "Cuenta desactivada",
        description: "La cuenta fue desactivada a solicitud del usuario.",
      });

      // 6. Enviar correo transaccional de confirmación desde cuentas@
      if (email) {
        const userData = await fetchUserData(uid);
        const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
        const recipientName = userData.name || req.user!.name || "Cliente Var San";
        const { subject, html, text } = buildAccountDeactivatedEmail(emailLang, {
          recipientName,
          deactivationDate: now,
        });

        sendEmail({
          to: email,
          subject,
          html,
          text,
          from: EMAIL_SENDERS.accounts,
        }).catch(() => {});
      }

      res.status(200).json({
        status: "ok",
        message: "Tu cuenta ha sido desactivada exitosamente.",
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al desactivar cuenta");
      res.status(500).json({ error: "No se pudo procesar la desactivación de la cuenta." });
    }
  },
);

/**
 * POST /api/auth/account/delete
 * Elimina definitivamente la cuenta del usuario, purgando sus colecciones,
 * cancelando su suscripción a newsletter y eliminando su registro de autenticación.
 */
router.post(
  "/auth/account/delete",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = DeleteAccountSchema.safeParse(req.body);

    if (!parseResult.success || !parseResult.data.confirm) {
      res.status(400).json({ error: "Se requiere confirmación explícita para eliminar la cuenta de forma permanente." });
      return;
    }

    const { twoFactorCode, language: reqLang } = parseResult.data;
    const uid = req.user!.uid;
    const email = req.user!.email;
    const now = new Date().toISOString();

    try {
      // 1. Verificación 2FA si está habilitado
      const twoFactorCheck = await verifyTwoFactorIfEnabled(uid, twoFactorCode);
      if (!twoFactorCheck.valid) {
        res.status(403).json({ error: twoFactorCheck.error });
        return;
      }

      // 2. Obtener datos reales del usuario antes de purgar
      const userData = await fetchUserData(uid);
      const recipientName = userData.name || req.user!.name || "Cliente Var San";

      // 3. Enviar correo de confirmación final antes de purgar los datos
      if (email) {
        const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
        const { subject, html, text } = buildAccountDeletedEmail(emailLang, {
          recipientName,
          deletionDate: now,
        });

        await sendEmail({
          to: email,
          subject,
          html,
          text,
          from: EMAIL_SENDERS.accounts,
        }).catch(() => {});
      }

      // 4. Cancelar suscripción a newsletter de forma aislada e idempotente
      if (email) {
        try {
          const [existingSub] = await db
            .select()
            .from(newsletterSubscribersTable)
            .where(eq(newsletterSubscribersTable.email, email.toLowerCase().trim()))
            .limit(1);

          if (existingSub && existingSub.status !== "unsubscribed") {
            await db
              .update(newsletterSubscribersTable)
              .set({ status: "unsubscribed", unsubscribedAt: new Date() })
              .where(eq(newsletterSubscribersTable.id, existingSub.id));
          }
        } catch (newsletterErr) {
          logger.warn({ newsletterErr, email }, "No se pudo cancelar suscripción a newsletter durante eliminación de cuenta");
        }
      }

      // 5. Purga exhaustiva de todas las subcolecciones de users/{uid}
      const userRef = adminDb.collection("users").doc(uid);

      // Purgar subcolección sessions
      const sessionsSnap = await userRef.collection("sessions").get();
      const batch1 = adminDb.batch();
      sessionsSnap.docs.forEach((doc) => batch1.delete(doc.ref));
      await batch1.commit();

      // Purgar subcolección security
      const securitySnap = await userRef.collection("security").get();
      const batch2 = adminDb.batch();
      securitySnap.docs.forEach((doc) => batch2.delete(doc.ref));
      await batch2.commit();

      // Purgar subcolección security_activity
      const activitySnap = await userRef.collection("security_activity").get();
      const batch3 = adminDb.batch();
      activitySnap.docs.forEach((doc) => batch3.delete(doc.ref));
      await batch3.commit();

      // Eliminar el documento raíz de perfil en Firestore
      await userRef.delete();

      // 6. Eliminar el usuario en Firebase Authentication
      await adminAuth.deleteUser(uid);

      res.status(200).json({
        status: "ok",
        message: "Tu cuenta y datos asociados han sido eliminados de forma definitiva.",
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al eliminar cuenta definitivamente");
      res.status(500).json({ error: "No se pudo procesar la eliminación de la cuenta." });
    }
  },
);

/**
 * POST /api/auth/account/update-profile
 * Actualización segura y atómica del perfil de usuario en Firestore y Auth.
 */
router.post(
  "/auth/account/update-profile",
  authRateLimit,
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const parseResult = UpdateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Datos de perfil inválidos.", details: parseResult.error.flatten() });
      return;
    }

    const uid = req.user!.uid;
    const { name, lastName, company, country, phone } = parseResult.data;
    const cleanName = name.trim();
    const cleanLastName = (lastName || "").trim();
    const cleanCompany = (company || "").trim();
    const cleanCountry = (country || "México").trim();
    const cleanPhone = (phone || "").trim();

    try {
      const userRef = adminDb.collection("users").doc(uid);
      const updateData: Record<string, any> = {
        name: cleanName,
        lastName: cleanLastName,
        company: cleanCompany,
        country: cleanCountry,
        phone: cleanPhone,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await userRef.set(updateData, { merge: true });

      const fullName = `${cleanName} ${cleanLastName}`.trim();
      if (fullName) {
        await adminAuth.updateUser(uid, { displayName: fullName }).catch(() => {});
      }

      logger.info({ uid, cleanName, cleanLastName, cleanCompany, cleanCountry }, "Perfil de usuario actualizado exitosamente");
      res.status(200).json({ status: "ok", message: "Perfil actualizado correctamente." });
      return;
    } catch (err: any) {
      logger.error({ err, uid }, "Error al actualizar perfil vía backend");
      res.status(500).json({ error: "No se pudo guardar la información del perfil." });
      return;
    }
  },
);

export default router;
