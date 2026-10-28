import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPokemon } from '../api/pokemon'
import { TYPE_INFO, HABITAT_ES } from '../data/types'
import Pokeball from './Pokeball'

const STAT: Record<string, string> = {
  hp: 'PS', attack: 'Ataque', defense: 'Defensa',
  'special-attack': 'At. Esp.', 'special-defense': 'Def. Esp.', speed: 'Velocidad',
}
const TABS = ['Info', 'Stats', 'Habilidades'] as const
type Tab = (typeof TABS)[number]

const soft = (color: string, pct = 80) => `color-mix(in oklab, ${color} ${pct}%, #faf9f5)`

type Props = { id: number; onClose: () => void; onNav: (id: number) => void }

export default function PokemonCard({ id, onClose, onNav }: Props) {
  const { data: p, isLoading } = useQuery({ queryKey: ['pokemon', id], queryFn: () => getPokemon(id) })
  const [tab, setTab] = useState<Tab>('Info')
  const color = p ? TYPE_INFO[p.types[0]].color : '#d97757'
  const total = p?.stats.reduce((a, s) => a + s.value, 0) ?? 0
  const len = p?.description.length ?? 0
  const descSize = len > 150 ? 'text-sm' : len > 110 ? 'text-[15px]' : 'text-base md:text-lg'

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm md:max-w-md max-h-[85vh] md:max-h-[94vh] overflow-y-auto overflow-x-hidden rounded-4xl shadow-2xl transition-colors duration-500"
        style={{ background: p ? soft(color) : '#faf9f5' }}
        onClick={e => e.stopPropagation()}
      >
        {isLoading || !p ? (
          <div className="h-120 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-clay/20 animate-ping" />
              <Pokeball className="relative w-16 h-16 text-clay animate-spin [animation-duration:1.4s]" />
            </div>
            <p className="font-serif text-lg">Buscando en la Pokédex…</p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">N.º {String(id).padStart(3, '0')}</p>
          </div>
        ) : (
          <>
            <div className="relative px-6 pt-5">
              <Pokeball className="absolute -right-10 w-44 top-20 md:w-64 md:top-24 text-paper/30" />

              <div className="relative text-sm">
                <button onClick={onClose} className="text-ink/70 hover:text-ink">← Volver</button>
              </div>

              <div className="relative flex justify-between items-end mt-4">
                <h2 className="font-serif text-3xl md:text-4xl capitalize leading-none">{p.name}</h2>
                <span className="font-serif text-xl text-ink/60">#{String(p.id).padStart(3, '0')}</span>
              </div>

              <div className="relative flex items-center justify-between mt-3">
                <div className="flex gap-2">
                  {p.types.map(t => (
                    <span key={t} className="px-3 py-1 rounded-full bg-paper/50 text-sm">{TYPE_INFO[t].es}</span>
                  ))}
                </div>
                <button
                  onClick={() => new Audio(p.cry).play()}
                  className="inline-flex items-center gap-2 pl-2 pr-3.5 py-1 rounded-full bg-ink text-paper text-sm hover:bg-clay transition-colors"
                >
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-paper/15">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
                      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                    </svg>
                  </span>
                  Escuchar
                </button>
              </div>

              <img
                src={p.image}
                alt={p.name}
                className="relative z-10 mx-auto w-36 h-36 -mb-8 md:w-56 md:h-56 md:-mb-12 object-contain drop-shadow-xl"
              />
            </div>

            <div className="bg-paper rounded-4xl px-6 pt-10 md:pt-14 pb-6">
              <div className="flex gap-6 border-b border-line mb-5">
                {TABS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`pb-3 -mb-px text-sm border-b-2 transition-colors ${
                      tab === t ? 'border-clay text-ink font-medium' : 'border-transparent text-muted hover:text-ink'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="h-64 overflow-hidden">
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
                        {a.hidden && <span className="text-xs text-muted">oculta</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-between mt-4 pt-4 border-t border-line text-sm">
                <button disabled={p.id === 1} onClick={() => onNav(p.id - 1)} className="hover:text-clay disabled:opacity-30">← #{p.id - 1}</button>
                <button disabled={p.id === 151} onClick={() => onNav(p.id + 1)} className="hover:text-clay disabled:opacity-30">#{p.id + 1} →</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}