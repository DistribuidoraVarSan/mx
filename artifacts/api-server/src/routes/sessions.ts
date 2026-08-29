import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import type { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { adminDb } from "../lib/firebase-admin";
import { requireAuth } from "../middlewares/auth";
import { authRateLimit, strictActionRateLimit } from "../middlewares/rate-limit";
import { extractDeviceInfo } from "../lib/device-detector";
import { logger } from "../lib/logger";
import { sendEmail, EMAIL_SENDERS } from "../lib/mailer";
import {
  buildNewDeviceLoginEmail,
  buildSecurityAlertEmail,
  resolveEmailLanguage,
} from "../lib/email-templates";
import {
  recordSecurityActivity,
  getSecurityActivities,
} from "../lib/security-activity";

const router: IRouter = Router();

const RegisterSessionSchema = z.object({
  clientSessionId: z.string().min(16).max(100).optional(),
  language: z.string().optional(),
});

const RevokeSessionSchema = z.object({
  sessionId: z.string().min(10).max(100, "Identificador de sesión inválido."),
});

const RevokeOthersSchema = z.object({
  currentSessionId: z.string().min(10).max(100, "Identificador de sesión actual inválido."),
});

const ItWasntMeSchema = z.object({
  sessionId: z.string().min(10).max(100).optional(),
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
    logger.warn({ err, uid }, "No se pudo consultar datos de usuario en Firestore");
  }
  return {};
}

/**
 * POST /api/auth/session/register
 * Registra o actualiza la sesión activa del usuario con su huella de dispositivo e IP.
 * Detecta nuevos dispositivos y notifica por correo transaccional de seguridad.
 */
router.post(
  "/auth/session/register",
  authRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = RegisterSessionSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: "Datos de sesión inválidos.",
        details: parseResult.error.flatten(),
      });
      return;
    }

    const uid = req.user!.uid;
    const email = req.user!.email;
    const clientSessionId = parseResult.data.clientSessionId;
    const reqLanguage = parseResult.data.language;
    const sessionId = clientSessionId || crypto.randomUUID();
    const deviceInfo = extractDeviceInfo(req);
    const now = new Date().toISOString();

    try {
      const userDocRef = adminDb.collection("users").doc(uid);
      if (reqLanguage) {
        await userDocRef.set({ preferredLanguage: reqLanguage }, { merge: true });
      }

      const sessionsColRef = userDocRef.collection("sessions");
      const sessionDocRef = sessionsColRef.doc(sessionId);

      // Verificamos sesiones previas para detectar si es un nuevo dispositivo
      const existingSessionsSnap = await sessionsColRef.get();
      const existingDocs = existingSessionsSnap.docs;
      const isFirstSessionEver = existingDocs.length === 0;

      // Buscar si ya existía una sesión con el mismo SO y navegador
      const hasSeenDevice = existingDocs.some((d) => {
        const data = d.data();
        return data.os === deviceInfo.os && data.browser === deviceInfo.browser;
      });

      const existingDoc = await sessionDocRef.get();
      const existingData = existingDoc.exists ? existingDoc.data() : null;

      const sessionRecord = {
        sessionId,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        deviceType: deviceInfo.deviceType,
        ip: deviceInfo.ip,
        country: deviceInfo.country,
        region: deviceInfo.region || null,
        userAgent: deviceInfo.userAgent,
        createdAt: existingData?.createdAt || now,
        lastActiveAt: now,
        revoked: false,
        revokedAt: null,
      };

      await sessionDocRef.set(sessionRecord, { merge: true });

      // Si es un dispositivo nuevo y el usuario ya tenía sesiones previas, despachamos alerta
      const isNewDevice = !isFirstSessionEver && !hasSeenDevice && !existingDoc.exists;

      if (isNewDevice) {
        await recordSecurityActivity(uid, {
          type: "new_device",
          title: "Nuevo dispositivo registrado",
          description: `Inicio de sesión desde ${deviceInfo.os} (${deviceInfo.browser}) en ${deviceInfo.country}.`,
          ip: deviceInfo.ip,
          os: deviceInfo.os,
          browser: deviceInfo.browser,
          deviceType: deviceInfo.deviceType,
          country: deviceInfo.country,
          region: deviceInfo.region,
        });

        if (email) {
          const userData = await fetchUserData(uid);
          const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLanguage);
          const recipientName = userData.name || req.user!.name || "Cliente Var San";
          const { subject, html, text } = buildNewDeviceLoginEmail(emailLang, {
            recipientName,
            deviceType: deviceInfo.deviceType === "mobile" ? "Dispositivo Móvil" : "Computadora de Escritorio",
            os: deviceInfo.os,
            browser: deviceInfo.browser,
            ip: deviceInfo.ip,
            country: deviceInfo.country,
            region: deviceInfo.region,
            loginTime: new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" }),
          });

          sendEmail({
            to: email,
            subject,
            html,
            text,
            from: EMAIL_SENDERS.security,
          }).catch((emailErr) => {
            logger.warn({ err: emailErr, uid }, "No se pudo enviar alerta de nuevo dispositivo");
          });
        }
      } else if (!existingDoc.exists) {
        // Registro normal de login
        await recordSecurityActivity(uid, {
          type: "login",
          title: "Inicio de sesión",
          description: `Acceso desde ${deviceInfo.os} (${deviceInfo.browser}).`,
          ip: deviceInfo.ip,
          os: deviceInfo.os,
          browser: deviceInfo.browser,
          deviceType: deviceInfo.deviceType,
          country: deviceInfo.country,
          region: deviceInfo.region,
        });
      }

      res.status(200).json({
        status: "ok",
        sessionId,
        isNewDevice,
        session: {
          sessionId: sessionRecord.sessionId,
          os: sessionRecord.os,
          browser: sessionRecord.browser,
          deviceType: sessionRecord.deviceType,
          ip: sessionRecord.ip,
          country: sessionRecord.country,
          region: sessionRecord.region,
          createdAt: sessionRecord.createdAt,
          lastActiveAt: sessionRecord.lastActiveAt,
          isCurrent: true,
        },
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al registrar la sesión en Firestore");
      res.status(500).json({
        error: "No se pudo registrar la sesión del dispositivo.",
        code: "SESSION_REGISTER_ERROR",
      });
    }
  },
);

/**
 * GET /api/auth/sessions
 * Devuelve la lista de sesiones activas del usuario con política de retención (< 90 días).
 */
router.get(
  "/auth/sessions",
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;
    const currentSessionId = req.sessionId || (req.headers["x-session-id"] as string | undefined);
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    try {
      const snapshot = await adminDb
        .collection("users")
        .doc(uid)
        .collection("sessions")
        .get();

      const batch = adminDb.batch();
      let hasDeletions = false;

      const sessions = snapshot.docs
        .map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          const lastActiveMs = new Date(data.lastActiveAt || data.createdAt || 0).getTime();

          // Purgar en background sesiones revocadas con más de 90 días
          if (data.revoked === true && lastActiveMs < ninetyDaysAgo) {
            batch.delete(doc.ref);
            hasDeletions = true;
            return null;
          }

          return {
            sessionId: doc.id,
            os: (data.os as string) || "Desconocido",
            browser: (data.browser as string) || "Desconocido",
            deviceType: (data.deviceType as "desktop" | "mobile" | "tablet" | "unknown") || "desktop",
            ip: (data.ip as string) || "127.0.0.1",
            country: (data.country as string) || "México",
            region: (data.region as string | null) || null,
            createdAt: (data.createdAt as string) || new Date().toISOString(),
            lastActiveAt: (data.lastActiveAt as string) || new Date().toISOString(),
            revoked: data.revoked === true,
            isCurrent: doc.id === currentSessionId,
          };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null)
        .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());

      if (hasDeletions) {
        batch.commit().catch(() => {});
      }

      res.status(200).json({
        sessions,
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al consultar sesiones en Firestore");
      res.status(500).json({
        error: "No se pudieron obtener las sesiones activas.",
        code: "FETCH_SESSIONS_ERROR",
      });
    }
  },
);

/**
 * GET /api/auth/security-activity
 * Devuelve el historial cronológico de actividad de seguridad del usuario.
 */
router.get(
  "/auth/security-activity",
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;

    try {
      const activities = await getSecurityActivities(uid, 30);
      res.status(200).json({ activities });
    } catch (err) {
      logger.error({ err, uid }, "Error al consultar actividad de seguridad");
      res.status(500).json({ error: "No se pudo cargar el historial de seguridad." });
    }
  },
);

/**
 * POST /api/auth/sessions/revoke
 * Invalida una sesión específica del usuario.
 */
router.post(
  "/auth/sessions/revoke",
  authRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = RevokeSessionSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: "Identificador de sesión no válido.",
        details: parseResult.error.flatten(),
      });
      return;
    }

    const uid = req.user!.uid;
    const { sessionId } = parseResult.data;

    try {
      const sessionDocRef = adminDb
        .collection("users")
        .doc(uid)
        .collection("sessions")
        .doc(sessionId);

      const sessionDoc = await sessionDocRef.get();

      if (!sessionDoc.exists) {
        res.status(404).json({
          error: "La sesión indicada no existe.",
          code: "SESSION_NOT_FOUND",
        });
        return;
      }

      const sessionData = sessionDoc.data();

      await sessionDocRef.update({
        revoked: true,
        revokedAt: new Date().toISOString(),
      });

      await recordSecurityActivity(uid, {
        type: "session_revoked",
        title: "Sesión cerrada individualmente",
        description: `Se cerró la sesión del dispositivo ${sessionData?.os || "Desconocido"} (${sessionData?.browser || "Navegador"}).`,
        ip: sessionData?.ip,
        os: sessionData?.os,
        browser: sessionData?.browser,
        country: sessionData?.country,
      });

      res.status(200).json({
        status: "ok",
        message: "Sesión revocada exitosamente.",
      });
    } catch (err) {
      logger.error({ err, uid, sessionId }, "Error al revocar sesión en Firestore");
      res.status(500).json({
        error: "No se pudo revocar la sesión.",
        code: "REVOKE_SESSION_ERROR",
      });
    }
  },
);

/**
 * POST /api/auth/sessions/revoke-others
 * Invalida todas las demás sesiones excepto la sesión actual.
 */
router.post(
  "/auth/sessions/revoke-others",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = RevokeOthersSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: "Identificador de la sesión actual no proporcionado.",
        details: parseResult.error.flatten(),
      });
      return;
    }

    const uid = req.user!.uid;
    const { currentSessionId } = parseResult.data;
    const now = new Date().toISOString();

    try {
      const snapshot = await adminDb
        .collection("users")
        .doc(uid)
        .collection("sessions")
        .get();

      const batch = adminDb.batch();
      let revokedCount = 0;

      snapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        if (doc.id !== currentSessionId) {
          const data = doc.data();
          if (!data.revoked) {
            batch.update(doc.ref, {
              revoked: true,
              revokedAt: now,
            });
            revokedCount++;
          }
        }
      });

      if (revokedCount > 0) {
        await batch.commit();

        await recordSecurityActivity(uid, {
          type: "sessions_revoked_others",
          title: "Otras sesiones cerradas",
          description: `Se cerraron ${revokedCount} sesión(es) en otros dispositivos.`,
        });
      }

      res.status(200).json({
        status: "ok",
        message: `Se revocaron ${revokedCount} sesión(es) adicional(es). La sesión actual permanece activa.`,
        revokedCount,
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al revocar otras sesiones en Firestore");
      res.status(500).json({
        error: "No se pudieron revocar las otras sesiones.",
        code: "REVOKE_OTHERS_ERROR",
      });
    }
  },
);

/**
 * POST /api/auth/sessions/revoke-all
 * Invalida atómicamente TODAS las sesiones del usuario (revocación global de seguridad).
 */
router.post(
  "/auth/sessions/revoke-all",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;
    const now = new Date().toISOString();

    try {
      const snapshot = await adminDb
        .collection("users")
        .doc(uid)
        .collection("sessions")
        .get();

      const batch = adminDb.batch();
      let count = 0;

      snapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        if (!data.revoked) {
          batch.update(doc.ref, {
            revoked: true,
            revokedAt: now,
          });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
      }

      await recordSecurityActivity(uid, {
        type: "sessions_revoked_all",
        title: "Cierre total de sesiones",
        description: `Se revocaron todas las ${count} sesión(es) activas por acción de seguridad.`,
      });

      res.status(200).json({
        status: "ok",
        message: `Se cerraron exitosamente todas las sesiones (${count}).`,
        revokedCount: count,
      });
    } catch (err) {
      logger.error({ err, uid }, "Error al revocar todas las sesiones");
      res.status(500).json({ error: "No se pudieron revocar todas las sesiones." });
    }
  },
);

/**
 * POST /api/auth/security/it-wasnt-me
 * Acción de respuesta rápida: revoca la sesión sospechosa o todas las sesiones remotas,
 * registra el evento de seguridad y despacha correo de alerta con recomendación de cambio de contraseña.
 */
router.post(
  "/auth/security/it-wasnt-me",
  strictActionRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    const parseResult = ItWasntMeSchema.safeParse(req.body);
    const { sessionId, language: reqLang } = parseResult.success ? parseResult.data : {};

    const uid = req.user!.uid;
    const email = req.user!.email;
    const currentSessionId = req.sessionId || (req.headers["x-session-id"] as string | undefined);
    const now = new Date().toISOString();

    try {
      const sessionsColRef = adminDb.collection("users").doc(uid).collection("sessions");
      const batch = adminDb.batch();
      let blockedInfo = "Sesión remota desconocida";
      let revokedCount = 0;

      if (sessionId && (!currentSessionId || sessionId !== currentSessionId)) {
        // Se especificó una sesión remota concreta para revocar
        const docRef = sessionsColRef.doc(sessionId);
        const doc = await docRef.get();
        if (doc.exists) {
          const data = doc.data();
          blockedInfo = `${data?.os || "Dispositivo"} (${data?.browser || "Navegador"}) - IP: ${data?.ip || "N/A"}`;
          batch.update(docRef, { revoked: true, revokedAt: now });
          revokedCount = 1;
        }
      } else {
        // Si no se especifica sessionId, o coincide con la sesión actual,
        // revocamos ÚNICAMENTE todas las DEMÁS sesiones remotas,
        // garantizando que la sesión actual del usuario permanezca activa e intacta.
        const snap = await sessionsColRef.get();
        snap.docs.forEach((doc) => {
          if (doc.id !== currentSessionId) {
            const data = doc.data();
            if (!data.revoked) {
              batch.update(doc.ref, { revoked: true, revokedAt: now });
              revokedCount++;
            }
          }
        });
        blockedInfo = `Todas las demás sesiones remotas activas (${revokedCount})`;
      }

      if (revokedCount > 0) {
        await batch.commit();
      }

      await recordSecurityActivity(uid, {
        type: "suspicious_activity_reported",
        title: "Reporte 'No fui yo' ejecutado",
        description: `Se protegieron los accesos y se revocaron sesiones remotas: ${blockedInfo}.`,
      });

      if (email) {
        const userData = await fetchUserData(uid);
        const emailLang = resolveEmailLanguage(userData.preferredLanguage, reqLang);
        const recipientName = userData.name || req.user!.name || "Cliente Var San";
        const { subject, html, text } = buildSecurityAlertEmail(emailLang, {
          recipientName,
          alertTitle: "Acceso remoto sospechoso bloqueado ('No fui yo')",
          alertDetails: `Has reportado un acceso no reconocido (${blockedInfo}). Las sesiones remotas sospechosas han sido revocadas de inmediato. Tu sesión actual permanece activa y protegida. Te recomendamos cambiar tu contraseña y asegurar que tu 2FA esté configurado.`,
        });

        sendEmail({
          to: email,
          subject,
          html,
          text,
          from: EMAIL_SENDERS.security,
        }).catch(() => {});
      }

      res.status(200).json({
        status: "ok",
        message: "El acceso remoto no reconocido ha sido revocado y tu sesión actual permanece protegida.",
        revokedCount,
      });
    } catch (err) {
      logger.error({ err, uid }, "Error en acción 'No fui yo'");
      res.status(500).json({ error: "No se pudo procesar el reporte de seguridad." });
    }
  },
);


export default router;
