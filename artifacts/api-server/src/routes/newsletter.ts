import { Router, type IRouter, type Request } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { db, newsletterSubscribersTable, eq } from "@workspace/db";
import { sendEmail } from "../lib/mailer";
import { buildWelcomeEmail } from "../lib/newsletter-email-templates";
import { resolveEmailLanguage } from "../lib/email-templates";
import { logger } from "../lib/logger";
import { newsletterRateLimit } from "../middlewares/rate-limit";

const router: IRouter = Router();

const ALLOWED_NEWSLETTER_ORIGINS = [
  "https://distribuidoravarsan.com.mx",
  "https://www.distribuidoravarsan.com.mx",
  "https://distribuidora-var-san.firebaseapp.com",
  "https://distribuidora-var-san.web.app",
];

const DEFAULT_PUBLIC_APP_URL = "https://distribuidoravarsan.com.mx";

const SubscribeRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un correo electrónico válido."),
  language: z.string().optional(),
});

/**
 * Resuelve de forma segura el origen público oficial para construir el enlace de
 * cancelación del newsletter.
 * Prioridad:
 * 1. PUBLIC_APP_URL si está configurada y pertenece a la lista de orígenes permitidos.
 * 2. Fallback estricto a https://distribuidoravarsan.com.mx.
 * En ningún caso se construye a partir de cabeceras Host o X-Forwarded-Host del cliente en producción.
 */
function getPublicOrigin(req?: Request): string {
  const envUrl = process.env.PUBLIC_APP_URL?.trim();
  if (envUrl) {
    try {
      const parsed = new URL(envUrl);
      const isDev = process.env.NODE_ENV !== "production";
      const isAllowed =
        ALLOWED_NEWSLETTER_ORIGINS.includes(parsed.origin) ||
        (isDev && (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"));
      if (isAllowed) {
        return parsed.origin;
      }
    } catch {
      // Usar fallback seguro
    }
  }

  // En entorno de desarrollo permitimos localhost exclusivamente para pruebas locales
  if (process.env.NODE_ENV !== "production" && req) {
    const host = req.get("host");
    if (host && (host.startsWith("localhost:") || host.startsWith("127.0.0.1:"))) {
      const proto = req.protocol || "http";
      return `${proto}://${host}`;
    }
  }

  return DEFAULT_PUBLIC_APP_URL;
}

function renderUnsubscribePage(title: string, message: string): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} · Distribuidora Var San</title>
    <style>
      body { margin: 0; background: #f5f7fa; font-family: 'DM Sans', Arial, sans-serif; color: #14243b; display: flex; min-height: 100vh; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; }
      .card { max-width: 440px; width: 100%; background: #fff; border: 1px solid #dce3eb; padding: 40px 32px; text-align: center; }
      .kicker { margin: 0; color: #0a1f44; font-family: 'Space Mono', Consolas, monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }
      h1 { font-size: 22px; margin: 14px 0 12px; color: #0a1f44; }
      p { margin: 0; color: #66758a; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="card">
      <p class="kicker">Distribuidora Var San</p>
      <h1>${title}</h1>
      <p>${message}</p>
    </div>
  </body>
</html>`;
}

router.post("/newsletter/subscribe", newsletterRateLimit, async (req, res) => {
  const parseResult = SubscribeRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Ingresa un correo electrónico válido.",
      details: parseResult.error.flatten(),
    });
    return;
  }

  const { email } = parseResult.data;

  try {
    const [existing] = await db
      .select()
      .from(newsletterSubscribersTable)
      .where(eq(newsletterSubscribersTable.email, email))
      .limit(1);

    if (existing && existing.status === "subscribed") {
      // Evita registros duplicados: si ya está suscrito, no lo tratamos
      // como error, solo confirmamos su estado actual.
      res.status(200).json({
        status: "already_subscribed",
        message: "Este correo ya está suscrito a nuestro newsletter.",
      });
      return;
    }

    const subscriber = existing
      ? (
          await db
            .update(newsletterSubscribersTable)
            .set({ status: "subscribed", subscribedAt: new Date(), unsubscribedAt: null })
            .where(eq(newsletterSubscribersTable.id, existing.id))
            .returning()
        )[0]
      : (
          await db
            .insert(newsletterSubscribersTable)
            .values({
              email,
              source: "website_footer",
              unsubscribeToken: crypto.randomUUID(),
            })
            .returning()
        )[0];

    res.status(201).json({
      status: "subscribed",
      message: "¡Listo! Te suscribiste correctamente. Revisa tu correo, te enviamos la bienvenida.",
    });

    // El correo de bienvenida se envía después de responder: si el proveedor
    // de correo falla, la suscripción ya quedó registrada y el usuario ya
    // recibió su confirmación en pantalla. El error solo queda en el log.
    const emailLang = resolveEmailLanguage(parseResult.data.language);
    const unsubscribeUrl = `${getPublicOrigin(req)}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;
    const { subject, html, text } = buildWelcomeEmail({ unsubscribeUrl }, emailLang);

    sendEmail({ to: email, subject, html, text })
      .then(() =>
        db
          .update(newsletterSubscribersTable)
          .set({ welcomeEmailSentAt: new Date() })
          .where(eq(newsletterSubscribersTable.id, subscriber.id)),
      )
      .catch((err) => {
        logger.error({ err }, "No se pudo enviar el correo de bienvenida del newsletter");
      });
  } catch (err) {
    logger.error({ err }, "Newsletter subscribe request failed");
    res.status(500).json({
      error: "No pudimos completar tu suscripción en este momento. Intenta de nuevo más tarde.",
    });
  }
});

router.get("/newsletter/unsubscribe", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : undefined;

  if (!token) {
    res
      .status(400)
      .send(renderUnsubscribePage("Enlace inválido", "El enlace de cancelación no es válido o está incompleto."));
    return;
  }

  try {
    const [subscriber] = await db
      .select()
      .from(newsletterSubscribersTable)
      .where(eq(newsletterSubscribersTable.unsubscribeToken, token))
      .limit(1);

    if (!subscriber) {
      res
        .status(404)
        .send(renderUnsubscribePage("Enlace inválido", "No encontramos ninguna suscripción asociada a este enlace."));
      return;
    }

    if (subscriber.status !== "unsubscribed") {
      await db
        .update(newsletterSubscribersTable)
        .set({ status: "unsubscribed", unsubscribedAt: new Date() })
        .where(eq(newsletterSubscribersTable.id, subscriber.id));
    }

    res
      .status(200)
      .send(
        renderUnsubscribePage(
          "Suscripción cancelada",
          "Ya no recibirás correos de nuestro newsletter. Lamentamos verte ir.",
        ),
      );
  } catch (err) {
    logger.error({ err }, "Newsletter unsubscribe request failed");
    res
      .status(500)
      .send(renderUnsubscribePage("Ocurrió un error", "No pudimos procesar tu solicitud. Intenta de nuevo más tarde."));
  }
});

export default router;
