import { useMemo } from 'react'

interface Star {
  id: number
  top: number
  left: number
  size: number
  opacity: number
  driftX: number
  driftY: number
  driftDuration: number
  driftDelay: number
}

function generateStars(count: number): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() < 0.7 ? 1 : 2,
      opacity: 0.12 + Math.random() * 0.16,
      driftX: (Math.random() - 0.5) * 30,
      driftY: (Math.random() - 0.5) * 30,
      driftDuration: 8 + Math.random() * 8,
      driftDelay: -Math.random() * 8,
    })
  }
  return stars
}

export function StarField() {
  const stars = useMemo(() => generateStars(60), [])

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `star-drift-${s.id} ${s.driftDuration}s ease-in-out ${s.driftDelay}s infinite alternate`,
          }}
        />
      ))}
      <style>{stars
        .map(
          (s) => `@keyframes star-drift-${s.id} {
            from { transform: translate(0,0); }
            to { transform: translate(${s.driftX}px, ${s.driftY}px); }
          }`,
        )
        .join('\n')}</style>
    </div>
  )
}
