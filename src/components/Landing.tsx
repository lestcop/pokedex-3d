import Pokeball from './Pokeball'
import ThemeToggle from './ThemeToggle'

const ART = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

const FEATURES = [
  { n: '01', t: 'Cuaderno de campo', d: 'Los 151 Pokémon de Kanto con sus datos, estadísticas y habilidades, en un diseño limpio y editorial.' },
  { n: '02', t: 'Busca y filtra', d: 'Encuentra cualquier Pokémon por nombre, número o tipo en segundos.' },
  { n: '03', t: 'Mundo 3D', d: 'Desde la computadora, sal a explorar un mundo 3D y encuéntralos en su hábitat.' },
]

type Props = { onEnter: () => void }

export default function Landing({ onEnter }: Props) {
  return (
    <main className="min-h-screen flex flex-col max-w-5xl mx-auto px-4 md:px-8">
      <nav className="flex justify-between items-center py-6">
        <span className="font-serif text-2xl">
          Pokelex<span className="text-clay">.</span>
        </span>
        <div className="flex items-center gap-4">
          <button onClick={onEnter} className="text-sm hover:text-clay transition-colors">
            Abrir Pokédex →
          </button>
          <ThemeToggle />
        </div>
      </nav>

      <section className="relative flex-1 grid md:grid-cols-[1.2fr_1fr] items-center gap-10 py-10 md:py-20">
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Kanto · 151 Pokémon</p>
          <h1 className="mt-5 font-serif text-6xl md:text-8xl leading-[0.95] tracking-tight">
            Una Pokédex <em className="text-clay">hecha</em> con calma.
          </h1>
          <p className="mt-6 max-w-md font-serif text-xl leading-snug text-ink/75">
            Pokelex reimagina la Pokédex clásica como un cuaderno de campo: tranquila,
            bonita y hecha para explorar.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={onEnter}
              className="px-7 py-3.5 rounded-full bg-ink text-paper hover:bg-clay transition-colors"
            >
              Explorar la Pokédex
            </button>
            <a
              href="https://github.com/lestcop/pokedex-3d"
              target="_blank"
              rel="noreferrer"
              className="px-7 py-3.5 rounded-full border border-line hover:border-ink transition-colors"
            >
              Ver el código
            </a>
          </div>
        </div>

        <div className="relative h-72 md:h-112">
          <Pokeball className="absolute inset-0 m-auto w-72 md:w-104 text-line" />
          <img src={ART(25)} alt="Pikachu" className="absolute inset-0 m-auto w-56 md:w-80 drop-shadow-2xl" />
          <img src={ART(1)} alt="Bulbasaur" className="absolute left-0 bottom-0 w-24 md:w-36 drop-shadow-xl" />
          <img src={ART(4)} alt="Charmander" className="absolute right-0 top-0 w-24 md:w-32 drop-shadow-xl" />
          <img src={ART(7)} alt="Squirtle" className="absolute right-4 bottom-2 w-20 md:w-28 drop-shadow-xl" />
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 py-14 border-t border-line">
        {FEATURES.map(f => (
          <div key={f.n}>
            <p className="font-serif text-clay">{f.n}</p>
            <h3 className="mt-2 font-serif text-2xl">{f.t}</h3>
            <p className="mt-2 text-muted leading-relaxed">{f.d}</p>
          </div>
        ))}
      </section>

      <footer className="py-8 border-t border-line text-xs text-muted">
        © {new Date().getFullYear()} Pokelex · Hecho por Lester Ojeda en Loja, Ecuador ☕ · Fan project sin afiliación con Nintendo.
      </footer>
    </main>
  )
}