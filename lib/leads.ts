import { promises as fs } from "fs";
import path from "path";

export type ChatTurn = {
  role: "user" | "assistant" | string;
  content: string;
};

export type CapturedLead = {
  id: string;
  createdAt: string;
  source: "chat-bot";
  /** Datos de contacto */
  name: string;
  email: string | null;
  phone: string | null;
  /** Necesidad / servicio detectado */
  need: string | null;
  /** Resumen comercial para el equipo */
  summary: string | null;
  /** Conversación completa */
  transcript: ChatTurn[];
};

const LEADS_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(LEADS_DIR, "leads.json");

export async function saveLead(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  need?: string | null;
  summary?: string | null;
  transcript: ChatTurn[];
}): Promise<CapturedLead> {
  const entry: CapturedLead = {
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: "chat-bot",
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    need: input.need ?? null,
    summary: input.summary ?? null,
    transcript: input.transcript,
  };

  await fs.mkdir(LEADS_DIR, { recursive: true });

  let existing: CapturedLead[] = [];
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf8");
    existing = JSON.parse(raw) as CapturedLead[];
    if (!Array.isArray(existing)) existing = [];
  } catch {
    existing = [];
  }

  existing.push(entry);
  await fs.writeFile(LEADS_FILE, JSON.stringify(existing, null, 2), "utf8");
  return entry;
}
