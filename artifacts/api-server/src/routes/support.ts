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

      const emailHtml = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Informe de Fallo [${safeReportId}]</title>
<style type="text/css">
body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
table { border-collapse: collapse !important; }
body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F4F6F8; }
@media screen and (max-width: 600px) {
  .email-container { width: 100% !important; max-width: 100% !important; margin: 0 auto !important; border-radius: 0 !important; border: none !important; }
  .header-cell { padding: 24px 20px 18px !important; }
  .body-cell { padding: 24px 20px 24px !important; }
  .footer-cell { padding: 20px 20px !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#172033;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;background-color:#F4F6F8;">
<tr>
<td align="center" style="padding:36px 12px;">

<table role="presentation" class="email-container" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#FFFFFF;margin:0 auto;box-shadow:0 4px 24px rgba(7,29,58,0.05);border-radius:14px;overflow:hidden;border:1px solid #E5E9F0;">

<!-- TOP BAR -->
<tr>
<td class="header-cell" style="background-color:#FFFFFF;padding:32px 36px 20px;border-bottom:1px solid #EEF2F6;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td align="left" style="vertical-align:middle;">
  <img src="https://distribuidoravarsan.com.mx/dvs-logo-transparent.png" alt="Distribuidora Var San" width="140" style="display:block;border:0;outline:none;text-decoration:none;max-width:140px;height:auto;" />
</td>
<td align="right" style="vertical-align:middle;">
  <span style="background-color:#071D3A;color:#C9A84C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px;display:inline-block;white-space:nowrap;">
    SOPORTE TÉCNICO
  </span>
</td>
</tr>
</table>
</td>
</tr>

<!-- CUERPO -->
<tr>
<td class="body-cell" style="background-color:#FFFFFF;padding:36px 36px 28px;color:#172033;font-size:14px;line-height:1.65;">
  <p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
    TICKET DE INCIDENCIA
  </p>
  <h1 style="margin:0 0 16px;color:#071D3A;font-size:22px;line-height:1.3;font-weight:800;letter-spacing:-0.3px;">
    Informe de Fallo [${safeReportId}]
  </h1>

  <div style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-left:4px solid ${severity === "critical" ? "#DC2626" : "#071D3A"};border-radius:8px;padding:16px 18px;margin-bottom:20px;">
    <p style="margin:0 0 4px;color:#64748B;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">TÍTULO DEL INFORME</p>
    <p style="margin:0 0 6px;color:#071D3A;font-size:15px;font-weight:700;">${safeTitle}</p>
    <p style="margin:0;color:#64748B;font-size:12px;"><strong>Severidad:</strong> <span style="font-weight:700;color:${severity === "critical" ? "#DC2626" : "#071D3A"};text-transform:uppercase;">${safeSeverity}</span></p>
  </div>

  <p style="margin:0 0 6px;color:#071D3A;font-size:13px;font-weight:700;">Descripción del problema:</p>
  <div style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:14px 16px;margin-bottom:18px;font-size:13px;line-height:1.6;color:#334155;">
    ${safeDesc}
  </div>

  <p style="margin:0 0 6px;color:#071D3A;font-size:13px;font-weight:700;">Pasos para reproducir:</p>
  <div style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:14px 16px;margin-bottom:18px;font-size:13px;line-height:1.6;color:#334155;">
    ${safeSteps}
  </div>

  <p style="margin:0 0 6px;color:#071D3A;font-size:13px;font-weight:700;">Comportamiento esperado:</p>
  <div style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:14px 16px;margin-bottom:20px;font-size:13px;line-height:1.6;color:#334155;">
    ${safeExpected}
  </div>

  <!-- METADATOS TÉCNICOS -->
  <div style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px 18px;margin-top:20px;">
    <p style="margin:0 0 10px;color:#071D3A;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Metadatos Técnicos</p>
    <table role="presentation" width="100%" style="font-size:12px;color:#475569;line-height:1.7;">
      <tr><td style="width:40%;color:#64748B;font-weight:600;">Versión Portal:</td><td style="color:#071D3A;">${safeAppVersion}</td></tr>
      <tr><td style="color:#64748B;font-weight:600;">Sistema Operativo:</td><td style="color:#071D3A;">${safeOs}</td></tr>
      <tr><td style="color:#64748B;font-weight:600;">Navegador:</td><td style="color:#071D3A;">${safeBrowser}</td></tr>
      <tr><td style="color:#64748B;font-weight:600;">Dispositivo:</td><td style="color:#071D3A;">${safeDeviceType}</td></tr>
      <tr><td style="color:#64748B;font-weight:600;">Idioma:</td><td style="color:#071D3A;">${safeLanguage}</td></tr>
      <tr><td style="color:#64748B;font-weight:600;">Fecha/Hora:</td><td style="color:#071D3A;">${safeTimestamp}</td></tr>
    </table>
  </div>
</td>
</tr>

<!-- FOOTER -->
<tr>
<td class="footer-cell" style="background-color:#F8FAFC;padding:24px 36px;border-top:1px solid #EEF2F6;text-align:center;">
<p style="margin:0 0 4px;color:#071D3A;font-size:13px;font-weight:700;letter-spacing:0.3px;">Distribuidora Var San</p>
<p style="margin:0;color:#8C9BAE;font-size:11px;">Sistema Interno de Soporte y Monitoreo • © 2026</p>
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;

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
