import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { Search, Compass, X, SearchX, Heart, ArrowUp } from 'lucide-react'
import ThemeToggle from './components/ThemeToggle'
import { getIdsByType, getPokemon } from './api/pokemon'
import { TYPE_INFO } from './data/types'
import { useFavorites } from './hooks/useFavorites'
import PokemonCard from './components/PokemonCard'
import Pokeball from './components/Pokeball'
import World from './components/World'
import Landing from './components/Landing'

const soft = (color: string, pct = 50) => `color-mix(in oklab, ${color} var(--card-mix, ${pct}%), var(--card-base, var(--color-paper)))`
const ART = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
const TYPES = Object.keys(TYPE_INFO)

type Entry = { id: number; name: string }
type Route = { page: 'landing' | 'pokedex'; id: number | null }

async function getKanto(): Promise<Entry[]> {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
  const json: { results: { name: string }[] } = await res.json()
  return json.results.map((p, i) => ({ id: i + 1, name: p.name }))
}

// Rutas por hash: ''  -> landing | #/pokedex -> lista | #/pokedex/25 -> detalle
function parseHash(): Route {
  const [, page, id] = window.location.hash.split('/')
  const n = Number(id)
  return {
    page: page === 'pokedex' ? 'pokedex' : 'landing',
    id: n >= 1 && n <= 151 ? n : null,
  }
}

// Espera a que la imagen ya esté en caché para que no aparezca en blanco
const loadImg = (src: string) =>
  new Promise<void>(resolve => {
    const img = new Image()
    img.onload = img.onerror = () => resolve()
    img.src = src
  })

function useRoute() {
  const qc = useQueryClient()
  const [route, setRoute] = useState(parseHash)
  const current = useRef(route)

  useEffect(() => {
    const onChange = async () => {
      const prev = current.current
      const next = parseHash()
      current.current = next

      // Carga la carta y sus vecinas ANTES de mostrarlas: el mazo aparece completo
      if (next.id) {
        const ids = [next.id - 1, next.id, next.id + 1].filter(n => n >= 1 && n <= 151)
        try {
          const all = await Promise.all(
            ids.map(n => qc.ensureQueryData({ queryKey: ['pokemon', n], queryFn: () => getPokemon(n) })),
          )
          await Promise.race([Promise.all(all.map(p => loadImg(p.image))), new Promise(r => setTimeout(r, 800))])
        } catch {
          /* si falla, cada carta muestra su propio estado de carga */
        }
        if (current.current !== next) return // el usuario ya fue a otro lado
      }

      // View Transition solo para landing ↔ Pokédex; el mazo lo anima Motion
      if (prev.page !== next.page && document.startViewTransition) {
        const root = document.documentElement
        root.dataset.vt = 'page'
        const t = document.startViewTransition(() => flushSync(() => setRoute(next)))
        t.finished.finally(() => delete root.dataset.vt)
      } else {
        setRoute(next)
      }
    }

    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [qc])

  return route
}

// Muestra el botón "volver arriba" después de bajar un poco
function useScrolled(limit = 600) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > limit)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [limit])
  return scrolled
}

const go = (hash: string) => {
  window.location.hash = hash
}

export default function App() {
  const route = useRoute()
  const { favs, isFav, toggle } = useFavorites()
  const scrolled = useScrolled()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string | null>(null)
  const [onlyFavs, setOnlyFavs] = useState(false)
  const [world, setWorld] = useState(false)
  const selected = route.id

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.page])

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
      const okFav = !onlyFavs || favs.includes(p.id)
      return okSearch && okType && okFav
    })
  }, [list, search, type, typesMap, onlyFavs, favs])

  if (route.page === 'landing') return <Landing onEnter={() => go('/pokedex')} />
  if (world) return <World onExit={() => setWorld(false)} />

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
      <nav className="fade flex justify-between items-center py-6">
        <button onClick={() => go('')} className="group inline-flex items-center gap-2 font-serif text-2xl">
          <Pokeball className="w-6 h-6 text-clay transition-transform duration-500 group-hover:rotate-180" />
          Pokelex<span className="text-clay -ml-2">.</span>
        </button>
        <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={() => setWorld(true)}
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-ink text-sm hover:bg-ink hover:text-paper transition-colors"
        >
          <Compass className="w-4 h-4" />
          Explorar el mundo
        </button>
        </div>
      </nav>

      <header className="pt-4 md:pt-8 pb-8">
        <h1 className="rise font-serif text-5xl md:text-7xl tracking-tight">
          Pokédex<span className="text-clay">.</span>
        </h1>
        <p className="rise [animation-delay:80ms] mt-5 max-w-xl font-serif text-xl md:text-2xl leading-snug text-ink/80">
          Los 151 Pokémon de Kanto, <em className="text-clay not-italic">reimaginados</em> como un
          cuaderno de campo: busca, compara sus estadísticas y, desde la computadora,
          sal a encontrarlos en un mundo 3D.
        </p>
        <p className="rise [animation-delay:160ms] mt-3 text-xs uppercase tracking-[0.2em] text-muted">
          Proyecto sin fines de lucro · Hecho con mucho ♥️
        </p>
      </header>

      <div className="rise [animation-delay:220ms] relative mb-4">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o número…"
          className="w-full rounded-full bg-sand border border-line pl-12 pr-12 py-3 outline-none focus:border-clay focus:bg-paper transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted hover:text-ink hover:bg-line transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros: Todos · Favoritos · tipos */}
      <div className="rise [animation-delay:280ms] no-scrollbar flex md:flex-wrap gap-2 overflow-x-auto md:overflow-visible pb-2 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setType(null)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition-all active:scale-95 ${
            type === null ? 'bg-ink text-paper border-ink' : 'border-line hover:border-ink'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setOnlyFavs(v => !v)}
          className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm border transition-all active:scale-95 ${
            onlyFavs ? 'bg-clay text-paper border-clay' : 'border-line hover:border-ink'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${onlyFavs ? 'fill-current' : 'text-clay'}`} />
          Favoritos{favs.length > 0 && ` · ${favs.length}`}
        </button>
        <span className="shrink-0 w-px my-1 bg-line" />
        {TYPES.map(t => {
          const active = type === t
          return (
            <button
              key={t}
              onClick={() => setType(active ? null : t)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border transition-all active:scale-95 ${
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
        /* Skeletons: la forma de la lista mientras carga */
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <li
              key={i}
              className="h-32 md:h-36 rounded-3xl bg-sand border border-line p-4 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-4 w-20 rounded-full bg-line" />
              <div className="h-3 w-12 rounded-full bg-line mt-3" />
              <div className="h-3 w-14 rounded-full bg-line mt-2" />
            </li>
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <div className="fade flex flex-col items-center py-16 text-center">
          {onlyFavs && favs.length === 0 ? (
            <>
              <Heart className="w-10 h-10 text-clay" strokeWidth={1.5} />
              <p className="mt-4 font-serif text-2xl">Aún no tienes favoritos</p>
              <p className="mt-1 text-muted text-sm">Toca el corazón de un Pokémon para guardarlo aquí.</p>
            </>
          ) : (
            <>
              <SearchX className="w-10 h-10 text-clay" strokeWidth={1.5} />
              <p className="mt-4 font-serif text-2xl">No encontramos ese Pokémon</p>
              <p className="mt-1 text-muted text-sm">Prueba con otro nombre, número o tipo.</p>
            </>
          )}
        </div>
      ) : (
        <ul key={`${type}-${search}-${onlyFavs}`} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((p, i) => {
            const types = typesMap?.get(p.id) ?? []
            const color = types[0] ? TYPE_INFO[types[0]].color : '#d97757'
            const fav = isFav(p.id)
            return (
              <li key={p.id} className="rise relative" style={{ animationDelay: `${Math.min(i, 16) * 35}ms` }}>
                <button
                  data-poke={p.id}
                  onClick={() => go(`/pokedex/${p.id}`)}
                  className="group relative w-full h-32 md:h-36 overflow-hidden rounded-3xl p-4 text-left transition-[translate,box-shadow,scale] duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
                  style={{ background: soft(color) }}
                >
                  <h3 className="font-serif text-lg capitalize pr-16">{p.name}</h3>
                  <div className="flex flex-col items-start gap-1 mt-1">
                    {types.map(t => (
                      <span key={t} className="px-2.5 py-0.5 rounded-full bg-paper/50 text-xs">
                        {TYPE_INFO[t]?.es}
                      </span>
                    ))}
                  </div>
                  <Pokeball className="absolute -right-4 -bottom-4 w-28 md:w-32 text-paper/30 transition-transform duration-700 group-hover:rotate-90" />
                  <img
                    src={ART(p.id)}
                    alt={p.name}
                    loading="lazy"
                    className="absolute right-1 bottom-1 w-24 md:w-28 drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                  />
                </button>
                {/* Número + corazón arriba a la derecha (fuera del botón para no abrir la ficha) */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <span className="text-xs text-ink/50 pointer-events-none">
                    #{String(p.id).padStart(3, '0')}
                  </span>
                  <button
                    onClick={() => toggle(p.id)}
                    aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    className="grid place-items-center w-7 h-7 rounded-full hover:bg-paper/60 active:scale-90 transition-all"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${fav ? 'fill-clay text-clay' : 'text-ink/50'}`} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <AnimatePresence>
        {selected && (
          <PokemonCard
            key="modal"
            id={selected}
            onClose={() => go('/pokedex')}
            onNav={id => go(`/pokedex/${id}`)}
          />
        )}
      </AnimatePresence>

      {/* Volver arriba */}
      <AnimatePresence>
        {scrolled && !selected && (
          <motion.button
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Volver arriba"
            className="fixed right-5 bottom-5 md:right-8 md:bottom-8 z-5 grid place-items-center w-12 h-12 rounded-full bg-ink text-paper shadow-xl hover:bg-clay active:scale-90 transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="mt-20 pt-8 border-t border-line text-sm text-muted">
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          <div>
            <p className="font-serif text-2xl text-ink">
              Pokelex<span className="text-clay">.</span>
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
          © {new Date().getFullYear()} Pokelex · Pokémon y sus nombres son marcas de Nintendo, Game Freak y Creatures. Fan project sin afiliación oficial.
        </p>
      </footer>
    </main>
  )
}