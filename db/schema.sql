-- Ejecuta esto una vez en Neon (SQL editor) si quieres crear la tabla manualmente.
-- Nota: la app también la crea sola automáticamente en el primer uso (CREATE TABLE IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS rsvps (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  personas INTEGER NOT NULL CHECK (personas > 0 AND personas <= 20),
  telefono TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
