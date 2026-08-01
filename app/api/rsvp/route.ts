import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { nombre, personas, telefono } = (body ?? {}) as {
    nombre?: string;
    personas?: number | string;
    telefono?: string;
  };

  const nombreLimpio = String(nombre ?? "").trim();
  const telefonoLimpio = String(telefono ?? "").trim();
  const personasNum = Number(personas);

  if (!nombreLimpio || nombreLimpio.length > 120) {
    return NextResponse.json(
      { error: "Escribe tu nombre completo." },
      { status: 400 }
    );
  }
  if (!Number.isInteger(personasNum) || personasNum < 1 || personasNum > 20) {
    return NextResponse.json(
      { error: "El número de personas debe ser entre 1 y 20." },
      { status: 400 }
    );
  }
  if (!telefonoLimpio || telefonoLimpio.length < 7 || telefonoLimpio.length > 20) {
    return NextResponse.json(
      { error: "Escribe un teléfono válido." },
      { status: 400 }
    );
  }

  try {
    const db = sql();
    await db`
      CREATE TABLE IF NOT EXISTS rsvps (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        personas INTEGER NOT NULL,
        telefono TEXT NOT NULL,
        creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await db`
      INSERT INTO rsvps (nombre, personas, telefono)
      VALUES (${nombreLimpio}, ${personasNum}, ${telefonoLimpio})
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error guardando RSVP:", err);
    return NextResponse.json(
      { error: "No se pudo guardar tu confirmación. Intenta de nuevo en un momento." },
      { status: 500 }
    );
  }
}
