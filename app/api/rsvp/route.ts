import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

const ESTADOS_VALIDOS = ["confirmado", "no_asiste"] as const;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { invitado_id, estado, personas, telefono } = (body ?? {}) as {
    invitado_id?: number | string;
    estado?: string;
    personas?: number | string;
    telefono?: string;
  };

  const id = Number(invitado_id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { error: "Selecciona tu nombre de la lista." },
      { status: 400 }
    );
  }

  if (!estado || !ESTADOS_VALIDOS.includes(estado as (typeof ESTADOS_VALIDOS)[number])) {
    return NextResponse.json(
      { error: "Indica si asistirás o no." },
      { status: 400 }
    );
  }

  const telefonoLimpio = String(telefono ?? "").trim();
  if (!telefonoLimpio || telefonoLimpio.length < 7 || telefonoLimpio.length > 20) {
    return NextResponse.json(
      { error: "Escribe un teléfono válido." },
      { status: 400 }
    );
  }

  let personasNum: number | null = null;
  if (estado === "confirmado") {
    personasNum = Number(personas);
    if (!Number.isInteger(personasNum) || personasNum < 1 || personasNum > 20) {
      return NextResponse.json(
        { error: "El número de personas debe ser entre 1 y 20." },
        { status: 400 }
      );
    }
  }

  try {
    await ensureSchema();
    const db = sql();

    const existing = await db`SELECT id, nombre FROM invitados WHERE id = ${id}`;
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "No encontramos ese nombre en la lista. Contacta a la mamá." },
        { status: 404 }
      );
    }

    await db`
      UPDATE invitados
      SET estado = ${estado},
          personas = ${personasNum},
          telefono = ${telefonoLimpio},
          actualizado_en = now()
      WHERE id = ${id}
    `;

    return NextResponse.json({ ok: true, nombre: existing[0].nombre });
  } catch (err) {
    console.error("Error guardando respuesta:", err);
    return NextResponse.json(
      { error: "No se pudo guardar tu respuesta. Intenta de nuevo en un momento." },
      { status: 500 }
    );
  }
}
