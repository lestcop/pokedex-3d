export type PokemonListItem = { id: number; name: string; image: string }
export const TYPES = ['normal','fire','water','grass','electric','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','fairy','steel']

export async function getIdsByType(type: string): Promise<Set<number>> {
  const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
  const data: { pokemon: { pokemon: { url: string } }[] } = await res.json()
  return new Set(data.pokemon.map(p => Number(p.pokemon.url.split('/').at(-2))))
}

const ART = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

export async function getGen1(): Promise<PokemonListItem[]> {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
  if (!res.ok) throw new Error('Error al cargar la Pokédex')
  const data: { results: { name: string; url: string }[] } = await res.json()
  return data.results.map((p, i) => ({
    id: i + 1,
    name: p.name,
    image: `${ART}/${i + 1}.png`,
  }))
}