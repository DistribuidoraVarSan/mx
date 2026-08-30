import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { adminDb } from "../lib/firebase-admin";
import { requireAuth } from "../middlewares/auth";
import { strictActionRateLimit, authRateLimit } from "../middlewares/rate-limit";
import { sendEmail, EMAIL_SENDERS } from "../lib/mailer";
import {
  buildVerificationCodeEmail,
  buildSecurityAlertEmail,
  buildBackupCodesEmail,
  resolveEmailLanguage,
} from "../lib/email-templates";
import { recordSecurityActivity } from "../lib/security-activity";
import { logger } from "../lib/logger";
import {
  getTwilioVerifyConfig,
  sendTwilioVerification,
  checkTwilioVerification,
} from "../lib/twilio-verify";

const router: IRouter = Router();

// Helper para generar hash SHA-256 seguro de un código numérico o de respaldo
function hashSecurityCode(code: string, salt: string): string {
  const normalized = code.trim().toUpperCase();
  return crypto.createHash("sha256").update(`${salt}:${normalized}`).digest("hex");
}

// Genera un conjunto de códigos de respaldo criptográficamente aleatorios de un solo uso
function generateBackupCodes(uid: string, count = 8): {
  rawCodes: string[];
  hashedRecords: { codeHash: string; used: boolean; createdAt: string }[];
} {
  const rawCodes: string[] = [];
  const hashedRecords: { codeHash: string; used: boolean; createdAt: string }[] = [];
  const nowIso = new Date().toISOString();

  for (let i = 0; i < count; i++) {
    const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const code = `${part1}-${part2}`;
    rawCodes.push(code);
    hashedRecords.push({
      codeHash: hashSecurityCode(code, uid),
      used: false,
      createdAt: nowIso,
    });
  }
  return { rawCodes, hashedRecords };
}

// Normaliza un número telefónico (e.g. +52 55 1234 5678 -> +525512345678)
function normalizePhoneNumber(rawPhone: string): string {
  const trimmed = rawPhone.trim();
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) {
    return `+${digitsOnly}`;
  }
  if (digitsOnly.length === 10) {
    return `+52${digitsOnly}`;
  }
  return `+${digitsOnly}`;
}

// Oculta caracteres sensibles para mostrar en la interfaz (e.g. m***@ejemplo.com o +52 *** *** 5678)
function maskIdentifier(target: string, isPhone = false): string {
  if (!target) return "";
  if (isPhone) {
    const clean = target.replace(/\s+/g, "");
    if (clean.length <= 4) return clean;
    return `${clean.slice(0, 3)} *** *** ${clean.slice(-4)}`;
  }
  const [user, domain] = target.split("@");
  if (!domain) return target;
  const maskedUser = user.length <= 2 ? `${user[0]}*` : `${user[0]}${"*".repeat(Math.min(user.length - 2, 5))}${user.slice(-1)}`;
  return `${maskedUser}@${domain}`;
}

async function fetchUserData(uid: string): Promise<{ name?: string; email?: string; preferredLanguage?: string }> {
  try {
    const doc = await adminDb.collection("users").doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      return {
        name: typeof data?.name === "string" && data.name.trim().length > 0 ? data.name.trim() : undefined,
        email: typeof data?.email === "string" ? data.email.trim() : undefined,
        preferredLanguage: typeof data?.preferredLanguage === "string" ? data.preferredLanguage : undefined,
      };
    }
  } catch (err) {
    logger.warn({ err, uid }, "No se pudo consultar datos de usuario en Firestore");
  }
  return {};
}

/**
 * GET /api/auth/2fa/status (y /api/auth/two-factor/status)
 * Consulta el estado actual de 2FA del usuario autenticado.
 */
router.get(
  ["/auth/2fa/status", "/auth/two-factor/status"],
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;

    try {
      // Consultar documento de seguridad 2fa y doc principal users
      const secDoc = await adminDb.collection("users").doc(uid).collection("security").doc("2fa").get();
      const userDoc = await adminDb.collection("users").doc(uid).get();

      const secData = secDoc.exists ? secDoc.data() : null;
      const userData = userDoc.exists ? userDoc.data() : null;

      const enabled = secData?.enabled === true || userData?.twoFactor?.enabled === true;
      const method = secData?.method || userData?.twoFactor?.method || "email";
      const phone = secData?.phone || userData?.twoFactor?.phone || userData?.phone || "";
      const enabledAt = secData?.enabledAt || userData?.twoFactor?.updatedAt?.toDate?.()?.toISOString?.() || undefined;

      res.status(200).json({
        enabled,
        method,
        phone,
        enabledAt,
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al consultar estado de 2FA");
      res.status(500).json({ error: "No se pudo consultar el estado de 2FA." });
    }
  },
);

const RequestSetupCodeSchema = z.object({
  phone: z.string().min(8, "Número celular requerido (mínimo 8 dígitos)."),
  method: z.enum(["email", "sms"]).default("email"),
  language: z.string().optional(),
});

/**
 * POST /api/auth/2fa/request-setup-code (y /api/auth/2fa/setup)
 * Inicia la activación de 2FA enviando un código de verificación al método elegido.
 */
router.post(
  ["/auth/2fa/request-setup-code", "/auth/two-factor/request-setup-code", "/auth/2fa/setup", "/auth/two-factor/setup"],
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = RequestSetupCodeSchema.safeParse(req.body);
    if (!parseResult.success) {
      const err = parseResult.error.errors[0]?.message || "Datos de teléfono inválidos.";
      res.status(400).json({ error: err });
      return;
    }

    const uid = req.user!.uid;
    const userEmail = req.user!.email;
    const { phone: rawPhone, method, language: reqLang } = parseResult.data;
    const phone = normalizePhoneNumber(rawPhone);

    // ==========================================
    // MÉTODO 1: MENSAJE SMS CON TWILIO VERIFY
    // ==========================================
    if (method === "sms") {
      const twilioConfig = getTwilioVerifyConfig();
      if (!twilioConfig) {
        res.status(503).json({
          error: "SMS_PROVIDER_NOT_CONFIGURED",
          message: "El servicio de mensajes SMS no está configurado en el servidor. Por favor selecciona la opción de verificación por Correo electrónico.",
        });
        return;
      }

      try {
        const twilioRes = await sendTwilioVerification(phone, "sms", reqLang || "es");
        if (!twilioRes.success) {
          res.status(400).json({
            error: twilioRes.error || "No se pudo enviar el código por SMS. Verifica que el número sea válido.",
          });
          return;
        }

        // Guardar registro de activación pendiente SMS
        await adminDb
          .collection("users")
          .doc(uid)
          .collection("security")
          .doc("2fa_setup_code")
          .set({
            phone,
            method: "sms",
            attempts: 0,
            maxAttempts: 5,
            expiresAt: Date.now() + 15 * 60 * 1000,
            createdAt: new Date().toISOString(),
          });

        res.status(200).json({
          status: "ok",
          message: `Código de verificación enviado por SMS a ${maskIdentifier(phone, true)}.`,
          method: "sms",
          phone,
        });
        return;
      } catch (smsErr: any) {
        logger.error({ err: smsErr, uid }, "Error al solicitar código SMS con Twilio Verify");
        res.status(500).json({ error: "Error al enviar el mensaje SMS de verificación." });
        return;
      }
    }

    // ==========================================
    // MÉTODO 2: CORREO ELECTRÓNICO CON RESEND
    // ==========================================
    if (!userEmail) {
      res.status(400).json({ error: "La cuenta no tiene un correo electrónico registrado para recibir el código." });
      return;
    }

    try {
      // Generar código numérico criptográfico de 6 dígitos (100000 - 999999)
      const code = crypto.randomInt(100000, 1000000).toString();
      const codeHash = hashSecurityCode(code, uid);
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

      // Guardar en Firestore con hash SHA-256
      await adminDb
        .collection("users")
        .doc(uid)
        .collection("security")
        .doc("2fa_setup_code")
        .set({
          codeHash,
          phone,
          method: "email",
          attempts: 0,
          maxAttempts: 5,
          expiresAt,
          createdAt: new Date().toISOString(),
        });

      const userData = await fetchUserData(uid);
      const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
      const recipientName = userData.name || req.user!.name || "Cliente Var San";

      const { subject, html, text } = buildVerificationCodeEmail(emailLang, {
        code,
        recipientName,
        expiresInMinutes: 15,
      });

      await sendEmail({
        to: userEmail,
        subject: `[Seguridad] ${subject}`,
        html,
        text,
        from: EMAIL_SENDERS.security,
      });

      res.status(200).json({
        status: "ok",
        message: `Código de 6 dígitos enviado a tu correo ${maskIdentifier(userEmail)}.`,
        method: "email",
        phone,
      });
    } catch (err: any) {
      logger.error({ err, uid }, "Error al generar/enviar código de configuración 2FA por correo");
      res.status(500).json({ error: "No se pudo enviar el código de verificación. Intenta de nuevo." });
    }
  },
);

const VerifyAndEnableSchema = z.object({
  code: z.string().trim().min(4).max(10, "Introduce el código de verificación recibido."),
  language: z.string().optional(),
});

/**
 * POST /api/auth/2fa/verify-and-enable (y /api/auth/2fa/enable)
 * Verifica el código (vía Twilio Verify para SMS o SHA-256 para Email) y activa 2FA.
 */
router.post(
  ["/auth/2fa/verify-and-enable", "/auth/two-factor/verify-and-enable", "/auth/2fa/enable", "/auth/two-factor/enable"],
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = VerifyAndEnableSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Introduce un código de verificación válido." });
      return;
    }

    const uid = req.user!.uid;
    const userEmail = req.user!.email;
    const { code, language: reqLang } = parseResult.data;

    try {
      const setupDocRef = adminDb.collection("users").doc(uid).collection("security").doc("2fa_setup_code");
      const setupDoc = await setupDocRef.get();

      if (!setupDoc.exists) {
        res.status(400).json({
          error: "No hay ninguna solicitud de activación pendiente o el código ya fue utilizado. Solicita uno nuevo.",
        });
        return;
      }

      const setupData = setupDoc.data()!;
      const now = Date.now();
      const expiresAt = typeof setupData.expiresAt === "number" ? setupData.expiresAt : 0;
      const attempts = typeof setupData.attempts === "number" ? setupData.attempts : 0;

      if (now > expiresAt) {
        await setupDocRef.delete();
        res.status(400).json({ error: "El código de verificación ha expirado (límite 15 minutos). Solicita uno nuevo." });
        return;
      }

      if (attempts >= 5) {
        await setupDocRef.delete();
        res.status(429).json({ error: "Has alcanzado el límite máximo de intentos (5). Solicita un nuevo código." });
        return;
      }

      const method = setupData.method || "email";
      const phone = setupData.phone || "";

      // 1. Verificación por SMS con Twilio Verify
      if (method === "sms") {
        const verifyRes = await checkTwilioVerification(phone, code);
        if (!verifyRes.approved) {
          await setupDocRef.update({ attempts: attempts + 1 });
          const remaining = Math.max(0, 5 - (attempts + 1));
          res.status(400).json({
            error: verifyRes.error || `Código SMS incorrecto o expirado. Te quedan ${remaining} intento(s).`,
          });
          return;
        }
      } else {
        // 2. Verificación por Correo electrónico con hash SHA-256
        const inputHash = hashSecurityCode(code, uid);
        if (inputHash !== setupData.codeHash) {
          await setupDocRef.update({ attempts: attempts + 1 });
          const remaining = Math.max(0, 5 - (attempts + 1));
          res.status(400).json({
            error: `Código de verificación incorrecto. Te quedan ${remaining} intento(s).`,
          });
          return;
        }
      }

      // Código correcto: eliminar documento temporal de setup
      await setupDocRef.delete();

      const nowIso = new Date().toISOString();

      // Generar 8 códigos de respaldo criptográficos de un solo uso
      const { rawCodes, hashedRecords } = generateBackupCodes(uid, 8);

      // Guardar códigos hasheados en users/{uid}/security/2fa_backup_codes
      await adminDb.collection("users").doc(uid).collection("security").doc("2fa_backup_codes").set({
        codes: hashedRecords,
        generatedAt: nowIso,
      });

      // Guardar en users/{uid}/security/2fa
      await adminDb.collection("users").doc(uid).collection("security").doc("2fa").set({
        enabled: true,
        method,
        phone,
        backupCodes: rawCodes,
        backupCodesCount: rawCodes.length,
        enabledAt: nowIso,
        updatedAt: nowIso,
      });

      // Guardar también en el doc principal users/{uid} para sincronización directa
      await adminDb.collection("users").doc(uid).set(
        {
          twoFactor: {
            enabled: true,
            method,
            phone,
          },
          phone: phone || undefined,
        },
        { merge: true },
      );

      // Registrar evento de seguridad
      await recordSecurityActivity(uid, {
        type: "2fa_enabled",
        title: "Autenticación en dos fases activada",
        description: `Se activó la protección 2FA vía ${method === "sms" ? "Mensaje SMS" : "Correo electrónico"}.`,
      });

      // Enviar correo de códigos de respaldo oficial con Resend
      if (userEmail) {
        const userData = await fetchUserData(uid);
        const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
        const recipientName = userData.name || req.user!.name || "Cliente Var San";
        const backupEmail = buildBackupCodesEmail(emailLang, {
          recipientName,
          backupCodes: rawCodes,
          generatedAt: nowIso,
        });

        sendEmail({
          to: userEmail,
          subject: backupEmail.subject,
          html: backupEmail.html,
          text: backupEmail.text,
          from: EMAIL_SENDERS.security,
        }).catch((err) => logger.warn({ err }, "No se pudo enviar correo de códigos de respaldo"));
      }

      res.status(200).json({
        status: "ok",
        message: "¡Autenticación en dos fases activada exitosamente!",
        backupCodes: rawCodes,
        twoFactor: {
          enabled: true,
          method,
          phone,
          enabledAt: nowIso,
        },
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al confirmar y activar 2FA");
      res.status(500).json({ error: "No se pudo activar 2FA. Intenta de nuevo." });
    }
  },
);

/**
 * GET /api/auth/2fa/backup-codes (y /api/auth/two-factor/backup-codes)
 * Consulta los códigos de respaldo del usuario autenticado.
 */
router.get(
  ["/auth/2fa/backup-codes", "/auth/two-factor/backup-codes"],
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;
    try {
      const secDoc = await adminDb.collection("users").doc(uid).collection("security").doc("2fa").get();
      const backupDoc = await adminDb.collection("users").doc(uid).collection("security").doc("2fa_backup_codes").get();

      if (!secDoc.exists || secDoc.data()?.enabled !== true) {
        res.status(400).json({ error: "La autenticación en dos fases no está activa." });
        return;
      }

      const secData = secDoc.data()!;
      const backupData = backupDoc.exists ? backupDoc.data()! : null;
      const hashedCodes = backupData?.codes || [];
      const unusedCount = hashedCodes.filter((c: any) => !c.used).length;

      let codes: string[] = secData.backupCodes || [];
      if (codes.length === 0) {
        const generated = generateBackupCodes(uid, 8);
        codes = generated.rawCodes;
        await adminDb.collection("users").doc(uid).collection("security").doc("2fa_backup_codes").set({
          codes: generated.hashedRecords,
          generatedAt: new Date().toISOString(),
        });
        await adminDb.collection("users").doc(uid).collection("security").doc("2fa").set(
          { backupCodes: codes, backupCodesCount: codes.length },
          { merge: true },
        );
      }

      res.status(200).json({
        status: "ok",
        backupCodes: codes,
        total: codes.length,
        unused: unusedCount || codes.length,
        generatedAt: secData.updatedAt || secData.enabledAt,
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al obtener códigos de respaldo");
      res.status(500).json({ error: "No se pudieron obtener los códigos de respaldo." });
    }
  },
);

/**
 * POST /api/auth/2fa/backup-codes/regenerate (y /api/auth/two-factor/backup-codes/regenerate)
 * Regenera un conjunto nuevo de códigos de respaldo y los envía por correo.
 */
router.post(
  ["/auth/2fa/backup-codes/regenerate", "/auth/two-factor/backup-codes/regenerate"],
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;
    const userEmail = req.user!.email;
    const reqLang = (req.body?.language as string) || undefined;

    try {
      const secDoc = await adminDb.collection("users").doc(uid).collection("security").doc("2fa").get();
      if (!secDoc.exists || secDoc.data()?.enabled !== true) {
        res.status(400).json({ error: "La autenticación en dos fases no está activa." });
        return;
      }

      const nowIso = new Date().toISOString();
      const { rawCodes, hashedRecords } = generateBackupCodes(uid, 8);

      await adminDb.collection("users").doc(uid).collection("security").doc("2fa_backup_codes").set({
        codes: hashedRecords,
        generatedAt: nowIso,
      });

      await adminDb.collection("users").doc(uid).collection("security").doc("2fa").set(
        {
          backupCodes: rawCodes,
          backupCodesCount: rawCodes.length,
          updatedAt: nowIso,
        },
        { merge: true },
      );

      await recordSecurityActivity(uid, {
        type: "2fa_backup_regenerated",
        title: "Códigos de respaldo regenerados",
        description: "Se generó un nuevo conjunto de códigos de respaldo de un solo uso.",
      });

      // Enviar correo con los nuevos códigos
      if (userEmail) {
        const userData = await fetchUserData(uid);
        const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
        const recipientName = userData.name || req.user!.name || "Cliente Var San";
        const backupEmail = buildBackupCodesEmail(emailLang, {
          recipientName,
          backupCodes: rawCodes,
          generatedAt: nowIso,
        });

        sendEmail({
          to: userEmail,
          subject: backupEmail.subject,
          html: backupEmail.html,
          text: backupEmail.text,
          from: EMAIL_SENDERS.security,
        }).catch((err) => logger.warn({ err }, "No se pudo enviar correo de códigos de respaldo regenerados"));
      }

      res.status(200).json({
        status: "ok",
        message: "Nuevos códigos de respaldo generados y enviados a tu correo.",
        backupCodes: rawCodes,
        generatedAt: nowIso,
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al regenerar códigos de respaldo");
      res.status(500).json({ error: "No se pudieron regenerar los códigos de respaldo." });
    }
  },
);

/**
 * POST /api/auth/2fa/send-backup-codes-email (y /api/auth/two-factor/send-backup-codes-email)
 * Envía por correo los códigos de respaldo existentes al usuario.
 */
router.post(
  ["/auth/2fa/send-backup-codes-email", "/auth/two-factor/send-backup-codes-email"],
  strictActionRateLimit,
  async (req: Request, res: Response) => {
    const userEmail = (req.body?.email as string) || req.user?.email;
    const uid = (req.body?.uid as string) || req.user?.uid;
    const reqLang = (req.body?.language as string) || undefined;

    if (!userEmail) {
      res.status(400).json({ error: "Correo electrónico requerido." });
      return;
    }

    try {
      let codes: string[] = [];
      let recipientName = "Cliente Var San";

      if (uid) {
        const secDoc = await adminDb.collection("users").doc(uid).collection("security").doc("2fa").get();
        const secData = secDoc.exists ? secDoc.data()! : null;
        codes = secData?.backupCodes || [];

        const userData = await fetchUserData(uid);
        recipientName = userData.name || "Cliente Var San";
      }

      if (codes.length === 0) {
        const generated = generateBackupCodes(uid || "temp", 8);
        codes = generated.rawCodes;
        if (uid) {
          await adminDb.collection("users").doc(uid).collection("security").doc("2fa_backup_codes").set({
            codes: generated.hashedRecords,
            generatedAt: new Date().toISOString(),
          });
          await adminDb.collection("users").doc(uid).collection("security").doc("2fa").set(
            { backupCodes: codes, backupCodesCount: codes.length },
            { merge: true },
          );
        }
      }

      const emailLang = resolveEmailLanguage(undefined, reqLang);
      const backupEmail = buildBackupCodesEmail(emailLang, {
        recipientName,
        backupCodes: codes,
        generatedAt: new Date().toISOString(),
      });

      const emailResult = await sendEmail({
        to: userEmail,
        subject: backupEmail.subject,
        html: backupEmail.html,
        text: backupEmail.text,
        from: EMAIL_SENDERS.security,
      });

      res.status(200).json({
        status: "ok",
        accepted: emailResult.success,
        messageId: emailResult.messageId || undefined,
        message: `Códigos de respaldo enviados a ${maskIdentifier(userEmail)}.`,
      });
    } catch (err: any) {
      logger.error({ err, userEmail }, "Error al enviar correo de códigos de respaldo");
      res.status(500).json({ error: "No se pudo enviar el correo de códigos de respaldo." });
    }
  },
);

const SendLoginCodeSchema = z.object({
  uid: z.string().min(1, "UID de usuario requerido."),
  language: z.string().optional(),
});

/**
 * POST /api/auth/2fa/send-login-code
 * Envía el código 2FA al método configurado cuando un usuario intenta iniciar sesión.
 */
router.post(
  "/auth/2fa/send-login-code",
  authRateLimit,
  async (req: Request, res: Response) => {
    const parseResult = SendLoginCodeSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Identificador de usuario requerido." });
      return;
    }

    const { uid, language: reqLang } = parseResult.data;

    try {
      const userDoc = await adminDb.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        res.status(404).json({ error: "Usuario no encontrado." });
        return;
      }

      const userData = userDoc.data()!;
      const secDoc = await adminDb.collection("users").doc(uid).collection("security").doc("2fa").get();
      const secData = secDoc.exists ? secDoc.data() : null;

      const enabled = secData?.enabled === true || userData?.twoFactor?.enabled === true;
      if (!enabled) {
        res.status(200).json({ enabled: false, message: "2FA no configurado." });
        return;
      }

      const method = secData?.method || userData?.twoFactor?.method || "email";
      const phone = secData?.phone || userData?.twoFactor?.phone || userData?.phone || "";
      const userEmail = (userData?.email as string) || "";

      // 1. Si el método es SMS, despachar mediante Twilio Verify
      if (method === "sms") {
        const twilioConfig = getTwilioVerifyConfig();
        if (!twilioConfig) {
          res.status(503).json({
            error: "SMS_PROVIDER_NOT_CONFIGURED",
            message: "El servicio de mensajes SMS no está disponible actualmente.",
          });
          return;
        }

        const twilioRes = await sendTwilioVerification(phone, "sms", reqLang || (userData?.preferredLanguage as string) || "es");
        if (!twilioRes.success) {
          res.status(400).json({
            error: twilioRes.error || "No se pudo enviar el código SMS. Intenta de nuevo.",
          });
          return;
        }

        await adminDb
          .collection("users")
          .doc(uid)
          .collection("security")
          .doc("2fa_login_code")
          .set({
            phone,
            method: "sms",
            attempts: 0,
            maxAttempts: 5,
            expiresAt: Date.now() + 15 * 60 * 1000,
            createdAt: new Date().toISOString(),
          });

        res.status(200).json({
          status: "ok",
          enabled: true,
          method: "sms",
          maskedTarget: maskIdentifier(phone, true),
          message: `Código enviado por SMS a ${maskIdentifier(phone, true)}.`,
        });
        return;
      }

      // 2. Si el método es Email, generar código y enviar con Resend
      const code = crypto.randomInt(100000, 1000000).toString();
      const codeHash = hashSecurityCode(code, uid);
      const expiresAt = Date.now() + 15 * 60 * 1000;

      await adminDb
        .collection("users")
        .doc(uid)
        .collection("security")
        .doc("2fa_login_code")
        .set({
          codeHash,
          method: "email",
          attempts: 0,
          maxAttempts: 5,
          expiresAt,
          createdAt: new Date().toISOString(),
        });

      if (userEmail) {
        const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
        const recipientName = userData.name || "Cliente Var San";

        const { subject, html, text } = buildVerificationCodeEmail(emailLang, {
          code,
          recipientName,
          expiresInMinutes: 15,
        });

        await sendEmail({
          to: userEmail,
          subject: `[Seguridad] ${subject}`,
          html,
          text,
          from: EMAIL_SENDERS.security,
        });
      }

      res.status(200).json({
        status: "ok",
        enabled: true,
        method: "email",
        maskedTarget: maskIdentifier(userEmail),
        message: `Código enviado a tu correo ${maskIdentifier(userEmail)}.`,
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al enviar código de login 2FA");
      res.status(500).json({ error: "No se pudo enviar el código de verificación." });
    }
  },
);

const VerifyLoginCodeSchema = z.object({
  uid: z.string().min(1),
  code: z.string().trim().min(4).max(10),
});

/**
 * POST /api/auth/2fa/verify-login-code
 * Valida el código 2FA durante el flujo de inicio de sesión.
 */
router.post(
  "/auth/2fa/verify-login-code",
  authRateLimit,
  async (req: Request, res: Response) => {
    const parseResult = VerifyLoginCodeSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Código de verificación requerido." });
      return;
    }

    const { uid, code } = parseResult.data;

    try {
      const cleanCode = code.trim().toUpperCase();

      // 1. Verificar primero si es un código de respaldo de un solo uso
      const backupDocRef = adminDb.collection("users").doc(uid).collection("security").doc("2fa_backup_codes");
      const backupDoc = await backupDocRef.get();
      if (backupDoc.exists) {
        const backupData = backupDoc.data()!;
        const codes: any[] = backupData.codes || [];
        const normalizedCode = cleanCode.replace(/-/g, "").length === 8
          ? `${cleanCode.replace(/-/g, "").slice(0, 4)}-${cleanCode.replace(/-/g, "").slice(4)}`
          : cleanCode;
        const codeHash = hashSecurityCode(normalizedCode, uid);
        const matchIdx = codes.findIndex((c) => c.codeHash === codeHash);

        if (matchIdx !== -1) {
          if (codes[matchIdx].used) {
            res.status(400).json({
              error: "Este código de respaldo ya fue utilizado previamente. Introduce otro código de respaldo o un código SMS.",
            });
            return;
          }

          // Marcar código como consumido de forma definitiva
          codes[matchIdx].used = true;
          codes[matchIdx].usedAt = new Date().toISOString();
          await backupDocRef.update({ codes });

          // Limpiar código temporal de login
          await adminDb.collection("users").doc(uid).collection("security").doc("2fa_login_code").delete().catch(() => {});

          await recordSecurityActivity(uid, {
            type: "backup_code_used",
            title: "Inicio de sesión con código de respaldo",
            description: "Se utilizó un código de respaldo de un solo uso para acceder a la cuenta.",
          });

          res.status(200).json({
            status: "ok",
            verified: true,
            usedBackupCode: true,
            message: "Verificación con código de respaldo exitosa.",
          });
          return;
        }
      }

      // 2. Si no es código de respaldo, verificar código OTP temporal
      const codeDocRef = adminDb.collection("users").doc(uid).collection("security").doc("2fa_login_code");
      const codeDoc = await codeDocRef.get();

      if (!codeDoc.exists) {
        res.status(400).json({ error: "El código no existe o ya fue utilizado. Solicita uno nuevo." });
        return;
      }

      const codeData = codeDoc.data()!;
      const now = Date.now();
      const expiresAt = typeof codeData.expiresAt === "number" ? codeData.expiresAt : 0;
      const attempts = typeof codeData.attempts === "number" ? codeData.attempts : 0;

      if (now > expiresAt) {
        await codeDocRef.delete();
        res.status(400).json({ error: "El código ha expirado. Solicita un nuevo código." });
        return;
      }

      if (attempts >= 5) {
        await codeDocRef.delete();
        res.status(429).json({ error: "Has superado el límite de 5 intentos fallidos. Solicita un nuevo código." });
        return;
      }

      const method = codeData.method || "email";
      const phone = codeData.phone || "";

      // 1. Si es SMS, validar con Twilio Verify
      if (method === "sms") {
        const verifyRes = await checkTwilioVerification(phone, code);
        if (!verifyRes.approved) {
          await codeDocRef.update({ attempts: attempts + 1 });
          const remaining = Math.max(0, 5 - (attempts + 1));
          res.status(400).json({
            error: verifyRes.error || `Código SMS incorrecto o expirado. Te quedan ${remaining} intento(s).`,
          });
          return;
        }
      } else {
        // 2. Si es Email, validar con hash SHA-256
        const inputHash = hashSecurityCode(code, uid);
        if (inputHash !== codeData.codeHash) {
          await codeDocRef.update({ attempts: attempts + 1 });
          const remaining = Math.max(0, 5 - (attempts + 1));
          res.status(400).json({
            error: `Código incorrecto. Te quedan ${remaining} intento(s).`,
          });
          return;
        }
      }

      // Código correcto: eliminar documento temporal
      await codeDocRef.delete();

      await recordSecurityActivity(uid, {
        type: "login",
        title: "Inicio de sesión con 2FA completado",
        description: "Se verificó correctamente el segundo factor de autenticación.",
      });

      res.status(200).json({
        status: "ok",
        verified: true,
        message: "Verificación de dos fases exitosa.",
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al verificar código de login 2FA");
      res.status(500).json({ error: "No se pudo procesar la verificación." });
    }
  },
);

/**
 * POST /api/auth/2fa/disable (y /api/auth/two-factor/disable)
 * Desactiva la autenticación en dos fases del usuario autenticado.
 */
router.post(
  ["/auth/2fa/disable", "/auth/two-factor/disable"],
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;
    const userEmail = req.user!.email;
    const reqLang = (req.body?.language as string) || undefined;

    try {
      // Actualizar users/{uid}/security/2fa
      await adminDb.collection("users").doc(uid).collection("security").doc("2fa").set({
        enabled: false,
        disabledAt: new Date().toISOString(),
      });

      // Actualizar users/{uid}
      await adminDb.collection("users").doc(uid).set(
        {
          twoFactor: {
            enabled: false,
          },
        },
        { merge: true },
      );

      // Eliminar códigos pendientes si los hubiera
      await adminDb.collection("users").doc(uid).collection("security").doc("2fa_setup_code").delete().catch(() => {});
      await adminDb.collection("users").doc(uid).collection("security").doc("2fa_login_code").delete().catch(() => {});

      await recordSecurityActivity(uid, {
        type: "2fa_disabled",
        title: "Autenticación en dos fases desactivada",
        description: "Se desactivó la protección 2FA en tu cuenta.",
      });

      // Enviar correo de alerta por desactivación
      if (userEmail) {
        const userData = await fetchUserData(uid);
        const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
        const recipientName = userData.name || req.user!.name || "Cliente Var San";
        const { subject, html, text } = buildSecurityAlertEmail(emailLang, {
          recipientName,
          alertTitle: "2FA Desactivado",
          alertDetails: "La autenticación en dos fases (2FA) ha sido desactivada en tu cuenta de Distribuidora Var San.",
        });

        sendEmail({
          to: userEmail,
          subject: `[Seguridad] ${subject}`,
          html,
          text,
          from: EMAIL_SENDERS.security,
        }).catch((err) => logger.warn({ err }, "No se pudo enviar alerta de 2FA desactivado"));
      }

      res.status(200).json({
        status: "ok",
        message: "Autenticación en dos fases desactivada correctamente.",
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al desactivar 2FA");
      res.status(500).json({ error: "No se pudo desactivar 2FA. Intenta de nuevo." });
    }
  },
);

export default router;
