import { NextResponse } from "next/server";
import { WINUP_BOT_SYSTEM_PROMPT } from "@/lib/winupBotPrompt";
import { saveLead } from "@/lib/leads";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type LeadPayload = {
  name: string | null;
  email: string | null;
  phone: string | null;
  need: string | null;
  summary: string | null;
  handoff: boolean;
};

type GeminiContent = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

/** Free tier: cada modelo tiene cuota aparte. Si uno se agota, saltamos al siguiente. */
const MODEL_FALLBACKS = [
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

function toGeminiContents(messages: ChatMessage[]): GeminiContent[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

function fallbackBubbles(): string[] {
  return [
    "se me ha cortado un segundo",
    "puedes repetirme tu nombre y el mejor email o teléfono?",
  ];
}

function cleanBubble(text: string): string {
  return text
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\|{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function emptyLead(): LeadPayload {
  return {
    name: null,
    email: null,
    phone: null,
    need: null,
    summary: null,
    handoff: false,
  };
}

function normalizeLead(raw: unknown): LeadPayload {
  if (!raw || typeof raw !== "object") return emptyLead();
  const lead = raw as Record<string, unknown>;
  const asNullableString = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  const name = asNullableString(lead.name);
  const email = asNullableString(lead.email);
  const phone = asNullableString(lead.phone);
  const need = asNullableString(lead.need);
  const summary = asNullableString(lead.summary);
  const handoff =
    Boolean(lead.handoff) && Boolean(email || phone) && Boolean(need || name);

  return { name, email, phone, need, summary, handoff };
}

function parseModelPayload(raw: string): { bubbles: string[]; lead: LeadPayload } {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) text = fence[1].trim();

  try {
    const parsed = JSON.parse(text) as { bubbles?: unknown; lead?: unknown };
    const bubbles = Array.isArray(parsed.bubbles)
      ? parsed.bubbles
          .filter((b): b is string => typeof b === "string")
          .map(cleanBubble)
          .filter((b) => b.length > 1)
          .slice(0, 3)
      : [];

    return {
      bubbles: bubbles.length > 0 ? bubbles : fallbackBubbles(),
      lead: normalizeLead(parsed.lead),
    };
  } catch {
    const bubbles = text
      .split(/\|\|\||\|\||\n+/)
      .map(cleanBubble)
      .filter((b) => b.length > 1)
      .slice(0, 3);

    return {
      bubbles: bubbles.length > 0 ? bubbles : fallbackBubbles(),
      lead: emptyLead(),
    };
  }
}

function buildFallbackSummary(lead: LeadPayload, messages: ChatMessage[]): string {
  if (lead.summary) return lead.summary;

  const userBits = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .slice(-6)
    .join(" | ");

  return [
    lead.need ? `Necesidad: ${lead.need}.` : null,
    lead.name && lead.name !== "Lead chat" ? `Contacto: ${lead.name}.` : null,
    userBits ? `Notas del chat: ${userBits}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildPayload(messages: ChatMessage[]) {
  return {
    system_instruction: {
      parts: [{ text: WINUP_BOT_SYSTEM_PROMPT }],
    },
    contents: toGeminiContents(messages),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1200,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          bubbles: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          lead: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING", nullable: true },
              email: { type: "STRING", nullable: true },
              phone: { type: "STRING", nullable: true },
              need: { type: "STRING", nullable: true },
              summary: { type: "STRING", nullable: true },
              handoff: { type: "BOOLEAN" },
            },
            required: ["name", "email", "phone", "need", "summary", "handoff"],
          },
        },
        required: ["bubbles", "lead"],
      },
    },
  };
}

function resolveModels(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim();
  const list = preferred
    ? [preferred, ...MODEL_FALLBACKS.filter((m) => m !== preferred)]
    : MODEL_FALLBACKS;
  return [...new Set(list)];
}

async function generateWithFallback(apiKey: string, messages: ChatMessage[]) {
  const payload = buildPayload(messages);
  const models = resolveModels();
  let lastError = "";

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (geminiRes.ok) {
      const data = (await geminiRes.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const raw =
        data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("")
          .trim() ?? "";

      if (raw) {
        if (model !== models[0]) {
          console.info("[winup-bot] usando fallback model", model);
        }
        return { raw, model };
      }
      lastError = `Respuesta vacía (${model})`;
      continue;
    }

    const errText = await geminiRes.text();
    lastError = errText;
    console.error("[winup-bot] Gemini error", model, geminiRes.status, errText);

    // Cuota, no disponible, modelo inexistente -> siguiente
    if (
      geminiRes.status === 429 ||
      geminiRes.status === 403 ||
      geminiRes.status === 404 ||
      geminiRes.status === 503
    ) {
      continue;
    }
  }

  return { raw: null, model: null, lastError };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta GEMINI_API_KEY en el entorno." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as { messages?: ChatMessage[] };
    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages requerido" }, { status: 400 });
    }

    const result = await generateWithFallback(apiKey, messages);
    if (!result.raw) {
      const quota =
        result.lastError?.includes("RESOURCE_EXHAUSTED") ||
        result.lastError?.includes("Quota exceeded");
      return NextResponse.json(
        {
          error: quota
            ? "Cuota free de Gemini agotada por ahora. Prueba en unos minutos o cambia de modelo."
            : "No se pudo generar la respuesta.",
        },
        { status: 502 }
      );
    }

    const parsed = parseModelPayload(result.raw);
    let savedLeadId: string | null = null;

    if (parsed.lead.handoff && (parsed.lead.email || parsed.lead.phone)) {
      try {
        const summary = buildFallbackSummary(parsed.lead, messages);
        const saved = await saveLead({
          name: parsed.lead.name || "Lead chat",
          email: parsed.lead.email,
          phone: parsed.lead.phone,
          need: parsed.lead.need,
          summary,
          transcript: messages,
        });
        savedLeadId = saved.id;
        console.info("[winup-bot] lead saved", saved.id, {
          name: saved.name,
          email: saved.email,
          phone: saved.phone,
          need: saved.need,
          summary: saved.summary,
          turns: saved.transcript.length,
        });
      } catch (err) {
        console.error("[winup-bot] failed to save lead", err);
      }
    }

    return NextResponse.json({
      reply: parsed.bubbles.join(" ||| "),
      bubbles: parsed.bubbles,
      lead: parsed.lead,
      savedLeadId,
      model: result.model,
    });
  } catch (err) {
    console.error("[winup-bot]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
