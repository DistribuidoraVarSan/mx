import type { Request, Response, NextFunction } from "express";
import { adminAuth, adminDb } from "../lib/firebase-admin";
import { logger } from "../lib/logger";

export interface AuthenticatedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionId?: string;
    }
  }
}

/**
 * Middleware para proteger endpoints privados.
 *
 * 1. Exige la cabecera 'Authorization: Bearer <token>'.
 * 2. Valida la firma del Firebase ID Token mediante Firebase Admin SDK.
 * 3. Asigna el objeto 'req.user' exclusivamente a partir de los datos criptográficos verificados del token.
 * 4. Si se envía la cabecera 'x-session-id', verifica que la sesión no haya sido revocada individualmente.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Acceso no autorizado. Se requiere un token de autenticación válido.",
      code: "UNAUTHORIZED",
    });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim();

  if (!idToken) {
    res.status(401).json({
      error: "Formato de autorización inválido.",
      code: "INVALID_TOKEN_FORMAT",
    });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken || !decodedToken.uid) {
      res.status(401).json({
        error: "Token de autenticación no válido.",
        code: "INVALID_TOKEN",
      });
      return;
    }

    const sessionIdHeader = req.headers["x-session-id"];
    const sessionId = typeof sessionIdHeader === "string" ? sessionIdHeader.trim() : undefined;

    // Si la petición presenta un sessionId, verificamos que no esté marcado como revocado
    if (sessionId) {
      try {
        const sessionDoc = await adminDb
          .collection("users")
          .doc(decodedToken.uid)
          .collection("sessions")
          .doc(sessionId)
          .get();

        if (sessionDoc.exists) {
          const sessionData = sessionDoc.data();
          if (sessionData && sessionData.revoked === true) {
            res.status(401).json({
              error: "Esta sesión ha sido revocada. Por favor, inicia sesión nuevamente.",
              code: "SESSION_REVOKED",
            });
            return;
          }
        }
      } catch (dbErr) {
        logger.warn({ err: dbErr, uid: decodedToken.uid }, "No se pudo verificar el estado de la sesión en Firestore");
      }
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      emailVerified: decodedToken.email_verified || false,
      name: decodedToken.name || "",
    };
    req.sessionId = sessionId;

    next();
  } catch (error: any) {
    const errorCode = error?.code || "auth/unknown";

    if (errorCode === "auth/id-token-expired") {
      res.status(401).json({
        error: "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.",
        code: "TOKEN_EXPIRED",
      });
      return;
    }

    if (errorCode === "auth/id-token-revoked") {
      res.status(401).json({
        error: "El token de acceso fue revocado.",
        code: "TOKEN_REVOKED",
      });
      return;
    }

    logger.warn({ errorCode }, "Fallo en la verificación del Firebase ID Token");

    res.status(401).json({
      error: "Credenciales de autenticación no válidas.",
      code: "UNAUTHORIZED",
    });
  }
}
