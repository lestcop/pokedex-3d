import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Volume2, ChevronLeft, ChevronRight, BookOpen, BarChart3, Sparkles, EyeOff, Heart } from 'lucide-react'
import { getPokemon } from '../api/pokemon'
import { TYPE_INFO, HABITAT_ES } from '../data/types'
import { useFavorites } from '../hooks/useFavorites'
import Pokeball from './Pokeball'

const STAT: Record<string, string> = {
  hp: 'PS', attack: 'Ataque', defense: 'Defensa',
  'special-attack': 'At. Esp.', 'special-defense': 'Def. Esp.', speed: 'Velocidad',
}
const TABS = [
  { id: 'Info', icon: BookOpen },
  { id: 'Stats', icon: BarChart3 },
  { id: 'Habilidades', icon: Sparkles },
] as const
type Tab = (typeof TABS)[number]['id']
type Poke = Awaited<ReturnType<typeof getPokemon>>

const EASE = [0.32, 0.72, 0, 1] as const
const soft = (color: string, pct = 80) => `color-mix(in oklab, ${color} ${pct}%, #faf9f5)`
const pad = (n: number) => String(n).padStart(3, '0')
const valid = (n: number) => n >= 1 && n <= 151

// Cuánto se asoman las cartas de atrás (más en escritorio)
function useOffset() {
  const [md, setMd] = useState(() => matchMedia('(min-width: 768px)').matches)
  useEffect(() => {
    const m = matchMedia('(min-width: 768px)')
    const f = () => setMd(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  return md ? 150 : 44
}

type Nav = { onClose: () => void; onNav: (id: number) => void }

/* Contenido completo de la ficha */
function Detail({ p, onClose }: { p: Poke; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('Info')
  const { isFav, toggle } = useFavorites()
  const fav = isFav(p.id)
  const total = p.stats.reduce((a, s) => a + s.value, 0)
  const len = p.description.length
  const descSize = len > 150 ? 'text-sm' : len > 110 ? 'text-[15px]' : 'text-base md:text-lg'

  return (
    <>
      <div className="relative px-6 pt-5">
        <Pokeball className="absolute -right-10 w-44 top-20 md:w-64 md:top-24 text-paper/30 animate-[spin_40s_linear_infinite]" />

        <div className="relative flex items-center justify-between text-sm">
          <button
            onClick={onClose}
            className="group inline-flex items-center gap-1.5 text-ink/70 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Volver
          </button>
          <button
            onClick={() => toggle(p.id)}
            aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className="grid place-items-center w-9 h-9 rounded-full bg-paper/50 hover:bg-paper active:scale-90 transition-all"
          >
            <Heart className={`w-4.5 h-4.5 transition-colors ${fav ? 'fill-clay text-clay' : 'text-ink/60'}`} />
          </button>
        </div>

        <div className="relative flex justify-between items-end mt-3">
          <h2 className="font-serif text-3xl md:text-4xl capitalize leading-none">{p.name}</h2>
          <span className="font-serif text-xl text-ink/60">#{pad(p.id)}</span>
        </div>

        <div className="relative flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {p.types.map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-paper/50 text-sm">{TYPE_INFO[t].es}</span>
            ))}
          </div>
          <button
            onClick={() => new Audio(p.cry).play()}
            className="inline-flex items-center gap-2 pl-2 pr-3.5 py-1 rounded-full bg-ink text-paper text-sm hover:bg-clay active:scale-95 transition-all"
          >
            <span className="grid place-items-center w-6 h-6 rounded-full bg-paper/15">
              <Volume2 className="w-3.5 h-3.5" />
            </span>
            Escuchar
          </button>
        </div>

        <img
          src={p.image}
          alt={p.name}
          className="relative z-10 mx-auto w-36 h-36 -mb-8 md:w-52 md:h-52 md:-mb-10 object-contain drop-shadow-xl"
        />
      </div>

      <div className="bg-paper rounded-4xl px-6 pt-10 md:pt-12 pb-6 min-h-full">
        <div className="flex gap-6 border-b border-line mb-5">
          {TABS.map(({ id: t, icon: Icon }) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`inline-flex items-center gap-1.5 pb-3 -mb-px text-sm border-b-2 transition-colors ${
                tab === t ? 'border-clay text-ink font-medium' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t}
            </button>
          ))}
        </div>

        <div key={tab} className="fade h-64 overflow-hidden">
          {tab === 'Info' && (
            <div>
              <p className={`font-serif ${descSize} leading-relaxed mb-5`}>{p.description}</p>
              <dl className="grid grid-cols-[7rem_1fr] gap-y-3 text-sm">
                <dt className="text-muted">Especie</dt><dd>{p.genus}</dd>
                <dt className="text-muted">Altura</dt><dd>{p.height} m</dd>
                <dt className="text-muted">Peso</dt><dd>{p.weight} kg</dd>
                <dt className="text-muted">Hábitat</dt>
                <dd className="first-letter:uppercase">{HABITAT_ES[p.habitat] ?? p.habitat}</dd>
              </dl>
            </div>
          )}

          {tab === 'Stats' && (
            <div className="space-y-3">
              {p.stats.map(s => (
                <div key={s.name} className="flex items-center gap-3 text-sm">
                  <span className="w-20 text-muted">{STAT[s.name]}</span>
                  <span className="w-8 text-right font-medium">{s.value}</span>
                  <div className="flex-1 h-1.5 bg-line rounded-full">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${Math.min(s.value, 150) / 1.5}%`, background: s.value >= 60 ? '#788c5d' : '#d97757' }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 text-sm pt-2 border-t border-line">
                <span className="w-20 text-muted">Total</span>
                <span className="w-8 text-right font-semibold">{total}</span>
              </div>
            </div>
          )}

          {tab === 'Habilidades' && (
            <ul className="space-y-2">
              {p.abilities.map(a => (
                <li key={a.name} className="flex justify-between items-center rounded-2xl bg-sand px-4 py-3">
                  <span className="font-serif text-lg capitalize">{a.name.replace('-', ' ')}</span>
                  {a.hidden && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <EyeOff className="w-3.5 h-3.5" /> oculta
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

/* Una carta del mazo: role -1 = atrás izquierda, 0 = principal, 1 = atrás derecha */
function DeckCard({ pid, role, first, off, onClose, onNav }: { pid: number; role: number; first: boolean; off: number } & Nav) {
  const { data: p } = useQuery({ queryKey: ['pokemon', pid], queryFn: () => getPokemon(pid) })
  const color = p ? TYPE_INFO[p.types[0]].color : '#e3e0d6'
  const isMain = role === 0
  const left = role < 0

  return (
    <motion.div
      className={`absolute inset-0 rounded-4xl overflow-hidden shadow-2xl ${isMain ? '' : 'cursor-pointer'}`}
      style={{ background: soft(color), zIndex: isMain ? 2 : 1 }}
      initial={
        isMain && first
          ? { opacity: 0, y: 60, scale: 0.96, x: 0, rotate: 0, filter: 'blur(8px)' }
          : { opacity: 0, y: 0, scale: 0.85, x: 0, rotate: 0, filter: 'blur(0px)' }
      }
      animate={{ opacity: 1, y: 0, x: role * off, rotate: role * 8, scale: isMain ? 1 : 0.9, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.85, x: role * off * 0.4, transition: { duration: 0.3, ease: EASE } }}
      transition={{ duration: 0.55, ease: EASE, delay: first && !isMain ? 0.3 : 0 }}
      onClick={isMain ? undefined : () => onNav(pid)}
    >
      {/* Cara trasera: lo que asoma del mazo */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isMain ? 0 : 1 }}
        transition={{ duration: 0.25 }}
      >
        <Pokeball className={`absolute top-16 w-48 text-paper/30 ${left ? '-left-10' : '-right-10'}`} />
        {p && (
          <>
            <img
              src={p.image}
              alt=""
              className={`absolute top-20 w-28 md:w-40 opacity-90 drop-shadow-lg ${left ? 'left-2' : 'right-2'}`}
            />
            <span className={`absolute top-6 font-serif text-sm text-ink/60 capitalize ${left ? 'left-5' : 'right-5'}`}>
              #{pad(p.id)} · {p.name}
            </span>
          </>
        )}
      </motion.div>

      {/* Cara frontal: la ficha completa */}
      <motion.div
        className={`no-scrollbar absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden ${isMain ? '' : 'pointer-events-none'}`}
        animate={{ opacity: isMain ? 1 : 0 }}
        transition={{ duration: 0.3, delay: isMain ? 0.15 : 0 }}
      >
        {p ? (
          <Detail p={p} onClose={onClose} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Pokeball className="w-12 h-12 text-clay animate-spin" />
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

type Props = { id: number } & Nav

export default function PokemonCard({ id, onClose, onNav }: Props) {
  const qc = useQueryClient()
  const off = useOffset()

  // true solo en la primera aparición: después las cartas se mueven sin retraso
  const [first, setFirst] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setFirst(false), 900)
    return () => clearTimeout(t)
  }, [])

  // Precarga 2 hacia cada lado (datos + imagen)
  useEffect(() => {
    for (const n of [id - 2, id - 1, id + 1, id + 2]) {
      if (!valid(n)) continue
      qc.prefetchQuery({ queryKey: ['pokemon', n], queryFn: () => getPokemon(n) }).then(() => {
        const d = qc.getQueryData<Poke>(['pokemon', n])
        if (d) new Image().src = d.image
      })
    }
  }, [id, qc])

  const deck = [id - 1, id, id + 1].filter(valid)

  return (
    <motion.div
      className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-5 p-4 bg-ink/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm md:max-w-md h-[min(78vh,640px)]"
        exit={{ y: 50, opacity: 0, filter: 'blur(6px)', transition: { duration: 0.3, ease: EASE } }}
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence>
          {deck.map(pid => (
            <DeckCard
              key={pid}
              pid={pid}
              role={pid - id}
              first={first}
              off={off}
              onClose={onClose}
              onNav={onNav}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Flechas flotantes, siempre visibles */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.45 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        onClick={e => e.stopPropagation()}
      >
        <button
          disabled={!valid(id - 1)}
          onClick={() => onNav(id - 1)}
          className="group inline-flex items-center gap-1 pl-2 pr-4 py-2 rounded-full bg-paper text-sm shadow-lg hover:text-clay active:scale-95 disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          #{pad(id - 1)}
        </button>
        <button
          disabled={!valid(id + 1)}
          onClick={() => onNav(id + 1)}
          className="group inline-flex items-center gap-1 pl-4 pr-2 py-2 rounded-full bg-paper text-sm shadow-lg hover:text-clay active:scale-95 disabled:opacity-30 transition-all"
        >
          #{pad(id + 1)}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </motion.div>
    </motion.div>
  )
}