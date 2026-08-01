import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "gerardo_admin_session";

function secret() {
  // Usa un secreto dedicado si existe; si no, cae en ADMIN_PASSWORD.
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "gerardo-fallback-secret";
}

/** Crea un token de sesión firmado (no expira sólo por lógica del cookie maxAge). */
export function createSessionToken(): string {
  const payload = "admin";
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/** Verifica que el token de sesión sea válido. */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkPassword(candidate: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  if (candidate.length !== real.length) {
    // Igual comparamos con timingSafeEqual sobre buffers del mismo largo posible
    return candidate === real;
  }
  try {
    return timingSafeEqual(Buffer.from(candidate), Buffer.from(real));
  } catch {
    return candidate === real;
  }
}
