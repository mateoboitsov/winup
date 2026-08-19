import { NextResponse } from "next/server";
import {
  type BriefingPayload,
  saveBriefing,
  sendBriefingEmail,
} from "@/lib/briefings";

function isValidPayload(body: unknown): body is BriefingPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as BriefingPayload;
  const fecha = b.compromiso?.fecha?.trim();
  return !!fecha;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;

    if (!isValidPayload(body)) {
      return NextResponse.json(
        { ok: false, error: "Falta indicar la fecha de compromiso." },
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
        return NextResponse.json(
          {
            ok: false,
            saved: true,
            emailed: false,
            error:
              "El formulario está recibido pero falta configurar el email en el servidor.",
          },
          { status: 503 },
        );
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
