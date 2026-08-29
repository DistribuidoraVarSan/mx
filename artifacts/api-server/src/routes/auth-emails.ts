import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import { sendEmail, EMAIL_SENDERS } from "../lib/mailer";
import {
  buildVerificationCodeEmail,
  buildPasswordResetEmail,
  buildPasswordChangedEmail,
  buildNewDeviceLoginEmail,
  buildSecurityAlertEmail,
  buildClientWelcomeEmail,
  buildDataExportCodeEmail,
  buildAccountDeactivatedEmail,
  resolveEmailLanguage,
} from "../lib/email-templates";
import { requireAuth } from "../middlewares/auth";
import { authRateLimit, strictActionRateLimit } from "../middlewares/rate-limit";
import { adminDb, adminAuth } from "../lib/firebase-admin";
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

const RESERVED_USERNAMES = new Set([
  "admin", "administrator", "root", "support", "soporte",
  "varsan", "distribuidora", "distribuidoravarsan", "emilia",
  "system", "null", "undefined", "moderator", "help", "ayuda",
  "contacto", "contact", "ventas", "sales", "info", "billing",
  "facturacion", "api", "auth", "security", "seguridad", "test",
  "demo", "bot", "owner", "ceo", "director", "distribuidor",
]);

const PROFANE_PATTERNS = [
  /put[oa]/i, /mierda/i, /pendej[oa]/i, /chinga/i, /cabron/i,
  /verga/i, /cul[oa]/i, /fuck/i, /shit/i, /bitch/i, /asshole/i,
  /nazi/i, /hitler/i, /idiot/i, /estupid[oa]/i, /maric[oa]n/i,
];

export function isOffensiveOrReservedUsername(username: string): boolean {
  const normalized = username.toLowerCase().trim();
  if (RESERVED_USERNAMES.has(normalized)) return true;
  for (const pattern of PROFANE_PATTERNS) {
    if (pattern.test(normalized)) return true;
  }
  return false;
}

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
    logger.warn({ err, uidOrEmail }, "No se pudo recuperar información de usuario de Firestore");
  }
  return {};
}

/**
 * POST /api/auth/username/check
 * Verifica si un nombre de usuario es válido, no reservado, no ofensivo y está disponible.
 */
router.post("/auth/username/check", authRateLimit, async (req: Request, res: Response) => {
  const username = String(req.body?.username || "").trim().toLowerCase();

  if (!username || username.length < 6 || username.length > 30) {
    res.status(200).json({
      available: false,
      error: "Este usuario no está disponible.",
    });
    return;
  }

  // Solo alfanuméricos, guiones bajos y puntos (sin puntos consecutivos, sin empezar o terminar con punto/guion)
  if (!/^[a-z0-9][a-z0-9_.]*[a-z0-9]$/.test(username) || username.includes("..")) {
    res.status(200).json({
      available: false,
      error: "Este usuario no está disponible.",
    });
    return;
  }

  // Filtro de palabras ofensivas y reservadas
  if (isOffensiveOrReservedUsername(username)) {
    res.status(200).json({
      available: false,
      error: "Este usuario no está disponible.",
    });
    return;
  }

  try {
    // 1. Revisar colección de reservas 'usernames'
    const usernameDoc = await adminDb.collection("usernames").doc(username).get();
    if (usernameDoc.exists) {
      res.status(200).json({
        available: false,
        error: "Este usuario no está disponible.",
      });
      return;
    }

    // 2. Revisar si algún usuario existente lo tiene asignado
    const usersWithUsername = await adminDb.collection("users").where("username", "==", username).limit(1).get();
    if (!usersWithUsername.empty) {
      res.status(200).json({
        available: false,
        error: "Este usuario no está disponible.",
      });
      return;
    }

    res.status(200).json({ available: true });
  } catch (err) {
    logger.error({ err, username }, "Error al comprobar disponibilidad de username");
    res.status(500).json({ error: "Error al comprobar disponibilidad de usuario." });
  }
});

/**
 * POST /api/auth/welcome-email
 * Envía correo de bienvenida institucional a un nuevo cliente.
 */
router.post("/auth/welcome-email", authRateLimit, async (req: Request, res: Response) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const name = String(req.body?.name || "").trim();
  const company = String(req.body?.company || "").trim();
  const language = req.body?.language;

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Correo electrónico inválido." });
    return;
  }

  try {
    const emailLang = resolveEmailLanguage(undefined, language);
    const { subject, html, text } = buildClientWelcomeEmail(emailLang, {
      recipientName: name || undefined,
      email,
      company: company || undefined,
    });

    await sendEmail({
      to: email,
      subject,
      html,
      text,
      from: EMAIL_SENDERS.default,
    });

    res.status(200).json({ status: "ok", message: "Correo de bienvenida enviado." });
  } catch (err) {
    logger.error({ err, email }, "Error al enviar correo de bienvenida");
    res.status(500).json({ error: "No se pudo enviar el correo de bienvenida." });
  }
});

/**
 * POST /api/auth/data-export/request-code
 * Envía un código de 6 dígitos al correo para verificar la identidad antes de descargar datos.
 */
router.post(
  "/auth/data-export/request-code",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;
    const email = req.user!.email;

    if (!email) {
      res.status(400).json({ error: "No hay correo electrónico asociado." });
      return;
    }

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = crypto.createHash("sha256").update(code).digest("hex");
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

      await adminDb.collection("users").doc(uid).collection("security").doc("data_export_code").set({
        codeHash,
        expiresAt,
        attempts: 0,
        createdAt: Date.now(),
      });

      await recordSecurityActivity(uid, {
        type: "data_export_code_requested",
        title: "Solicitud de código para descarga de datos",
        description: "Se generó un código de verificación para descarga de datos de cuenta.",
      });

      const userData = await fetchUserData({ uid, email });
      const emailLang = resolveEmailLanguage(userData.preferredLanguage, req.body?.language);
      const resolvedName = userData.name || req.user!.name || "Cliente Var San";

      const { subject, html, text } = buildDataExportCodeEmail(emailLang, {
        code,
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

      res.status(200).json({ status: "ok", message: "Código de verificación enviado." });
    } catch (err) {
      logger.error({ err, uid }, "Error al solicitar código de descarga de datos");
      res.status(500).json({ error: "No se pudo enviar el código de verificación." });
    }
  },
);

/**
 * POST /api/auth/data-export/verify-code
 * Valida el código de 6 dígitos ingresado por el usuario.
 */
router.post(
  "/auth/data-export/verify-code",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;
    const code = String(req.body?.code || "").trim();

    if (!code || code.length !== 6) {
      res.status(400).json({ error: "El código debe tener 6 dígitos." });
      return;
    }

    try {
      const docRef = adminDb.collection("users").doc(uid).collection("security").doc("data_export_code");
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        res.status(400).json({ error: "No hay un código de verificación pendiente o ha expirado." });
        return;
      }

      const data = docSnap.data();
      if (Date.now() > (data?.expiresAt || 0)) {
        await docRef.delete();
        res.status(400).json({ error: "El código de verificación ha expirado. Solicita uno nuevo." });
        return;
      }

      if ((data?.attempts || 0) >= 5) {
        await docRef.delete();
        res.status(429).json({ error: "Demasiados intentos fallidos. Solicita un nuevo código." });
        return;
      }

      const inputHash = crypto.createHash("sha256").update(code).digest("hex");
      if (inputHash !== data?.codeHash) {
        await docRef.update({ attempts: (data?.attempts || 0) + 1 });
        res.status(400).json({ error: "Código de verificación incorrecto." });
        return;
      }

      // Código válido: Registrar autorización de descarga
      await docRef.delete();
      await adminDb.collection("users").doc(uid).collection("security").doc("data_export_auth").set({
        authorizedAt: Date.now(),
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hora de sesión autorizada
      });

      await recordSecurityActivity(uid, {
        type: "data_export_verified",
        title: "Identidad verificada para descarga de datos",
        description: "El usuario verificó su código de seguridad exitosamente.",
      });

      res.status(200).json({ status: "ok", message: "Identidad verificada exitosamente." });
    } catch (err) {
      logger.error({ err, uid }, "Error al verificar código de descarga de datos");
      res.status(500).json({ error: "Error al validar el código de verificación." });
    }
  },
);

/**
 * POST /api/auth/data-export/send-email
 * Envía por correo un resumen y confirmación de la exportación de datos.
 */
router.post(
  "/auth/data-export/send-email",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;
    const email = req.user!.email;

    if (!email) {
      res.status(400).json({ error: "No hay correo electrónico asociado." });
      return;
    }

    try {
      const userData = await fetchUserData({ uid, email });
      const emailLang = resolveEmailLanguage(userData.preferredLanguage, req.body?.language);
      const resolvedName = userData.name || req.user!.name || "Cliente Var San";

      await sendEmail({
        to: email,
        subject: "Copia de seguridad y datos de tu cuenta — Distribuidora Var San",
        html: `<p>Hola, <strong>${resolvedName}</strong>:</p><p>Hemos preparado el archivo con los datos de tu cuenta en Distribuidora Var San. Puedes descargarlo directamente desde tu Portal de Cliente.</p><p style="color:#64748b;font-size:12px;">Distribuidora Var San — Calidad y confianza en cada suministro.</p>`,
        text: `Hola, ${resolvedName}:\n\nHemos preparado el archivo con los datos de tu cuenta en Distribuidora Var San. Puedes descargarlo desde tu Portal de Cliente.\n\nDistribuidora Var San`,
        from: EMAIL_SENDERS.default,
      });

      res.status(200).json({ status: "ok", message: "Correo de datos enviado." });
    } catch (err) {
      logger.error({ err, uid }, "Error al enviar datos por correo");
      res.status(500).json({ error: "No se pudo enviar el correo con los datos." });
    }
  },
);

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

/**
 * POST /api/auth/resolve-identifier
 * Resuelve un identificador (correo o username) a la dirección de correo correspondiente.
 */
router.post("/auth/resolve-identifier", authRateLimit, async (req: Request, res: Response) => {
  const identifier = String(req.body?.identifier || "").trim();
  if (!identifier) {
    res.status(400).json({ error: "Identificador no proporcionado." });
    return;
  }

  // Si ya es un correo electrónico válido
  if (identifier.includes("@") && identifier.includes(".")) {
    res.status(200).json({ email: identifier.toLowerCase().trim() });
    return;
  }

  // Si es un username (con o sin @)
  const cleanUsername = identifier.replace(/^@/, "").toLowerCase().trim();
  try {
    // 1. Buscar en usernames/{cleanUsername}
    const usernameDoc = await adminDb.collection("usernames").doc(cleanUsername).get();
    if (usernameDoc.exists) {
      const uid = usernameDoc.data()?.uid;
      if (uid) {
        const userDoc = await adminDb.collection("users").doc(uid).get();
        if (userDoc.exists && userDoc.data()?.email) {
          res.status(200).json({ email: userDoc.data()!.email.toLowerCase().trim() });
          return;
        }
        const authUser = await adminAuth.getUser(uid).catch(() => null);
        if (authUser?.email) {
          res.status(200).json({ email: authUser.email.toLowerCase().trim() });
          return;
        }
      }
    }

    // 2. Buscar en users where username == cleanUsername
    const usersSnap = await adminDb.collection("users").where("username", "==", cleanUsername).limit(1).get();
    if (!usersSnap.empty) {
      const email = usersSnap.docs[0].data()?.email;
      if (email) {
        res.status(200).json({ email: email.toLowerCase().trim() });
        return;
      }
    }

    res.status(404).json({ error: "No se encontró ninguna cuenta asociada a este usuario." });
  } catch (err) {
    logger.error({ err, identifier }, "Error al resolver identificador");
    res.status(500).json({ error: "Error al verificar el usuario." });
  }
});

/**
 * POST /api/auth/password-reset/request-code
 * Envía un código de 6 dígitos al correo para restablecer la contraseña.
 */
router.post("/auth/password-reset/request-code", strictActionRateLimit, async (req: Request, res: Response) => {
  const identifier = String(req.body?.identifier || "").trim();
  if (!identifier) {
    res.status(400).json({ error: "Ingresa tu correo electrónico o nombre de usuario." });
    return;
  }

  try {
    let email = identifier.toLowerCase().trim();
    let uid: string | undefined;

    if (!email.includes("@")) {
      const cleanUser = email.replace(/^@/, "");
      const usernameDoc = await adminDb.collection("usernames").doc(cleanUser).get();
      if (usernameDoc.exists && usernameDoc.data()?.uid) {
        uid = usernameDoc.data()!.uid;
        if (uid) {
          const u = await adminAuth.getUser(uid).catch(() => null);
          if (u?.email) email = u.email;
        }
      } else {
        const uSnap = await adminDb.collection("users").where("username", "==", cleanUser).limit(1).get();
        if (!uSnap.empty && uSnap.docs[0].data()?.email) {
          email = uSnap.docs[0].data().email;
          uid = uSnap.docs[0].id;
        }
      }
    }

    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
      uid = userRecord.uid;
    } catch {
      res.status(200).json({ status: "ok", message: "Si la cuenta existe, se ha enviado un código de 6 dígitos." });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

    await adminDb.collection("password_resets").doc(email).set({
      codeHash,
      uid,
      expiresAt,
      attempts: 0,
      createdAt: Date.now(),
    });

    const userData = await fetchUserData({ uid, email });
    const emailLang = resolveEmailLanguage(userData.preferredLanguage, req.body?.language);
    const resolvedName = userData.name || userRecord.displayName || "Cliente Var San";

    const { subject, html, text } = buildVerificationCodeEmail(emailLang, {
      code,
      recipientName: resolvedName,
      expiresInMinutes: 15,
    });

    await sendEmail({
      to: email,
      subject: `Código de recuperación de contraseña: ${code} — Distribuidora Var San`,
      html,
      text,
      from: EMAIL_SENDERS.security,
    });

    res.status(200).json({ status: "ok", message: "Código de recuperación enviado.", email });
  } catch (err) {
    logger.error({ err, identifier }, "Error en solicitud de código de recuperación");
    res.status(500).json({ error: "No se pudo procesar la solicitud de recuperación." });
  }
});

/**
 * POST /api/auth/password-reset/verify-and-update
 * Valida el código de 6 dígitos y actualiza la contraseña de forma atómica.
 */
router.post("/auth/password-reset/verify-and-update", strictActionRateLimit, async (req: Request, res: Response) => {
  const email = String(req.body?.email || "").toLowerCase().trim();
  const code = String(req.body?.code || "").trim();
  const newPassword = String(req.body?.newPassword || "").trim();

  if (!email || !code || code.length !== 6 || !newPassword) {
    res.status(400).json({ error: "Datos incompletos para actualizar la contraseña." });
    return;
  }

  const passwordOk =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[^A-Za-z0-9]/.test(newPassword);

  if (!passwordOk) {
    res.status(400).json({ error: "La contraseña no cumple con los 5 requisitos de seguridad." });
    return;
  }

  try {
    const docRef = adminDb.collection("password_resets").doc(email);
    const snap = await docRef.get();

    if (!snap.exists) {
      res.status(400).json({ error: "El código no es válido o ha expirado. Solicita uno nuevo." });
      return;
    }

    const data = snap.data();
    if (Date.now() > (data?.expiresAt || 0)) {
      await docRef.delete();
      res.status(400).json({ error: "El código ha expirado. Solicita uno nuevo." });
      return;
    }

    if ((data?.attempts || 0) >= 5) {
      await docRef.delete();
      res.status(429).json({ error: "Demasiados intentos fallidos. Solicita un nuevo código." });
      return;
    }

    const inputHash = crypto.createHash("sha256").update(code).digest("hex");
    if (inputHash !== data?.codeHash) {
      await docRef.update({ attempts: (data?.attempts || 0) + 1 });
      res.status(400).json({ error: "Código de 6 dígitos incorrecto." });
      return;
    }

    const uid = data?.uid;
    if (!uid) {
      res.status(400).json({ error: "No se pudo identificar la cuenta del usuario." });
      return;
    }

    await adminAuth.updateUser(uid, { password: newPassword });
    await docRef.delete();

    await recordSecurityActivity(uid, {
      type: "password_reset",
      title: "Contraseña restablecida con código",
      description: "Se actualizó la contraseña mediante código de seguridad de 6 dígitos.",
    });

    const userData = await fetchUserData({ uid, email });
    const emailLang = resolveEmailLanguage(userData.preferredLanguage, req.body?.language);
    const resolvedName = userData.name || "Cliente Var San";

    const { subject, html, text } = buildSecurityAlertEmail(emailLang, {
      alertTitle: "Tu contraseña ha sido actualizada",
      alertDetails: "La contraseña de tu cuenta de Distribuidora Var San ha sido cambiada recientemente mediante código de recuperación.",
      recipientName: resolvedName,
    });

    await sendEmail({
      to: email,
      subject,
      html,
      text,
      from: EMAIL_SENDERS.security,
    }).catch(() => {});

    res.status(200).json({ status: "ok", message: "Contraseña actualizada exitosamente." });
  } catch (err) {
    logger.error({ err, email }, "Error al restablecer contraseña con código");
    res.status(500).json({ error: "Error al actualizar la contraseña." });
  }
});

export default router;
