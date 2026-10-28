export default function Pokeball({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`pointer-events-none ${className}`} fill="none">
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="10" />
      <path d="M6 50h28M66 50h28" stroke="currentColor" strokeWidth="10" />
      <circle cx="50" cy="50" r="13" stroke="currentColor" strokeWidth="10" />
    </svg>
  )
}