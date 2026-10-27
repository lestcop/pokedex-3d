const ART = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

// ---------- Lista ----------
export type PokemonListItem = { id: number; name: string; image: string }

export async function getGen1(): Promise<PokemonListItem[]> {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
  if (!res.ok) throw new Error('Error al cargar la Pokédex')
  const data: { results: { name: string; url: string }[] } = await res.json()
  return data.results.map((p, i) => ({ id: i + 1, name: p.name, image: `${ART}/${i + 1}.png` }))
}

// ---------- Tipos ----------
export const TYPES = ['normal','fire','water','grass','electric','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','fairy','steel']

export async function getIdsByType(type: string): Promise<Set<number>> {
  const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
  const data: { pokemon: { pokemon: { url: string } }[] } = await res.json()
  return new Set(data.pokemon.map(p => Number(p.pokemon.url.split('/').at(-2))))
}

// ---------- Detalle ----------
export type PokemonDetail = {
  id: number; name: string; image: string; cry: string
  types: string[]; height: number; weight: number
  stats: { name: string; value: number }[]
  abilities: { name: string; hidden: boolean }[]
  genus: string; description: string; habitat: string
}

type Named = { name: string }
type Lang = { language: Named }

type ApiPokemon = {
  name: string; height: number; weight: number
  cries: { latest: string }
  types: { type: Named }[]
  stats: { base_stat: number; stat: Named }[]
  abilities: { ability: Named; is_hidden: boolean }[]
}

type ApiSpecies = {
  genera: (Lang & { genus: string })[]
  flavor_text_entries: (Lang & { flavor_text: string })[]
  habitat: Named | null
}

const es = <T extends Lang>(arr: T[]) => arr.find(x => x.language.name === 'es')

export async function getPokemon(id: number): Promise<PokemonDetail> {
  const [p, s]: [ApiPokemon, ApiSpecies] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json()),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(r => r.json()),
  ])
  return {
    id,
    name: p.name,
    image: `${ART}/${id}.png`,
    cry: p.cries.latest,
    types: p.types.map(t => t.type.name),
    height: p.height / 10,
    weight: p.weight / 10,
    stats: p.stats.map(st => ({ name: st.stat.name, value: st.base_stat })),
    abilities: p.abilities.map(a => ({ name: a.ability.name, hidden: a.is_hidden })),
    genus: es(s.genera)?.genus ?? '',
    description: (es(s.flavor_text_entries)?.flavor_text ?? '').replace(/\s+/g, ' '),
    habitat: s.habitat?.name ?? 'desconocido',
  }
}