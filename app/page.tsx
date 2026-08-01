import Countdown from '@/components/Countdown'
import FloatingBalloons from '@/components/FloatingBalloons'
import Image from 'next/image'
import Link from 'next/link'

// Enlace directo a la ubicación (Quinta Alejandra, Pachuca de Soto, Hgo.)
const MAPS_URL = 'https://maps.app.goo.gl/1weRLRdwu9gisvHw7'

export default function Home() {
  return (
    <main className='flex-1 bg-cream'>
      {/* HERO */}
      <section className='relative overflow-hidden bg-gradient-to-b from-blue-pale via-cream to-cream px-6 pt-14 pb-10 sm:pt-20 sm:pb-14'>
        <FloatingBalloons />

        <div className='relative mx-auto flex max-w-2xl flex-col items-center text-center'>
          <p className='font-script text-3xl sm:text-4xl text-blue-deep'>
            Con la alegría en el corazón, te invitamos a celebrar juntos una
            nueva vida que nace.
          </p>

          <div className='mt-4 w-full max-w-[300px] sm:max-w-[360px]'>
            <Image
              src='/oso.png'
              alt='Osito de peluche viajando en globo aerostático de globos azules y color caramelo'
              width={1023}
              height={1537}
              priority
              className='animate-drift w-full h-auto drop-shadow-xl'
            />
          </div>

          <h1 className='font-display italic text-6xl sm:text-7xl font-black tracking-tight text-blue-deep -mt-2'>
            Gonzalo
          </h1>
          <p className='mt-3 font-body text-base sm:text-lg text-ink/80 max-w-sm'>
            Estamos felices de esperarlo y queremos que seas parte de esta
            celebración. ¡Acompáñanos en su Baby Shower!
          </p>

          <div className='mt-8 rounded-2xl bg-white/70 backdrop-blur-sm px-6 py-4 shadow-sm'>
            <Countdown />
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className='px-6 py-12 sm:py-16'>
        <div className='mx-auto grid max-w-3xl gap-5 sm:grid-cols-3'>
          <DetailCard
            icon='📅'
            label='Fecha'
            value='Sábado 29 de agosto'
            sub='2026'
          />
          <DetailCard
            icon='🕒'
            label='Hora'
            value='3:00 PM'
            sub='Puntualidad apreciada'
          />
          <DetailCard
            icon='📍'
            label='Lugar'
            value='Quinta Alejandra'
            sub='Pachuca de Soto, Hgo.'
          />
        </div>

        <div className='mx-auto mt-10 max-w-xl rounded-3xl border border-blue-soft/40 bg-white px-6 py-7 text-center shadow-sm sm:px-10'>
          <p className='font-display font-medium italic text-xl text-blue-deep'>
            &ldquo;Tu presencia es el mejor regalo que podemos recibir.&rdquo;
          </p>
          <p className='mt-3 text-sm text-ink/60'>
            Lo más importante para nosotros es compartir este día contigo, lleno
            de cariño, risas y buenos momentos.
          </p>
          <p className='mt-3 text-sm text-ink/60'>
            ¡Gracias por ser parte de esta celebración! 🩵
          </p>
        </div>
      </section>

      {/* ACTIONS */}
      <section className='px-6 pb-16'>
        <div className='mx-auto flex max-w-md flex-col gap-4 sm:flex-row sm:justify-center'>
          <a
            href={MAPS_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='flex-1 rounded-full border-2 border-blue-deep px-6 py-3.5 text-center font-body font-semibold text-blue-deep transition hover:bg-blue-pale'
          >
            Ver ubicación
          </a>
          <Link
            href='/rsvp'
            className='flex-1 rounded-full bg-blue-deep px-6 py-3.5 text-center font-body font-semibold text-white shadow-md transition hover:bg-[#325A7D]'
          >
            Confirmar asistencia
          </Link>
        </div>
      </section>

      <footer className='border-t border-blue-soft/30 py-6 text-center'>
        <p className='text-xs text-ink/40'>
          Con mucho cariño, te invitamos a compartir con nosotros este día tan
          especial.
        </p>
        <p className='text-xs text-ink/40'>
          Será un momento lleno de amor, alegría y lindos recuerdos. 🩵
        </p>
      </footer>
    </main>
  )
}

function DetailCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string
  label: string
  value: string
  sub: string
}) {
  return (
    <div className='rounded-2xl bg-white px-5 py-6 text-center shadow-sm ring-1 ring-blue-soft/20'>
      <div className='text-3xl'>{icon}</div>
      <p className='mt-2 text-xs font-semibold uppercase tracking-wide text-blue-deep/70'>
        {label}
      </p>
      <p className='mt-1 font-display text-xl font-semibold text-ink'>
        {value}
      </p>
      <p className='text-sm text-ink/50'>{sub}</p>
    </div>
  )
}
