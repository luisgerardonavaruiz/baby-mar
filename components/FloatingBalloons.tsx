const DOTS = [
  { left: "6%", size: 22, color: "var(--blue-soft)", dur: "9s", delay: "0s", opacity: 0.55 },
  { left: "14%", size: 14, color: "var(--caramel-light)", dur: "7s", delay: "1.2s", opacity: 0.5 },
  { left: "22%", size: 30, color: "var(--blue)", dur: "11s", delay: "0.4s", opacity: 0.35 },
  { left: "80%", size: 26, color: "var(--caramel)", dur: "8.5s", delay: "2s", opacity: 0.4 },
  { left: "88%", size: 16, color: "var(--blue-soft)", dur: "6.5s", delay: "0.8s", opacity: 0.55 },
  { left: "70%", size: 20, color: "var(--blue-soft)", dur: "10s", delay: "3s", opacity: 0.4 },
  { left: "50%", size: 12, color: "var(--caramel-light)", dur: "7.5s", delay: "1.6s", opacity: 0.5 },
  { left: "92%", size: 24, color: "var(--blue)", dur: "9.5s", delay: "2.6s", opacity: 0.3 },
];

/** Puntos decorativos que flotan suavemente, como globos de fondo. Puramente decorativo. */
export default function FloatingBalloons() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {DOTS.map((dot, i) => (
        <span
          key={i}
          className="animate-float-up absolute bottom-0 rounded-full"
          style={{
            left: dot.left,
            width: dot.size,
            height: dot.size,
            background: dot.color,
            // @ts-expect-error CSS custom properties
            "--dur": dot.dur,
            "--dot-opacity": dot.opacity,
            animationDelay: dot.delay,
          }}
        />
      ))}
    </div>
  );
}
