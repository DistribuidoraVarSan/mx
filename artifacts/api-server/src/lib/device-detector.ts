import type { Request } from "express";

export interface DeviceInfo {
  os: string;
  browser: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  ip: string;
  country: string;
  region?: string;
  userAgent: string;
}

/**
 * Parsea el User-Agent para clasificar sistema operativo, navegador y tipo de dispositivo
 * de forma determinista y sin dependencias pesadas.
 */
export function parseUserAgent(ua: string): { os: string; browser: string; deviceType: DeviceInfo["deviceType"] } {
  if (!ua) {
    return { os: "Desconocido", browser: "Desconocido", deviceType: "unknown" };
  }

  // 1. Detección de Sistema Operativo
  let os = "Otro SO";
  if (/windows nt 10\.0/i.test(ua)) os = "Windows 10/11";
  else if (/windows nt 6\.3/i.test(ua)) os = "Windows 8.1";
  else if (/windows nt 6\.1/i.test(ua)) os = "Windows 7";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone/i.test(ua)) os = "iOS (iPhone)";
  else if (/ipad/i.test(ua)) os = "iOS (iPad)";
  else if (/macintosh|mac os x/i.test(ua)) {
    const match = ua.match(/Mac OS X ([0-9_]+)/i);
    os = match ? `macOS ${match[1].replace(/_/g, ".")}` : "macOS";
  } else if (/android/i.test(ua)) {
    const match = ua.match(/Android ([0-9.]+)/i);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (/cros/i.test(ua)) os = "Chrome OS";
  else if (/linux/i.test(ua)) os = "Linux";


  // 2. Detección de Navegador
  let browser = "Navegador Web";
  if (/edg\//i.test(ua)) {
    const match = ua.match(/Edg\/([0-9]+)/i);
    browser = match ? `Edge ${match[1]}` : "Edge";
  } else if (/opr\/|opera/i.test(ua)) {
    const match = ua.match(/(?:OPR|Opera)\/([0-9]+)/i);
    browser = match ? `Opera ${match[1]}` : "Opera";
  } else if (/samsungbrowser/i.test(ua)) {
    const match = ua.match(/SamsungBrowser\/([0-9]+)/i);
    browser = match ? `Samsung Internet ${match[1]}` : "Samsung Internet";
  } else if (/chrome|crios/i.test(ua)) {
    const match = ua.match(/(?:Chrome|CriOS)\/([0-9]+)/i);
    browser = match ? `Chrome ${match[1]}` : "Chrome";
  } else if (/firefox|fxios/i.test(ua)) {
    const match = ua.match(/(?:Firefox|FxiOS)\/([0-9]+)/i);
    browser = match ? `Firefox ${match[1]}` : "Firefox";
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    const match = ua.match(/Version\/([0-9]+)/i);
    browser = match ? `Safari ${match[1]}` : "Safari";
  }

  // 3. Detección de Tipo de Dispositivo
  let deviceType: DeviceInfo["deviceType"] = "desktop";
  if (/ipad|tablet/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobi|iphone|android.*mobile/i.test(ua)) {
    deviceType = "mobile";
  }

  return { os, browser, deviceType };
}

/**
 * Obtiene la IP del cliente de forma segura utilizando 'req.ip' de Express
 * (calculada a través del proxy inverso de Render mediante 'app.set("trust proxy", 1)').
 * Esta IP se utiliza exclusivamente para fines informativos y de registro de actividad.
 */
export function extractClientIp(req: Request): string {
  if (req.ip) {
    return req.ip;
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

/**
 * Deriva la ubicación aproximada basada en cabeceras de proxy de Render/Cloudflare si están presentes,
 * o devuelve una ubicación por defecto razonable sin invocar APIs externas lentas ni GPS.
 */
export function extractLocationFromReq(req: Request): { country: string; region?: string } {
  // Cabeceras estándar de CDN/Proxy inverso
  const countryHeader = req.headers["cf-ipcountry"] || req.headers["x-country-code"];
  const regionHeader = req.headers["cf-region"] || req.headers["x-region-code"];

  const country = typeof countryHeader === "string" ? countryHeader.toUpperCase() : "México";
  const region = typeof regionHeader === "string" ? regionHeader : undefined;

  return { country, region };
}

/**
 * Extrae y encapsula la información completa del dispositivo e IP de la petición.
 */
export function extractDeviceInfo(req: Request): DeviceInfo {
  const rawUa = req.headers["user-agent"] || "";
  const { os, browser, deviceType } = parseUserAgent(rawUa);
  const ip = extractClientIp(req);
  const { country, region } = extractLocationFromReq(req);

  return {
    os,
    browser,
    deviceType,
    ip,
    country,
    region,
    userAgent: rawUa.slice(0, 300), // Sanitizado en longitud
  };
}
