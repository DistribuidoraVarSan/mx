import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { strictActionRateLimit } from "../middlewares/rate-limit";
import { sendEmail, EMAIL_SENDERS } from "../lib/mailer";
import { extractDeviceInfo } from "../lib/device-detector";
import { escapeHtml } from "../lib/email-templates";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const BugReportSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(3000),
  stepsToReproduce: z.string().trim().max(3000).optional(),
  expectedBehavior: z.string().trim().max(1000).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  appVersion: z.string().default("10.01"),
  technicalDetails: z.object({
    os: z.string().optional(),
    browser: z.string().optional(),
    deviceType: z.string().optional(),
    language: z.string().optional(),
  }).optional(),
});

/**
 * Sanitiza el texto para eliminar posibles patrones sensibles como tokens o contraseñas
 */
function sanitizeReportText(text: string): string {
  if (!text) return "";
  return text
    .replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, "[TOKEN REDACTADO]")
    .replace(/(?:password|contraseña|passwd|secret)\s*[:=]\s*[^\s]+/gi, "$1: [REDACTADO]")
    .slice(0, 4000);
}

/**
 * POST /api/support/bug-report
 * Recibe y procesa un informe de error técnico.
 */
router.post(
  "/support/bug-report",
  strictActionRateLimit,
  async (req: Request, res: Response) => {
    const parseResult = BugReportSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: "Los datos del reporte de fallos son inválidos.",
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { title, description, stepsToReproduce, expectedBehavior, severity, appVersion, technicalDetails } = parseResult.data;
    const clientInfo = extractDeviceInfo(req);
    const reportId = `TICKET-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const sanitizedTitle = sanitizeReportText(title);
    const sanitizedDesc = sanitizeReportText(description);
    const sanitizedSteps = stepsToReproduce ? sanitizeReportText(stepsToReproduce) : "No especificado";
    const sanitizedExpected = expectedBehavior ? sanitizeReportText(expectedBehavior) : "No especificado";

    const os = technicalDetails?.os || clientInfo.os;
    const browser = technicalDetails?.browser || clientInfo.browser;
    const deviceType = technicalDetails?.deviceType || clientInfo.deviceType;
    const language = technicalDetails?.language || "es";

    logger.info(
      {
        reportId,
        title: sanitizedTitle,
        severity,
        appVersion,
        os,
        browser,
      },
      "Informe de error recibido de usuario",
    );

    // Notificar de forma segura a la casilla de soporte oficial (distribuidora.varsan@outlook.com)
    try {
      const safeReportId = escapeHtml(reportId);
      const safeSeverity = escapeHtml(severity);
      const safeTitle = escapeHtml(sanitizedTitle);
      const safeDesc = escapeHtml(sanitizedDesc);
      const safeSteps = escapeHtml(sanitizedSteps);
      const safeExpected = escapeHtml(sanitizedExpected);
      const safeAppVersion = escapeHtml(appVersion);
      const safeOs = escapeHtml(os);
      const safeBrowser = escapeHtml(browser);
      const safeDeviceType = escapeHtml(deviceType);
      const safeLanguage = escapeHtml(language);
      const safeTimestamp = escapeHtml(timestamp);

      const emailHtml = `
<div style="font-family:Arial,sans-serif;color:#1e293b;max-width:600px;margin:0 auto;">
  <h2 style="color:#0a1f44;margin-top:0;">Nuevo Informe de Fallo [${safeReportId}]</h2>
  <p><strong>Severidad:</strong> <span style="text-transform:uppercase;color:${severity === "critical" ? "#dc2626" : "#0284c7"}">${safeSeverity}</span></p>
  <p><strong>Título:</strong> ${safeTitle}</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
  <h3 style="color:#0a1f44;font-size:14px;">Descripción del problema:</h3>
  <p style="background:#f8fafc;padding:12px;border-radius:6px;font-size:13px;line-height:1.6;">${safeDesc}</p>

  <h3 style="color:#0a1f44;font-size:14px;">Pasos para reproducir:</h3>
  <p style="background:#f8fafc;padding:12px;border-radius:6px;font-size:13px;line-height:1.6;">${safeSteps}</p>

  <h3 style="color:#0a1f44;font-size:14px;">Comportamiento esperado:</h3>
  <p style="background:#f8fafc;padding:12px;border-radius:6px;font-size:13px;line-height:1.6;">${safeExpected}</p>

  <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
  <h3 style="color:#0a1f44;font-size:14px;">Metadatos Técnicos (Mínimos y No Invasivos):</h3>
  <ul style="font-size:12px;color:#64748b;line-height:1.8;">
    <li><strong>Versión del Portal:</strong> ${safeAppVersion}</li>
    <li><strong>Sistema Operativo:</strong> ${safeOs}</li>
    <li><strong>Navegador:</strong> ${safeBrowser}</li>
    <li><strong>Tipo de dispositivo:</strong> ${safeDeviceType}</li>
    <li><strong>Idioma seleccionado:</strong> ${safeLanguage}</li>
    <li><strong>Fecha/Hora:</strong> ${safeTimestamp}</li>
  </ul>
</div>`;

      await sendEmail({
        to: "distribuidora.varsan@outlook.com",
        subject: `[Informe de Fallo ${reportId}] ${sanitizedTitle}`,
        html: emailHtml,
        text: `Informe de Fallo ${reportId}\nTítulo: ${sanitizedTitle}\nSeveridad: ${severity}\nVersión: ${appVersion}\nSO: ${os}\nNavegador: ${browser}\nDescripción:\n${sanitizedDesc}\nPasos:\n${sanitizedSteps}`,
        from: EMAIL_SENDERS.accounts,
      }).catch(() => {});
    } catch {
      // Continuar sin interrumpir la respuesta positiva
    }

    res.status(200).json({
      status: "ok",
      ticketId: reportId,
      message: "Tu informe de error ha sido registrado y enviado a nuestro equipo técnico exitosamente.",
    });
  },
);

export default router;
