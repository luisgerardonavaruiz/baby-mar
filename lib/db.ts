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
 * "rsvps" de la versión anterior, intenta migrar esas confirmaciones para
 * no perder datos. Es tolerante a que "rsvps" tenga columnas distintas a
 * las esperadas (por ejemplo, si le falta "telefono", "personas" o
 * "creado_en") — migra lo que sí exista y deja lo demás en NULL / la
 * fecha actual.
 *
 * Segura para llamar en cada request: sólo hace trabajo real una vez por
 * instancia tibia del servidor (schemaEnsured), sólo migra una vez
 * (mientras "invitados" esté vacía), y si la migración falla por
 * cualquier motivo, no rompe el resto de la app — sólo se salta y queda
 * registrado en los logs. Los datos viejos siguen intactos en "rsvps".
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

  try {
    const yaHayInvitados = await db`SELECT EXISTS (SELECT 1 FROM invitados) AS existe`;
    if (!yaHayInvitados[0]?.existe) {
      await migrarDesdeRsvpsSiExiste(db);
    }
  } catch (err) {
    console.error("No se pudo migrar datos de 'rsvps' a 'invitados':", err);
  }

  schemaEnsured = true;
}

async function migrarDesdeRsvpsSiExiste(db: NeonQueryFunction<false, false>) {
  const rsvpsExiste = await db`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = 'rsvps'
    ) AS existe
  `;
  if (!rsvpsExiste[0]?.existe) return;

  const columnas = await db`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'rsvps'
  `;
  const disponibles = new Set(columnas.map((c) => c.column_name as string));

  if (!disponibles.has("nombre")) {
    console.warn("La tabla 'rsvps' no tiene columna 'nombre'; no se migró nada.");
    return;
  }

  // Sólo referenciamos nombres de columna de esta lista fija (nunca datos
  // del usuario), así que es seguro armar el SQL como texto.
  const personasExpr = disponibles.has("personas") ? "personas" : "NULL";
  const telefonoExpr = disponibles.has("telefono") ? "telefono" : "NULL";
  const creadoExpr = disponibles.has("creado_en") ? "creado_en" : "now()";

  const query = `
    INSERT INTO invitados (nombre, estado, personas, telefono, creado_en, actualizado_en)
    SELECT nombre, 'confirmado', ${personasExpr}, ${telefonoExpr}, ${creadoExpr}, ${creadoExpr}
    FROM rsvps
  `;
  await db.query(query);
}
