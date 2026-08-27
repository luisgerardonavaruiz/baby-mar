-- Ejecuta esto una vez en Neon (SQL editor) si quieres crear la tabla manualmente.
-- Nota: la app también la crea sola automáticamente en el primer uso (CREATE TABLE IF NOT EXISTS),
-- y si detecta la tabla "rsvps" de la versión anterior, migra esas confirmaciones automáticamente.
CREATE TABLE IF NOT EXISTS invitados (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'confirmado', 'no_asiste')),
  personas INTEGER CHECK (personas IS NULL OR (personas > 0 AND personas <= 20)),
  telefono TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migración manual opcional (la app ya la hace sola, esto es sólo por si
-- prefieres correrla tú mismo en el SQL Editor de Neon):
-- INSERT INTO invitados (nombre, estado, personas, telefono, creado_en, actualizado_en)
-- SELECT nombre, 'confirmado', personas, telefono, creado_en, creado_en FROM rsvps;
