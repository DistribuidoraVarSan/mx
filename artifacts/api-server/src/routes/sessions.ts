import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import type { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { adminDb } from "../lib/firebase-admin";
import { requireAuth } from "../middlewares/auth";
import { authRateLimit, strictActionRateLimit } from "../middlewares/rate-limit";
import { extractDeviceInfo } from "../lib/device-detector";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const RegisterSessionSchema = z.object({
  clientSessionId: z.string().min(16).max(100).optional(),
});

const RevokeSessionSchema = z.object({
  sessionId: z.string().min(10).max(100, "Identificador de sesión inválido."),
});

const RevokeOthersSchema = z.object({
  currentSessionId: z.string().min(10).max(100, "Identificador de sesión actual inválido."),
});

/**
 * POST /api/auth/session/register
 * Registra o actualiza la sesión activa del usuario con su huella de dispositivo e IP.
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
    const clientSessionId = parseResult.data.clientSessionId;
    const sessionId = clientSessionId || crypto.randomUUID();
    const deviceInfo = extractDeviceInfo(req);
    const now = new Date().toISOString();

    try {
      const sessionDocRef = adminDb
        .collection("users")
        .doc(uid)
        .collection("sessions")
        .doc(sessionId);

      const existingDoc = await sessionDocRef.get();
      const existingData = existingDoc.exists ? existingDoc.data() : null;

      // Si la sesión existía y estaba revocada, pero el usuario se vuelve a autenticar con un token válido,
      // se reactiva la sesión
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

      res.status(200).json({
        status: "ok",
        sessionId,
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
 * Devuelve la lista de sesiones asociadas al usuario autenticado.
 */
router.get(
  "/auth/sessions",
  requireAuth,
  async (req: Request, res: Response) => {
    const uid = req.user!.uid;
    const currentSessionId = req.sessionId || (req.headers["x-session-id"] as string | undefined);

    try {
      const snapshot = await adminDb
        .collection("users")
        .doc(uid)
        .collection("sessions")
        .get();

      const sessions = snapshot.docs
        .map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
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
        .sort((a: { lastActiveAt: string }, b: { lastActiveAt: string }) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());

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

      await sessionDocRef.update({
        revoked: true,
        revokedAt: new Date().toISOString(),
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

export default router;
