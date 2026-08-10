import { Router, type IRouter } from "express";
import { z } from "zod";
import { chatWithAssistant } from "../lib/groq";
import { ASSISTANT_ACTIONS, type AssistantActionKey } from "../lib/assistant-knowledge";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const ChatMessageSchema = z.object({
  role: z.enum(["user", "bot"]),
  text: z.string().min(1).max(2000),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1, "El mensaje no puede estar vacío.").max(2000),
  // Historial corto de la sesión, para dar contexto sin cargar tokens de más.
  history: z.array(ChatMessageSchema).max(20).optional().default([]),
});

router.post("/assistant/chat", async (req, res) => {
  const parseResult = ChatRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Solicitud inválida.",
      details: parseResult.error.flatten(),
    });
    return;
  }

  const { message, history } = parseResult.data;

  try {
    const result = await chatWithAssistant(message, history);

    const actions = result.actions.map((key) => {
      const action = ASSISTANT_ACTIONS[key as AssistantActionKey];
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
