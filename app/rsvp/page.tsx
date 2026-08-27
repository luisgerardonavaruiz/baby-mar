"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";

type Invitado = {
  id: number;
  nombre: string;
  estado: "pendiente" | "confirmado" | "no_asiste";
};

type Status = "idle" | "loading" | "success" | "error";

function normaliza(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function RsvpPage() {
  const [invitados, setInvitados] = useState<Invitado[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<Invitado | null>(null);

  const [estado, setEstado] = useState<"confirmado" | "no_asiste">("confirmado");
  const [personas, setPersonas] = useState("1");
  const [telefono, setTelefono] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [nombreConfirmado, setNombreConfirmado] = useState("");

  useEffect(() => {
    fetch("/api/invitados")
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.error || "Error al cargar la lista.");
        setInvitados(data.invitados);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Error al cargar."));
  }, []);

  const resultados = useMemo(() => {
    if (!invitados) return [];
    const q = normaliza(busqueda.trim());
    if (!q) return invitados;
    return invitados.filter((inv) => normaliza(inv.nombre).includes(q));
  }, [invitados, busqueda]);

  function elegir(inv: Invitado) {
    setSeleccionado(inv);
    setEstado(inv.estado === "no_asiste" ? "no_asiste" : "confirmado");
    setStatus("idle");
    setErrorMsg("");
  }

  function cambiarPersona() {
    setSeleccionado(null);
    setBusqueda("");
    setStatus("idle");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!seleccionado) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitado_id: seleccionado.id,
          estado,
          personas: estado === "confirmado" ? Number(personas) : undefined,
          telefono,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Ocurrió un error. Intenta de nuevo.");
      setNombreConfirmado(data.nombre || seleccionado.nombre);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Ocurrió un error.");
    }
  }

  // --- Pantalla de éxito ---
  if (status === "success") {
    const asiste = estado === "confirmado";
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-blue-pale px-6 py-16 text-center">
        <div className="w-40 sm:w-48">
          <Image
            src="/oso.png"
            alt="Osito de peluche en globo aerostático"
            width={1023}
            height={1537}
            className="w-full h-auto"
          />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-blue-deep">
          {asiste ? "¡Gracias por confirmar!" : "Gracias por avisarnos"}
        </h1>
        <p className="mt-2 max-w-sm text-ink/70">
          {asiste ? (
            <>
              Quedó anotada la asistencia de <strong>{nombreConfirmado}</strong> al
              Baby Shower de Gerardo. Nos vemos el 29 de agosto a las 3:00 PM. 🩵
            </>
          ) : (
            <>
              Lamentamos que <strong>{nombreConfirmado}</strong> no pueda
              acompañarnos. ¡Gracias por hacérnoslo saber!
            </>
          )}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={cambiarPersona}
            className="rounded-full border-2 border-blue-deep px-6 py-3 font-semibold text-blue-deep transition hover:bg-white"
          >
            Responder por alguien más
          </button>
          <Link
            href="/"
            className="rounded-full bg-blue-deep px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#325A7D]"
          >
            Volver a la invitación
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-blue-pale px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-blue-deep/70 hover:text-blue-deep">
          ← Volver a la invitación
        </Link>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-blue-deep">
          Confirma tu asistencia
        </h1>
        <p className="mt-2 text-ink/70">
          Busca y selecciona tu nombre de la lista para responder.
        </p>

        {loadError && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {loadError}
          </p>
        )}

        {/* --- Paso 1: buscar y elegir nombre --- */}
        {!seleccionado && (
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <label htmlFor="busqueda" className="block text-sm font-semibold text-ink/80">
              Tu nombre
            </label>
            <input
              id="busqueda"
              type="text"
              autoFocus
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Empieza a escribir..."
              className="mt-1.5 w-full rounded-xl border border-blue-soft/50 px-4 py-2.5 outline-none focus:border-blue-deep"
            />

            <ul className="mt-4 max-h-72 space-y-1.5 overflow-y-auto">
              {invitados === null && !loadError && (
                <li className="py-4 text-center text-sm text-ink/40">Cargando lista…</li>
              )}
              {invitados !== null && resultados.length === 0 && (
                <li className="py-4 text-center text-sm text-ink/40">
                  No encontramos ese nombre. Revisa cómo lo escribiste, o contacta a la
                  mamá si crees que falta en la lista.
                </li>
              )}
              {resultados.map((inv) => (
                <li key={inv.id}>
                  <button
                    type="button"
                    onClick={() => elegir(inv)}
                    className="flex w-full items-center justify-between rounded-xl border border-blue-soft/40 px-4 py-3 text-left transition hover:border-blue-deep hover:bg-blue-pale"
                  >
                    <span className="font-medium text-ink">{inv.nombre}</span>
                    {inv.estado === "confirmado" && (
                      <span className="text-xs font-semibold text-green-700">
                        Ya confirmó ✓
                      </span>
                    )}
                    {inv.estado === "no_asiste" && (
                      <span className="text-xs font-semibold text-ink/40">
                        No asiste
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- Paso 2: responder --- */}
        {seleccionado && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5 rounded-3xl bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-xl font-semibold text-blue-deep">
                {seleccionado.nombre}
              </p>
              <button
                type="button"
                onClick={cambiarPersona}
                className="text-xs font-semibold text-blue-deep/60 hover:text-blue-deep"
              >
                No soy yo, cambiar
              </button>
            </div>

            {seleccionado.estado !== "pendiente" && (
              <p className="rounded-lg bg-blue-pale px-3 py-2 text-xs text-ink/60">
                Ya habías respondido antes. Puedes actualizar tu respuesta si algo
                cambió.
              </p>
            )}

            <fieldset>
              <legend className="text-sm font-semibold text-ink/80">
                ¿Podrás acompañarnos?
              </legend>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label
                  className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition ${
                    estado === "confirmado"
                      ? "border-blue-deep bg-blue-pale text-blue-deep"
                      : "border-blue-soft/40 text-ink/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="estado"
                    value="confirmado"
                    checked={estado === "confirmado"}
                    onChange={() => setEstado("confirmado")}
                    className="sr-only"
                  />
                  Sí, ahí estaré 🎉
                </label>
                <label
                  className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition ${
                    estado === "no_asiste"
                      ? "border-blue-deep bg-blue-pale text-blue-deep"
                      : "border-blue-soft/40 text-ink/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="estado"
                    value="no_asiste"
                    checked={estado === "no_asiste"}
                    onChange={() => setEstado("no_asiste")}
                    className="sr-only"
                  />
                  No podré asistir 💙
                </label>
              </div>
            </fieldset>

            {estado === "confirmado" && (
              <div>
                <label htmlFor="personas" className="block text-sm font-semibold text-ink/80">
                  Número de personas que asistirán
                </label>
                <input
                  id="personas"
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={personas}
                  onChange={(e) => setPersonas(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-blue-soft/50 px-4 py-2.5 outline-none focus:border-blue-deep"
                />
              </div>
            )}

            <div>
              <label htmlFor="telefono" className="block text-sm font-semibold text-ink/80">
                Teléfono
              </label>
              <input
                id="telefono"
                type="tel"
                required
                minLength={7}
                maxLength={20}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 771 123 4567"
                className="mt-1.5 w-full rounded-xl border border-blue-soft/50 px-4 py-2.5 outline-none focus:border-blue-deep"
              />
            </div>

            {status === "error" && (
              <p role="alert" className="text-sm text-red-600">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-blue-deep px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#325A7D] disabled:opacity-60"
            >
              {status === "loading" ? "Guardando..." : "Guardar respuesta"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
