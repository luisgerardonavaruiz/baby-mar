'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function RsvpPage() {
  const [nombre, setNombre] = useState('')
  const [personas, setPersonas] = useState('1')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          personas: Number(personas),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Ocurrió un error. Intenta de nuevo.')
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Ocurrió un error.')
    }
  }

  if (status === 'success') {
    return (
      <main className='flex-1 flex flex-col items-center justify-center bg-blue-pale px-6 py-16 text-center'>
        <div className='w-40 sm:w-48'>
          <Image
            src='/oso.png'
            alt='Osito de peluche en globo aerostático'
            width={1023}
            height={1537}
            className='w-full h-auto'
          />
        </div>
        <h1 className='mt-4 font-display text-3xl font-bold text-blue-deep'>
          ¡Gracias por confirmar!
        </h1>
        <p className='mt-2 max-w-sm text-ink/70'>
          Ya anotamos tu asistencia al Baby Shower de Gonzalo. Nos vemos el 29
          de agosto a las 3:00 PM. 🩵
        </p>
        <Link
          href='/'
          className='mt-8 rounded-full bg-blue-deep px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#325A7D]'
        >
          Volver a la invitación
        </Link>
      </main>
    )
  }

  return (
    <main className='flex-1 bg-blue-pale px-6 py-12 sm:py-16'>
      <div className='mx-auto max-w-md'>
        <Link
          href='/'
          className='text-sm text-blue-deep/70 hover:text-blue-deep'
        >
          ← Volver a la invitación
        </Link>

        <h1 className='mt-4 font-display text-3xl sm:text-4xl font-bold text-blue-deep'>
          Confirma tu asistencia
        </h1>
        <p className='mt-2 text-ink/70'>
          Nos dará mucho gusto contar contigo en el Baby Shower de Gonzalo.
        </p>

        <form
          onSubmit={handleSubmit}
          className='mt-8 space-y-5 rounded-3xl bg-white p-6 shadow-sm sm:p-8'
        >
          <div>
            <label
              htmlFor='nombre'
              className='block text-sm font-semibold text-ink/80'
            >
              Nombre completo
            </label>
            <input
              id='nombre'
              type='text'
              required
              maxLength={120}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder='Ej. María López'
              className='mt-1.5 w-full rounded-xl border border-blue-soft/50 px-4 py-2.5 outline-none focus:border-blue-deep'
            />
          </div>

          <div>
            <label
              htmlFor='personas'
              className='block text-sm font-semibold text-ink/80'
            >
              Número de personas que asistirán
            </label>
            <input
              id='personas'
              type='number'
              required
              min={1}
              max={20}
              value={personas}
              onChange={(e) => setPersonas(e.target.value)}
              className='mt-1.5 w-full rounded-xl border border-blue-soft/50 px-4 py-2.5 outline-none focus:border-blue-deep'
            />
          </div>

          {status === 'error' && (
            <p role='alert' className='text-sm text-red-600'>
              {errorMsg}
            </p>
          )}

          <button
            type='submit'
            disabled={status === 'loading'}
            className='w-full rounded-full bg-blue-deep px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#325A7D] disabled:opacity-60'
          >
            {status === 'loading' ? 'Enviando...' : 'Confirmar asistencia'}
          </button>
        </form>
      </div>
    </main>
  )
}
