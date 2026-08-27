import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Render opera detrás de un reverse proxy; trust proxy permite leer la IP real del cliente
app.set("trust proxy", 1);

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

export default app;
