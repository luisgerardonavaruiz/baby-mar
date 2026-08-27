import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let cachedClient: NeonQueryFunction<false, false> | null = null;
let schemaEnsured = false;

/**
 * Devuelve un cliente SQL de Neon. Requiere la variable de entorno
 * DATABASE_URL (la que te da Neon, con "?sslmode=require").
 */
export function sql() {
  if (cachedClient) return cachedClient;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL. Configúrala en .env.local o en Vercel."
    );
  }
  cachedClient = neon(url);
  return cachedClient;
}

/**
 * Crea la tabla "invitados" si no existe todavía, y si detecta la tabla
 * "rsvps" de la versión anterior de la app (formulario libre, sin lista
 * de invitados), migra esas confirmaciones para no perder datos.
 * Segura para llamar en cada request: sólo hace trabajo real una vez por
 * instancia tibia del servidor (schemaEnsured) y sólo migra una vez
 * (mientras "invitados" esté vacía).
 */
export async function ensureSchema() {
  if (schemaEnsured) return;
  const db = sql();

  await db`
    CREATE TABLE IF NOT EXISTS invitados (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'confirmado', 'no_asiste')),
      personas INTEGER CHECK (personas IS NULL OR (personas > 0 AND personas <= 20)),
      telefono TEXT,
      creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
      actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  const yaHayInvitados = await db`SELECT EXISTS (SELECT 1 FROM invitados) AS existe`;
  if (!yaHayInvitados[0]?.existe) {
    const rsvpsExiste = await db`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'rsvps'
      ) AS existe
    `;
    if (rsvpsExiste[0]?.existe) {
      // Trae quienes ya habían confirmado con el formulario libre de la
      // versión anterior y los agrega como "confirmado" en la nueva lista.
      await db`
        INSERT INTO invitados (nombre, estado, personas, telefono, creado_en, actualizado_en)
        SELECT nombre, 'confirmado', personas, telefono, creado_en, creado_en
        FROM rsvps
      `;
    }
  }

  schemaEnsured = true;
}
