import OpenAI from "openai";
import { logger } from "./logger";
import {
  buildSystemInstruction,
  ASSISTANT_ACTION_KEYS,
  type AssistantLanguage,
} from "./assistant-knowledge";

const MODEL = "openai/gpt-oss-120b";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

let client: OpenAI | null = null;

/**
 * Lazily creates the Groq client (API compatible con OpenAI). Leer la key de
 * forma perezosa (en lugar de al cargar el módulo) significa que el resto
 * del servidor sigue funcionando aunque GROQ_API_KEY no esté configurada
 * todavía — solo este endpoint falla, con un error claro, hasta que se
 * configure la clave.
 */
function getClient(): OpenAI {
  if (client) return client;

  const apiKey = process.env["GROQ_API_KEY"];

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY environment variable is required but was not provided.",
    );
  }

  client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
  return client;
}

export type AssistantChatMessage = {
  role: "user" | "bot";
  text: string;
};

export type AssistantChatResult = {
  reply: string;
  actions: string[];
};

const RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description:
        "Respuesta en texto plano para mostrar al cliente, en el idioma indicado en la instrucción de sistema.",
    },
    actions: {
      type: "array",
      items: {
        type: "string",
        enum: [...ASSISTANT_ACTION_KEYS],
      },
      description: "Claves de botones a mostrar, puede ser un arreglo vacío.",
    },
  },
  required: ["reply", "actions"],
  additionalProperties: false,
} as const;

/**
 * Valida y normaliza la respuesta cruda del modelo contra el mismo contrato
 * que antes garantizaba Gemini (responseSchema). Se conserva íntegra la
 * validación: si el modelo devuelve algo mal formado, se descarta en lugar
 * de dejarlo pasar como texto libre.
 */
function parseAssistantResponse(rawText: string): AssistantChatResult | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    return null;
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { reply?: unknown }).reply !== "string"
  ) {
    return null;
  }

  const reply = (parsed as { reply: string }).reply;
  const rawActions = (parsed as { actions?: unknown }).actions;

  const actions = Array.isArray(rawActions)
    ? rawActions.filter(
        (action): action is string =>
          typeof action === "string" &&
          (ASSISTANT_ACTION_KEYS as readonly string[]).includes(action),
      )
    : [];

  return { reply, actions };
}

// Instrucción de refuerzo para el reintento (ver bucle más abajo). Se
// mantiene en español + inglés a propósito: es una instrucción de FORMATO,
// no de idioma de respuesta — el idioma de "reply" lo sigue decidiendo
// exclusivamente buildSystemInstruction(language), que ya se envió como
// primer mensaje "system" y no se pierde en el reintento.
const JSON_ONLY_REMINDER =
  'Responde ÚNICAMENTE con un objeto JSON válido con las claves "reply" (string) y "actions" (array de strings). No incluyas texto fuera del JSON. / Respond ONLY with a valid JSON object with keys "reply" (string) and "actions" (array of strings). No text outside the JSON.';

export async function chatWithAssistant(
  message: string,
  history: AssistantChatMessage[],
  language: AssistantLanguage,
): Promise<AssistantChatResult> {
  const ai = getClient();

  const baseMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemInstruction(language) },
    ...history.map((entry) => ({
      role: (entry.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: entry.text,
    })),
    { role: "user", content: message },
  ];

  const responseFormat = {
    type: "json_schema" as const,
    json_schema: {
      name: "assistant_response",
      // Groq recomienda strict: false para modelos gpt-oss: el schema sigue
      // guiando la generación, pero evita que la API rechace la respuesta
      // por detalles menores del schema. La validación real la seguimos
      // haciendo nosotros mismos en parseAssistantResponse().
      strict: false,
      schema: RESPONSE_JSON_SCHEMA,
    },
  };

  // openai/gpt-oss-120b en Groq en ocasiones ignora response_format en el
  // primer intento (comportamiento reportado por el propio Groq). En lugar
  // de eliminar la validación para "hacerlo funcionar", se reintenta una vez
  // con una instrucción explícita de formato antes de fallar.
  let lastRawText: string | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    const messages =
      attempt === 0
        ? baseMessages
        : [
            ...baseMessages,
            {
              role: "system" as const,
              content: JSON_ONLY_REMINDER,
            },
          ];

    const completion = await ai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.4,
      response_format: responseFormat,
    });

    const rawText = completion.choices[0]?.message?.content ?? undefined;
    lastRawText = rawText;

    if (!rawText) continue;

    const result = parseAssistantResponse(rawText);
    if (result) return result;

    logger.error({ rawText, language }, "Groq returned a malformed response, retrying");
  }

  logger.error({ rawText: lastRawText, language }, "Groq response missing expected shape after retry");
  throw new Error("Groq returned a malformed response.");
}
