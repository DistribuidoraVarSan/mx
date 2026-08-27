import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { logger } from "./logger";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "distribuidora-var-san";

/**
 * Inicializa y retorna la instancia singleton de la App de Firebase Admin.
 */
export function getFirebaseAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountJson) {
    try {
      const parsedCredentials = JSON.parse(serviceAccountJson);
      const app = initializeApp({
        credential: cert(parsedCredentials),
        projectId: PROJECT_ID,
      });
      logger.info({ projectId: PROJECT_ID }, "Firebase Admin inicializado con Service Account Key");
      return app;
    } catch (err) {
      logger.error({ err }, "Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY; intentando inicialización por projectId");
    }
  }

  const app = initializeApp({
    projectId: PROJECT_ID,
  });
  logger.info({ projectId: PROJECT_ID }, "Firebase Admin inicializado por projectId");
  return app;
}

const firebaseApp = getFirebaseAdminApp();

export const adminAuth: Auth = getAuth(firebaseApp);
export const adminDb: Firestore = getFirestore(firebaseApp);
