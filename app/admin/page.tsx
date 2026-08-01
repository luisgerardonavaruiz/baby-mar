'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Rsvp = {
  id: number
  nombre: string
  personas: number
  telefono: string
  creado_en: string
}

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  async function loadRsvps() {
    setLoadError('')
    try {
      const res = await fetch('/api/admin/rsvps', { cache: 'no-store' })
      if (res.status === 401) {
        setAuthed(false)
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Error al cargar.')
      setRsvps(data.rsvps ?? [])
      setAuthed(true)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Error al cargar.')
    } finally {
      setAuthChecked(true)
    }
  }

  useEffect(() => {
    // Carga inicial de datos desde la API al montar la página.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRsvps()
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Contraseña incorrecta.')
      setPassword('')
      await loadRsvps()
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : 'Contraseña incorrecta.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthed(false)
    setRsvps([])
  }

  if (!authChecked) {
    return (
      <main className='flex-1 flex items-center justify-center bg-cream px-6 py-16'>
        <p className='text-ink/50'>Cargando…</p>
      </main>
    )
  }

  if (!authed) {
    return (
      <main className='flex-1 flex items-center justify-center bg-blue-pale px-6 py-16'>
        <form
          onSubmit={handleLogin}
          className='w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm'
        >
          <h1 className='font-display text-2xl font-bold text-blue-deep'>
            Acceso para mamá 🩵
          </h1>
          <p className='mt-1 text-sm text-ink/60'>
            Ingresa la contraseña para ver quiénes confirmaron su asistencia.
          </p>
          <input
            type='password'
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Contraseña'
            className='mt-5 w-full rounded-xl border border-blue-soft/50 px-4 py-2.5 outline-none focus:border-blue-deep'
          />
          {loginError && (
            <p role='alert' className='mt-2 text-sm text-red-600'>
              {loginError}
            </p>
          )}
          <button
            type='submit'
            disabled={loading}
            className='mt-5 w-full rounded-full bg-blue-deep px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#325A7D] disabled:opacity-60'
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <Link
            href='/'
            className='mt-4 block text-center text-sm text-blue-deep/70 hover:text-blue-deep'
          >
            ← Volver a la invitación
          </Link>
        </form>
      </main>
    )
  }

  const totalPersonas = rsvps.reduce((sum, r) => sum + r.personas, 0)

  return (
    <main className='flex-1 bg-cream px-6 py-10 sm:py-14'>
      <div className='mx-auto max-w-3xl'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='font-display text-2xl sm:text-3xl font-bold text-blue-deep'>
              Confirmaciones de asistencia
            </h1>
            <p className='text-sm text-ink/60'>
              {rsvps.length}{' '}
              {rsvps.length === 1 ? 'confirmación' : 'confirmaciones'} ·{' '}
              {totalPersonas} {totalPersonas === 1 ? 'persona' : 'personas'} en
              total
            </p>
          </div>
          <button
            onClick={handleLogout}
            className='rounded-full border border-blue-deep/30 px-4 py-2 text-sm font-semibold text-blue-deep hover:bg-blue-pale'
          >
            Salir
          </button>
        </div>

        {loadError && (
          <p role='alert' className='mt-4 text-sm text-red-600'>
            {loadError}
          </p>
        )}

        <div className='mt-6 overflow-hidden rounded-2xl bg-white shadow-sm'>
          {rsvps.length === 0 ? (
            <p className='p-8 text-center text-ink/50'>
              Todavía no hay confirmaciones. Cuando alguien confirme, aparecerá
              aquí.
            </p>
          ) : (
            <table className='w-full text-left text-sm'>
              <thead className='bg-blue-pale text-blue-deep'>
                <tr>
                  <th className='px-4 py-3 font-semibold'>Nombre</th>
                  <th className='px-4 py-3 font-semibold'>Personas</th>
                  <th className='px-4 py-3 font-semibold'>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r, i) => (
                  <tr
                    key={r.id}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-blue-pale/30'}
                  >
                    <td className='px-4 py-3'>{r.nombre}</td>
                    <td className='px-4 py-3'>{r.personas}</td>
                    <td className='px-4 py-3 text-ink/60'>
                      {new Date(r.creado_en).toLocaleString('es-MX', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Link
          href='/'
          className='mt-6 inline-block text-sm text-blue-deep/70 hover:text-blue-deep'
        >
          ← Volver a la invitación
        </Link>
      </div>
    </main>
  )
}
