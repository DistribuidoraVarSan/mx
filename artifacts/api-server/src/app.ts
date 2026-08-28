import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Render opera detrás de un reverse proxy; trust proxy permite leer la IP real del cliente
app.set("trust proxy", 1);

// Cabeceras HTTP de endurecimiento de seguridad
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("X-XSS-Protection", "0");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  next();
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const ALLOWED_ORIGINS = [
  "https://distribuidoravarsan.com.mx",
  "https://www.distribuidoravarsan.com.mx",
  "https://distribuidora-var-san.firebaseapp.com",
  "https://distribuidora-var-san.web.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Middleware terminal global de captura y estandarización de errores
const globalErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status =
    typeof err?.status === "number" && err.status >= 400 && err.status < 600
      ? err.status
      : typeof err?.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 600
        ? err.statusCode
        : 500;

  logger.error(
    {
      err: {
        message: err?.message,
        stack: process.env.NODE_ENV !== "production" ? err?.stack : undefined,
        code: err?.code,
      },
      reqId: req.id,
      url: req.originalUrl,
      method: req.method,
    },
    "Error no controlado en la aplicación",
  );

  res.status(status).json({
    error: status === 500 ? "Error interno del servidor" : err?.message || "Error en la solicitud",
    code: err?.code || (status === 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST"),
  });
};

app.use(globalErrorHandler);

export default app;
