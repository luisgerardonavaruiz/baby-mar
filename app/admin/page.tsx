"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Invitado = {
  id: number;
  nombre: string;
  estado: "pendiente" | "confirmado" | "no_asiste";
  personas: number | null;
  telefono: string | null;
  creado_en: string;
  actualizado_en: string;
};

const ESTADO_LABEL: Record<Invitado["estado"], string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmó",
  no_asiste: "No asiste",
};

const ESTADO_STYLE: Record<Invitado["estado"], string> = {
  pendiente: "bg-ink/10 text-ink/60",
  confirmado: "bg-green-100 text-green-700",
  no_asiste: "bg-red-100 text-red-700",
};

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [nuevosNombres, setNuevosNombres] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [agregarError, setAgregarError] = useState("");

  async function loadInvitados() {
    setLoadError("");
    try {
      const res = await fetch("/api/admin/invitados", { cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cargar.");
      setInvitados(data.invitados ?? []);
      setAuthed(true);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Error al cargar.");
    } finally {
      setAuthChecked(true);
    }
  }

  useEffect(() => {
    // Carga inicial de datos desde la API al montar la página.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvitados();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Contraseña incorrecta.");
      setPassword("");
      await loadInvitados();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Contraseña incorrecta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setInvitados([]);
  }

  async function handleAgregar(e: React.FormEvent) {
    e.preventDefault();
    setAgregando(true);
    setAgregarError("");
    const nombres = nuevosNombres
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    if (nombres.length === 0) {
      setAgregarError("Escribe al menos un nombre.");
      setAgregando(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/invitados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombres }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo agregar.");
      setNuevosNombres("");
      await loadInvitados();
    } catch (err) {
      setAgregarError(err instanceof Error ? err.message : "No se pudo agregar.");
    } finally {
      setAgregando(false);
    }
  }

  async function handleEliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar a "${nombre}" de la lista?`)) return;
    try {
      const res = await fetch("/api/admin/invitados", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo eliminar.");
      setInvitados((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar.");
    }
  }

  if (!authChecked) {
    return (
      <main className="flex-1 flex items-center justify-center bg-cream px-6 py-16">
        <p className="text-ink/50">Cargando…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="flex-1 flex items-center justify-center bg-blue-pale px-6 py-16">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm"
        >
          <h1 className="font-display text-2xl font-bold text-blue-deep">
            Acceso para mamá 🩵
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Ingresa la contraseña para administrar la lista de invitados.
          </p>
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="mt-5 w-full rounded-xl border border-blue-soft/50 px-4 py-2.5 outline-none focus:border-blue-deep"
          />
          {loginError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {loginError}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-full bg-blue-deep px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#325A7D] disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <Link
            href="/"
            className="mt-4 block text-center text-sm text-blue-deep/70 hover:text-blue-deep"
          >
            ← Volver a la invitación
          </Link>
        </form>
      </main>
    );
  }

  const confirmados = invitados.filter((i) => i.estado === "confirmado");
  const noAsisten = invitados.filter((i) => i.estado === "no_asiste");
  const pendientes = invitados.filter((i) => i.estado === "pendiente");
  const totalPersonas = confirmados.reduce((sum, i) => sum + (i.personas ?? 0), 0);

  return (
    <main className="flex-1 bg-cream px-6 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-deep">
            Lista de invitados
          </h1>
          <button
            onClick={handleLogout}
            className="rounded-full border border-blue-deep/30 px-4 py-2 text-sm font-semibold text-blue-deep hover:bg-blue-pale"
          >
            Salir
          </button>
        </div>

        {/* Resumen */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Invitados" value={invitados.length} />
          <Stat label="Confirmaron" value={confirmados.length} tone="text-green-700" />
          <Stat label="No asisten" value={noAsisten.length} tone="text-red-700" />
          <Stat label="Personas (confirmadas)" value={totalPersonas} tone="text-blue-deep" />
        </div>
        {pendientes.length > 0 && (
          <p className="mt-2 text-xs text-ink/50">
            {pendientes.length} {pendientes.length === 1 ? "invitado no ha" : "invitados no han"}{" "}
            respondido todavía.
          </p>
        )}

        {/* Agregar invitados */}
        <form
          onSubmit={handleAgregar}
          className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
        >
          <label htmlFor="nuevosNombres" className="block text-sm font-semibold text-ink/80">
            Agregar invitados a la lista
          </label>
          <p className="text-xs text-ink/50">Un nombre por línea.</p>
          <textarea
            id="nuevosNombres"
            value={nuevosNombres}
            onChange={(e) => setNuevosNombres(e.target.value)}
            rows={4}
            placeholder={"María López\nJuan Pérez\nFamilia Hernández"}
            className="mt-2 w-full rounded-xl border border-blue-soft/50 px-4 py-2.5 outline-none focus:border-blue-deep"
          />
          {agregarError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {agregarError}
            </p>
          )}
          <button
            type="submit"
            disabled={agregando}
            className="mt-3 rounded-full bg-blue-deep px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#325A7D] disabled:opacity-60"
          >
            {agregando ? "Agregando..." : "Agregar a la lista"}
          </button>
        </form>

        {loadError && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {loadError}
          </p>
        )}

        {/* Tabla */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          {invitados.length === 0 ? (
            <p className="p-8 text-center text-ink/50">
              Todavía no has agregado invitados. Usa el formulario de arriba
              para empezar tu lista.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-blue-pale text-blue-deep">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Personas</th>
                    <th className="px-4 py-3 font-semibold">Teléfono</th>
                    <th className="px-4 py-3 font-semibold">Actualizado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {invitados.map((inv, i) => (
                    <tr key={inv.id} className={i % 2 === 0 ? "bg-white" : "bg-blue-pale/30"}>
                      <td className="px-4 py-3 font-medium">{inv.nombre}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_STYLE[inv.estado]}`}
                        >
                          {ESTADO_LABEL[inv.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-3">{inv.personas ?? "—"}</td>
                      <td className="px-4 py-3">{inv.telefono ?? "—"}</td>
                      <td className="px-4 py-3 text-ink/60">
                        {inv.estado === "pendiente"
                          ? "—"
                          : new Date(inv.actualizado_en).toLocaleString("es-MX", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEliminar(inv.id, inv.nombre)}
                          className="text-xs font-semibold text-red-600/70 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="mt-6 inline-block text-sm text-blue-deep/70 hover:text-blue-deep"
        >
          ← Volver a la invitación
        </Link>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-4 text-center shadow-sm">
      <p className={`font-display text-2xl font-bold ${tone ?? "text-ink"}`}>{value}</p>
      <p className="text-xs text-ink/50">{label}</p>
    </div>
  );
}
