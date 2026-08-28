import { Router, type IRouter } from "express";
import { z } from "zod";
import { chatWithAssistant } from "../lib/groq";
import {
  ASSISTANT_LANGUAGES,
  DEFAULT_ASSISTANT_LANGUAGE,
  getAssistantAction,
  type AssistantActionKey,
} from "../lib/assistant-knowledge";
import { logger } from "../lib/logger";
import { assistantRateLimit } from "../middlewares/rate-limit";

const router: IRouter = Router();

const ChatMessageSchema = z.object({
  role: z.enum(["user", "bot"]),
  text: z.string().min(1).max(2000),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1, "El mensaje no puede estar vacío.").max(2000),
  // Historial corto de la sesión, para dar contexto sin cargar tokens de más.
  history: z.array(ChatMessageSchema).max(20).optional().default([]),
  // Idioma activo del sitio (misma fuente de verdad que useLanguage() en el
  // frontend). Si falta o llega inválido, se usa español por defecto en vez
  // de rechazar la solicitud.
  language: z.enum(ASSISTANT_LANGUAGES).optional().default(DEFAULT_ASSISTANT_LANGUAGE),
});

router.post("/assistant/chat", assistantRateLimit, async (req, res) => {
  const parseResult = ChatRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Solicitud inválida.",
      details: parseResult.error.flatten(),
    });
    return;
  }

  const { message, history, language } = parseResult.data;

  try {
    const result = await chatWithAssistant(message, history, language);

    const actions = result.actions.map((key) => {
      const action = getAssistantAction(key as AssistantActionKey, language);
      return { key, ...action };
    });

    res.json({ reply: result.reply, actions });
  } catch (err) {
    logger.error({ err }, "Assistant chat request failed");
    res.status(502).json({
      error:
        "No pudimos conectar con el asistente en este momento. Intenta de nuevo o escríbenos directamente.",
    });
  }
});

export default router;
