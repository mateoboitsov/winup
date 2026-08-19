import { promises as fs } from "fs";
import path from "path";

export type BriefingPayload = {
  meta: {
    formVersion?: string;
    enviadoEl?: string;
    nombre?: string;
    contacto?: string;
  };
  textosServicios?: { decision: string; notas?: string };
  materialServicios?: Record<string, { label: string; estado: string }>;
  metricas?: { decision: string; correcciones?: string };
  equipo?: { decision: string; fecha?: string; personas?: string };
  legal?: { decision: string; datosEmpresa?: string };
  edicionWeb?: string;
  carpeta?: { decision: string; enlace?: string; fecha?: string };
  compromiso?: { fecha: string; notas?: string };
};

const BRIEFINGS_DIR = path.join(process.cwd(), "data");
const BRIEFINGS_FILE = path.join(BRIEFINGS_DIR, "briefings.json");

export async function saveBriefing(payload: BriefingPayload) {
  const entry = {
    id: `briefing_${Date.now()}`,
    receivedAt: new Date().toISOString(),
    ...payload,
  };

  // Netlify/serverless: filesystem de solo lectura — el email es la fuente de verdad.
  if (process.env.NETLIFY || process.env.VERCEL) {
    return entry;
  }

  try {
    await fs.mkdir(BRIEFINGS_DIR, { recursive: true });

    let existing: unknown[] = [];
    try {
      const raw = await fs.readFile(BRIEFINGS_FILE, "utf8");
      existing = JSON.parse(raw) as unknown[];
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }

    existing.push(entry);
    await fs.writeFile(BRIEFINGS_FILE, JSON.stringify(existing, null, 2), "utf8");
  } catch (err) {
    console.warn("[briefing] No se pudo guardar en disco", err);
  }

  return entry;
}

const DECISION_LABELS: Record<string, string> = {
  ok: "Me valen — publicar así",
  cambios: "Quiere cambiar textos",
  reunion: "Revisar en call",
  listo: "Material en carpeta",
  fecha: "Lo envía pronto",
  vacio: "Dejar vacío",
  na: "No aplica",
  corregir: "Hay que corregir métricas",
  quitar: "Quitar métricas",
  enviado: "Sube equipo a carpeta",
  placeholder: "Placeholders por ahora",
  tenemos: "Tienen textos legales",
  plantilla: "Usar plantilla con sus datos",
  abogado: "Lo pasa su abogado",
  a: "A — Nos piden cambios",
  b: "B — CMS visual",
  c: "C — Notion",
  d: "D — WordPress / Webflow",
  e: "E — GitHub + formación",
  f: "F — Panel admin a medida",
  nsnc: "Aún no lo sabe",
};

function label(value: string) {
  return DECISION_LABELS[value] ?? (value || "—");
}

export function briefingToPlainText(payload: BriefingPayload) {
  const lines: string[] = [
    "Briefing winup. — pendiente cliente",
    "================================",
    "",
    `Recibido: ${payload.meta.enviadoEl ?? new Date().toISOString()}`,
    "",
    "TEXTOS SERVICIOS",
    label(payload.textosServicios?.decision ?? ""),
  ];

  if (payload.textosServicios?.notas?.trim()) {
    lines.push(payload.textosServicios.notas.trim());
  }

  lines.push("", "MATERIAL POR SERVICIO");
  Object.values(payload.materialServicios ?? {}).forEach((s) => {
    lines.push(`· ${s.label}: ${label(s.estado)}`);
  });

  lines.push(
    "",
    "MÉTRICAS",
    label(payload.metricas?.decision ?? ""),
  );
  if (payload.metricas?.correcciones?.trim()) {
    lines.push(payload.metricas.correcciones.trim());
  }

  lines.push(
    "",
    "EQUIPO",
    label(payload.equipo?.decision ?? ""),
  );
  if (payload.equipo?.fecha) lines.push(`Fecha: ${payload.equipo.fecha}`);
  if (payload.equipo?.personas?.trim()) lines.push(payload.equipo.personas.trim());

  lines.push(
    "",
    "LEGAL",
    label(payload.legal?.decision ?? ""),
  );
  if (payload.legal?.datosEmpresa?.trim()) {
    lines.push(payload.legal.datosEmpresa.trim());
  }

  lines.push("", "EDICIÓN WEB", label(payload.edicionWeb ?? ""));

  lines.push(
    "",
    "CARPETA",
    label(payload.carpeta?.decision ?? ""),
  );
  if (payload.carpeta?.enlace) lines.push(`Enlace: ${payload.carpeta.enlace}`);
  if (payload.carpeta?.fecha) lines.push(`Fecha: ${payload.carpeta.fecha}`);

  lines.push(
    "",
    "COMPROMISO",
    `Fecha: ${payload.compromiso?.fecha ?? "—"}`,
  );
  if (payload.compromiso?.notas?.trim()) {
    lines.push(payload.compromiso.notas.trim());
  }

  lines.push("", "---", "JSON completo adjunto.");
  return lines.join("\n");
}

export async function sendBriefingEmail(payload: BriefingPayload) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to =
    process.env.BRIEFING_TO_EMAIL?.trim() || "hello@maibo.agency";
  const from =
    process.env.BRIEFING_FROM_EMAIL?.trim() ||
    "winup. <noreply@maibo.agency>";

  if (!apiKey) {
    return { sent: false as const, reason: "missing_config" as const };
  }

  const date = (payload.meta.enviadoEl ?? new Date().toISOString()).slice(0, 10);
  const filename = `winup-pendiente-${date}.json`;
  const json = JSON.stringify(payload, null, 2);
  const subject = `winup briefing — ${date}${payload.compromiso?.fecha ? ` · entrega ${payload.compromiso.fecha}` : ""}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: briefingToPlainText(payload),
      attachments: [
        {
          filename,
          content: Buffer.from(json, "utf8").toString("base64"),
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[briefing] Resend error", res.status, errText);
    return { sent: false as const, reason: "send_failed" as const, detail: errText };
  }

  return { sent: true as const };
}
