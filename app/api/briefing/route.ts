import { NextResponse } from "next/server";
import {
  type BriefingPayload,
  saveBriefing,
  sendBriefingEmail,
} from "@/lib/briefings";

function isValidPayload(body: unknown): body is BriefingPayload {
  if (!body || typeof body !== "object") return false;
  const meta = (body as BriefingPayload).meta;
  return (
    !!meta &&
    typeof meta.nombre === "string" &&
    meta.nombre.trim().length > 0 &&
    typeof meta.contacto === "string" &&
    meta.contacto.trim().length > 0
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;

    if (!isValidPayload(body)) {
      return NextResponse.json(
        { ok: false, error: "Faltan nombre y contacto." },
        { status: 400 },
      );
    }

    const payload: BriefingPayload = {
      ...body,
      meta: {
        ...body.meta,
        enviadoEl: body.meta.enviadoEl ?? new Date().toISOString(),
      },
    };

    await saveBriefing(payload);

    const mail = await sendBriefingEmail(payload);

    if (!mail.sent) {
      if (mail.reason === "missing_config") {
        return NextResponse.json({
          ok: true,
          saved: true,
          emailed: false,
          warning:
            "Guardado en servidor. Falta RESEND_API_KEY (copiar de maibo-course-app).",
        });
      }

      return NextResponse.json(
        {
          ok: false,
          saved: true,
          error: "No se pudo enviar el email. Inténtalo de nuevo.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, saved: true, emailed: true });
  } catch (err) {
    console.error("[briefing]", err);
    return NextResponse.json(
      { ok: false, error: "Error interno." },
      { status: 500 },
    );
  }
}
