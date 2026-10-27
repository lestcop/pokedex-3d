export type PokemonListItem = { id: number; name: string; image: string }

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