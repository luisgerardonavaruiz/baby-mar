import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";

function unauthorized() {
  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}

function isAuthed(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

/** Lista completa (con teléfono) para la mamá. */
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return unauthorized();

  try {
    await ensureSchema();
    const db = sql();
    const rows = await db`
      SELECT id, nombre, estado, personas, creado_en, actualizado_en
      FROM invitados
      ORDER BY nombre ASC
    `;
    return NextResponse.json({ ok: true, invitados: rows });
  } catch (err) {
    console.error("Error listando invitados (admin):", err);
    return NextResponse.json(
      { error: "No se pudo cargar la lista." },
      { status: 500 }
    );
  }
}

/** Agrega uno o varios invitados nuevos. Body: { nombres: string[] } */
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { nombres } = (body ?? {}) as { nombres?: unknown };
  if (!Array.isArray(nombres)) {
    return NextResponse.json(
      { error: "Envía una lista de nombres." },
      { status: 400 }
    );
  }

  const limpios = nombres
    .map((n) => String(n ?? "").trim())
    .filter((n) => n.length > 0 && n.length <= 120)
    .slice(0, 300); // límite razonable por lote

  if (limpios.length === 0) {
    return NextResponse.json(
      { error: "No se encontraron nombres válidos." },
      { status: 400 }
    );
  }

  try {
    await ensureSchema();
    const db = sql();
    for (const nombre of limpios) {
      await db`INSERT INTO invitados (nombre) VALUES (${nombre})`;
    }
    return NextResponse.json({ ok: true, agregados: limpios.length });
  } catch (err) {
    console.error("Error agregando invitados:", err);
    return NextResponse.json(
      { error: "No se pudieron agregar los invitados." },
      { status: 500 }
    );
  }
}

/** Elimina un invitado. Body: { id: number } */
export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { id } = (body ?? {}) as { id?: number | string };
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    await ensureSchema();
    const db = sql();
    await db`DELETE FROM invitados WHERE id = ${idNum}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error eliminando invitado:", err);
    return NextResponse.json(
      { error: "No se pudo eliminar." },
      { status: 500 }
    );
  }
}
