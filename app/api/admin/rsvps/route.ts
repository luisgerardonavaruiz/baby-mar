import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth'
import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const db = sql()
    await db`
      CREATE TABLE IF NOT EXISTS rsvps (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        personas INTEGER NOT NULL,
        creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `
    const rows = await db`
      SELECT id, nombre, personas, creado_en
      FROM rsvps
      ORDER BY creado_en DESC
    `
    return NextResponse.json({ ok: true, rsvps: rows })
  } catch (err) {
    console.error('Error leyendo RSVPs:', err)
    return NextResponse.json(
      { error: 'No se pudieron cargar las confirmaciones.' },
      { status: 500 },
    )
  }
}
