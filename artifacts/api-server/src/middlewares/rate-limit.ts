import { rateLimit } from "express-rate-limit";

/**
 * Limitador de tasa para endpoints de autenticación y gestión de sesiones.
 * Permite hasta 60 peticiones por ventana de 15 minutos por IP.
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Demasiadas solicitudes desde esta dirección IP. Intenta de nuevo en unos minutos.",
    code: "TOO_MANY_REQUESTS",
  },
});

/**
 * Limitador de tasa para endpoints sensibles de revocación masiva.
 * Permite hasta 20 peticiones por ventana de 15 minutos por IP.
 */
export const strictActionRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Límite de solicitudes de seguridad alcanzado. Intenta de nuevo más tarde.",
    code: "TOO_MANY_REQUESTS",
  },
});
