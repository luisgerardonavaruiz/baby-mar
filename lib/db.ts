import { neon } from "@neondatabase/serverless";

/**
 * Devuelve un cliente SQL de Neon. Requiere la variable de entorno
 * DATABASE_URL (la que te da Neon, con "?sslmode=require").
 */
export function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL. Configúrala en .env.local o en Vercel."
    );
  }
  return neon(url);
}
