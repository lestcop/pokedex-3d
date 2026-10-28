import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getIdsByType } from './api/pokemon'
import { TYPE_INFO } from './data/types'
import PokemonCard from './components/PokemonCard'
import Pokeball from './components/Pokeball'
import World from './components/World'

const soft = (color: string, pct = 50) => `color-mix(in oklab, ${color} ${pct}%, #faf9f5)`
const ART = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
const TYPES = Object.keys(TYPE_INFO)

type Entry = { id: number; name: string }

async function getKanto(): Promise<Entry[]> {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
  const json: { results: { name: string }[] } = await res.json()
  return json.results.map((p, i) => ({ id: i + 1, name: p.name }))
}

export default function App() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [world, setWorld] = useState(false)

  const { data: list = [], isLoading } = useQuery({ queryKey: ['kanto'], queryFn: getKanto, staleTime: Infinity })

  const { data: typesMap } = useQuery({
    queryKey: ['types-map'],
    staleTime: Infinity,
    queryFn: async () => {
      const map = new Map<number, string[]>()
      const all = await Promise.all(TYPES.map(async t => [t, await getIdsByType(t)] as const))
      for (const [t, ids] of all) for (const id of ids) map.set(id, [...(map.get(id) ?? []), t])
      return map
    },
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return list.filter(p => {
      const okSearch = !q || p.name.includes(q) || String(p.id) === q.replace('#', '')
      const okType = !type || typesMap?.get(p.id)?.includes(type)
      return okSearch && okType
    })
  }, [list, search, type, typesMap])

  if (world) return <World onExit={() => setWorld(false)} />

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
      <header className="pt-10 md:pt-16 pb-8">
        <div className="flex justify-between items-start gap-4">
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight">
            Pokédex<span className="text-clay">.</span>
          </h1>
          <button
            onClick={() => setWorld(true)}
            className="hidden md:inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-full border border-ink text-sm hover:bg-ink hover:text-paper transition-colors"
          >
            Explorar el mundo →
          </button>
        </div>
        <p className="mt-5 max-w-xl font-serif text-xl md:text-2xl leading-snug text-ink/80">
          Los 151 Pokémon de Kanto, <em className="text-clay not-italic">reimaginados</em> como un
          cuaderno de campo: busca, compara sus estadísticas y, desde la computadora,
          sal a encontrarlos en un mundo 3D.
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
          Proyecto sin fines de lucro · Hecho con mucho ♥️
        </p>
      </header>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nombre o número…"
        className="w-full mb-4 rounded-full bg-sand border border-line px-5 py-3 outline-none focus:border-clay transition-colors"
      />

      <div className="flex md:flex-wrap gap-2 overflow-x-auto md:overflow-visible pb-2 mb-8 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setType(null)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition-colors ${
            type === null ? 'bg-ink text-paper border-ink' : 'border-line hover:border-ink'
          }`}
        >
          Todos
        </button>
        {TYPES.map(t => {
          const active = type === t
          return (
            <button
              key={t}
              onClick={() => setType(active ? null : t)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border transition-colors ${
                active ? 'border-transparent' : 'border-line hover:border-ink'
              }`}
              style={active ? { background: soft(TYPE_INFO[t].color) } : undefined}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: TYPE_INFO[t].color }} />
              {TYPE_INFO[t]?.es}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <p className="font-serif text-muted">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="font-serif text-muted">No encontramos ningún Pokémon 🔍</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {filtered.map(p => {
            const types = typesMap?.get(p.id) ?? []
            const color = types[0] ? TYPE_INFO[types[0]].color : '#d97757'
            return (
              <li key={p.id}>
                <button
                  onClick={() => setSelected(p.id)}
                  className="relative w-full h-32 md:h-36 overflow-hidden rounded-3xl p-4 text-left hover:-translate-y-0.5 transition-transform"
                  style={{ background: soft(color) }}
                >
                  <span className="absolute top-3 right-4 text-xs text-ink/50">
                    #{String(p.id).padStart(3, '0')}
                  </span>
                  <h3 className="font-serif text-lg capitalize">{p.name}</h3>
                  <div className="flex flex-col items-start gap-1 mt-1">
                    {types.map(t => (
                      <span key={t} className="px-2.5 py-0.5 rounded-full bg-paper/50 text-xs">
                        {TYPE_INFO[t]?.es}
                      </span>
                    ))}
                  </div>
                  <Pokeball className="absolute -right-4 -bottom-4 w-28 md:w-32 text-paper/30" />
                  <img
                    src={ART(p.id)}
                    alt={p.name}
                    loading="lazy"
                    className="absolute right-1 bottom-1 w-24 md:w-28 drop-shadow-lg"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {selected && <PokemonCard id={selected} onClose={() => setSelected(null)} onNav={setSelected} />}
      <footer className="mt-20 pt-8 border-t border-line text-sm text-muted">
  <div className="flex flex-col md:flex-row md:justify-between gap-6">
    <div>
      <p className="font-serif text-2xl text-ink">
        Pokédex<span className="text-clay">.</span>
      </p>
      <p className="mt-2 max-w-sm">
        Un proyecto personal sin fines de lucro, hecho con calma y mucho café en Loja, Ecuador ☕
      </p>
    </div>
    <div className="flex gap-10">
      <div className="space-y-1.5">
        <p className="text-xs uppercase tracking-[0.2em] text-ink">Datos</p>
        <a href="https://pokeapi.co" target="_blank" rel="noreferrer" className="block hover:text-clay">PokéAPI</a>
        <a href="https://github.com/Pokemon-3D-api/assets" target="_blank" rel="noreferrer" className="block hover:text-clay">Pokémon 3D API</a>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs uppercase tracking-[0.2em] text-ink">Autor</p>
        <a href="https://github.com/lestcop" target="_blank" rel="noreferrer" className="block hover:text-clay">Lester Ojeda</a>
        <a href="https://github.com/lestcop" target="_blank" rel="noreferrer" className="block hover:text-clay">GitHub</a>
      </div>
    </div>
  </div>
  <p className="mt-10 pb-2 text-xs">
    © {new Date().getFullYear()} · Pokémon y sus nombres son marcas de Nintendo, Game Freak y Creatures. Fan project sin afiliación oficial.
  </p>
</footer>
    </main>
  )
}