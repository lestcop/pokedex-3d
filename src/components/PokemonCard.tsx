import { useQuery } from '@tanstack/react-query'
import { getPokemon } from '../api/pokemon'
import { TYPE_INFO, HABITAT_ES } from '../data/types'

const STAT: Record<string, string> = {
  hp: 'PS', attack: 'Atq', defense: 'Def',
  'special-attack': 'AtE', 'special-defense': 'DfE', speed: 'Vel',
}

type Props = { id: number; onClose: () => void; onNav: (id: number) => void }

export default function PokemonCard({ id, onClose, onNav }: Props) {
  const { data: p, isLoading } = useQuery({ queryKey: ['pokemon', id], queryFn: () => getPokemon(id) })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-10" onClick={onClose}>
      <div
  className="bg-white w-full md:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl p-4"
  onClick={e => e.stopPropagation()}
  style={p ? { background: `linear-gradient(${TYPE_INFO[p.types[0]].color}55, transparent 40%), white` } : undefined}
>
        {isLoading || !p ? <p>Cargando… ⏳</p> : (
          <>
            <div className="flex justify-between text-sm">
              <button onClick={onClose}>← Volver</button>
              <span className="text-slate-500">#{String(p.id).padStart(3, '0')}</span>
            </div>

            <img src={p.image} alt={p.name} className="w-48 mx-auto" />
            <h2 className="text-2xl font-bold capitalize text-center">
              {p.name} <button onClick={() => new Audio(p.cry).play()}>🔊</button>
            </h2>
            <p className="text-center text-slate-500">{p.genus}</p>
           <div className="flex gap-2 justify-center my-2">
  {p.types.map(t => (
    <span key={t} className="px-3 py-1 rounded-full text-white text-sm" style={{ background: TYPE_INFO[t].color }}>
      {TYPE_INFO[t].es}
    </span>
  ))}
</div>

            <p className="text-center text-sm">📏 {p.height} m · ⚖️ {p.weight} kg · 🌳 <span className="capitalize">{HABITAT_ES[p.habitat] ?? p.habitat}</span></p>
            <p className="my-3 italic text-sm">📖 {p.description}</p>

            <h3 className="font-semibold">📊 Stats</h3>
            {p.stats.map(s => (
              <div key={s.name} className="flex items-center gap-2 text-sm">
                <span className="w-10">{STAT[s.name]}</span>
                <span className="w-8 text-right">{s.value}</span>
                <div className="flex-1 h-2 bg-slate-200 rounded">
                  <div className="h-2 bg-red-500 rounded" style={{ width: `${Math.min(s.value, 150) / 1.5}%` }} />
                </div>
              </div>
            ))}

            <h3 className="font-semibold mt-3">✨ Habilidades</h3>
            <ul className="text-sm capitalize">
              {p.abilities.map(a => <li key={a.name}>{a.name.replace('-', ' ')} {a.hidden && '(oculta)'}</li>)}
            </ul>

            <div className="flex justify-between mt-4">
              <button disabled={p.id === 1} onClick={() => onNav(p.id - 1)} className="disabled:opacity-30">← #{p.id - 1}</button>
              <button disabled={p.id === 151} onClick={() => onNav(p.id + 1)} className="disabled:opacity-30">#{p.id + 1} →</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}