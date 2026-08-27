import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

/**
 * Lista pública de invitados (sólo id, nombre y estado) para que cada
 * persona pueda encontrar y seleccionar su nombre en /rsvp.
 * No expone teléfono ni número de personas de otros invitados.
 */
export async function GET() {
  try {
    await ensureSchema();
    const db = sql();
    const rows = await db`
      SELECT id, nombre, estado
      FROM invitados
      ORDER BY nombre ASC
    `;
    return NextResponse.json({ ok: true, invitados: rows });
  } catch (err) {
    console.error("Error listando invitados:", err);
    return NextResponse.json(
      { error: "No se pudo cargar la lista de invitados." },
      { status: 500 }
    );
  }
}
