"use client";

import { useEffect, useState } from "react";

const EVENT_DATE = new Date("2026-08-29T15:00:00-06:00").getTime();

function getRemaining() {
  const diff = EVENT_DATE - Date.now();
  const clamped = Math.max(diff, 0);
  return {
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    done: diff <= 0,
  };
}

export default function Countdown() {
  const [remaining, setRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    done: boolean;
  } | null>(null);

  useEffect(() => {
    // Se calcula en el cliente (no en el render del servidor) para evitar
    // desajustes de hidratación, ya que depende de la hora actual.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(getRemaining());
    const id = setInterval(() => setRemaining(getRemaining()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!remaining) {
    // Evita parpadeo de hidratación: no renderiza números hasta montar en cliente.
    return <div className="h-[74px]" aria-hidden="true" />;
  }

  if (remaining.done) {
    return (
      <p className="font-script text-2xl text-blue-deep">
        ¡Hoy es el gran día! 🎈
      </p>
    );
  }

  const items = [
    { label: remaining.days === 1 ? "día" : "días", value: remaining.days },
    { label: remaining.hours === 1 ? "hora" : "horas", value: remaining.hours },
    { label: remaining.minutes === 1 ? "min" : "min", value: remaining.minutes },
  ];

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6" role="timer" aria-live="polite">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <span className="font-display text-3xl sm:text-4xl font-semibold text-blue-deep tabular-nums">
            {item.value}
          </span>
          <span className="text-xs sm:text-sm uppercase tracking-wide text-ink/60">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
