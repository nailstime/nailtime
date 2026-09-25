// A soft botanical shadow silhouette. Pure SVG, blurred and swayed by CSS.
export function LeafShadow({ className }: { className?: string }) {
  const leaves = Array.from({ length: 14 }, (_, i) => {
    const t = i / 13
    const side = i % 2 === 0 ? 1 : -1
    return {
      x: 520 - t * 360,
      y: 60 + t * 420,
      r: side * (38 + t * 12) - 90 * t,
      s: 1 - t * 0.35,
    }
  })
  return (
    <svg className={className} viewBox="0 0 600 600" aria-hidden="true">
      <g fill="#6d5a45" fillOpacity="0.55">
        <path d="M560 20 C 460 160, 330 330, 150 560" stroke="#6d5a45" strokeOpacity="0.5" strokeWidth="5" fill="none" />
        {leaves.map((l, i) => (
          <ellipse
            key={i}
            cx={0}
            cy={0}
            rx={62}
            ry={20}
            transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s}) translate(${i % 2 === 0 ? 50 : -50} 0)`}
          />
        ))}
      </g>
    </svg>
  )
}
