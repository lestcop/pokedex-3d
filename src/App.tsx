import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getGen1, getIdsByType, TYPES } from './api/pokemon'
import PokemonCard from './components/PokemonCard'
import World from './components/World'

export default function App() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [world, setWorld] = useState(false)

  const { data, isLoading, error } = useQuery({ queryKey: ['gen1'], queryFn: getGen1 })
  const { data: typeIds } = useQuery({
    queryKey: ['type', type],
    queryFn: () => getIdsByType(type!),
    enabled: !!type,
  })

  if (world) return <World onExit={() => setWorld(false)} />
  if (isLoading) return <p className="p-4">Cargando… ⏳</p>
  if (error) return <p className="p-4 text-red-500">{error.message}</p>

  const q = search.trim().toLowerCase()
  const list = data!
    .filter(p => p.name.includes(q) || String(p.id) === q.replace('#', '').replace(/^0+/, ''))
    .filter(p => !type || typeIds?.has(p.id))

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">🔴 Pokédex 3D</h1>
        <button onClick={() => setWorld(true)} className="rounded-full bg-red-500 text-white px-4 py-2 text-sm">
          🗺️ Explorar
        </button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Buscar por nombre o #"
        className="w-full mb-3 rounded-xl border px-3 py-2"
      />

      <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
        <button onClick={() => setType(null)} className={`px-3 py-1 rounded-full border ${!type ? 'bg-red-500 text-white' : ''}`}>Todos</button>
        {TYPES.map(t => (
          <button key={t} onClick={() => setType(t)} className={`px-3 py-1 rounded-full border capitalize whitespace-nowrap ${type === t ? 'bg-red-500 text-white' : ''}`}>{t}</button>
        ))}
      </div>

      <ul className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {list.map(p => (
          <li key={p.id} onClick={() => setSelected(p.id)} className="cursor-pointer rounded-xl bg-slate-100 p-2 text-center">
            <img src={p.image} alt={p.name} loading="lazy" className="w-full" />
            <p className="text-xs text-slate-500">#{String(p.id).padStart(3, '0')}</p>
            <p className="capitalize font-medium">{p.name}</p>
          </li>
        ))}
      </ul>
      {selected && <PokemonCard id={selected} onClose={() => setSelected(null)} onNav={setSelected} />}
    </main>
  )
}