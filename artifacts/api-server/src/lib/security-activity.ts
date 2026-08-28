import crypto from "node:crypto";
import type { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";
import { logger } from "./logger";

export type SecurityActivityType =
  | "login"
  | "new_device"
  | "2fa_enabled"
  | "2fa_disabled"
  | "backup_code_used"
  | "rescue_code_used"
  | "session_revoked"
  | "sessions_revoked_others"
  | "sessions_revoked_all"
  | "suspicious_activity_reported"
  | "password_reset";

export interface SecurityActivityInput {
  type: SecurityActivityType;
  title: string;
  description: string;
  ip?: string;
  os?: string;
  browser?: string;
  deviceType?: "desktop" | "mobile" | "tablet" | "unknown";
  country?: string;
  region?: string | null;
  timestamp?: string;
}

export interface SecurityActivityRecord extends SecurityActivityInput {
  id: string;
  timestamp: string;
}

/**
 * Registra un evento de seguridad estructurado en la subcolección `users/{uid}/security_activity`.
 * La operación es atómica y no bloquea el flujo principal en caso de error de red.
 */
export async function recordSecurityActivity(
  uid: string,
  event: SecurityActivityInput,
): Promise<string | null> {
  if (!uid) return null;

  try {
    const eventId = crypto.randomUUID();
    const timestamp = event.timestamp || new Date().toISOString();

    const record: SecurityActivityRecord = {
      id: eventId,
      type: event.type,
      title: event.title,
      description: event.description,
      ip: event.ip || "127.0.0.1",
      os: event.os || "Desconocido",
      browser: event.browser || "Desconocido",
      deviceType: event.deviceType || "desktop",
      country: event.country || "México",
      region: event.region || null,
      timestamp,
    };

    const docRef = adminDb
      .collection("users")
      .doc(uid)
      .collection("security_activity")
      .doc(eventId);

    await docRef.set(record);

    return eventId;
  } catch (err) {
    logger.warn({ err, uid, eventType: event.type }, "No se pudo registrar evento de seguridad en Firestore");
    return null;
  }
}

/**
 * Obtiene el listado cronológico descendente de los eventos de seguridad del usuario.
 */
export async function getSecurityActivities(
  uid: string,
  limitCount = 30,
): Promise<SecurityActivityRecord[]> {
  if (!uid) return [];

  try {
    const snapshot = await adminDb
      .collection("users")
      .doc(uid)
      .collection("security_activity")
      .get();

    const activities: SecurityActivityRecord[] = snapshot.docs
      .map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: (data.type as SecurityActivityType) || "login",
          title: (data.title as string) || "Actividad de seguridad",
          description: (data.description as string) || "",
          ip: (data.ip as string) || "127.0.0.1",
          os: (data.os as string) || "Desconocido",
          browser: (data.browser as string) || "Desconocido",
          deviceType: (data.deviceType as "desktop" | "mobile" | "tablet" | "unknown") || "desktop",
          country: (data.country as string) || "México",
          region: (data.region as string | null) || null,
          timestamp: (data.timestamp as string) || new Date().toISOString(),
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limitCount);

    return activities;
  } catch (err) {
    logger.warn({ err, uid }, "Error al consultar historial de actividad de seguridad");
    return [];
  }
}
