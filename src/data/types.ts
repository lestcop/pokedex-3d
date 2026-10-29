export const TYPE_INFO: Record<string, { es: string; color: string }> = {
  normal: { es: 'Normal', color: '#A8A77A' }, fire: { es: 'Fuego', color: '#EE8130' },
  water: { es: 'Agua', color: '#6390F0' }, grass: { es: 'Planta', color: '#7AC74C' },
  electric: { es: 'Eléctrico', color: '#F7D02C' }, ice: { es: 'Hielo', color: '#96D9D6' },
  fighting: { es: 'Lucha', color: '#C22E28' }, poison: { es: 'Veneno', color: '#A33EA1' },
  ground: { es: 'Tierra', color: '#E2BF65' }, flying: { es: 'Volador', color: '#A98FF3' },
  psychic: { es: 'Psíquico', color: '#F95587' }, bug: { es: 'Bicho', color: '#A6B91A' },
  rock: { es: 'Roca', color: '#B6A136' }, ghost: { es: 'Fantasma', color: '#735797' },
  dragon: { es: 'Dragón', color: '#6F35FC' }, fairy: { es: 'Hada', color: '#D685AD' },
  steel: { es: 'Acero', color: '#B7B7CE' },
}

export const HABITAT_ES: Record<string, string> = {
  cave: 'Cueva', forest: 'Bosque', grassland: 'Pradera', mountain: 'Montaña',
  rare: 'Raro', 'rough-terrain': 'Terreno agreste', sea: 'Mar', urban: 'Ciudad',
  'waters-edge': 'Orilla del agua',
}
// Tabla de efectividad: atacante -> [x2 contra, x½ contra, x0 contra]
const CHART: Record<string, [string[], string[], string[]]> = {
  normal: [[], ['rock', 'steel'], ['ghost']],
  fire: [['grass', 'ice', 'bug', 'steel'], ['fire', 'water', 'rock', 'dragon'], []],
  water: [['fire', 'ground', 'rock'], ['water', 'grass', 'dragon'], []],
  electric: [['water', 'flying'], ['electric', 'grass', 'dragon'], ['ground']],
  grass: [['water', 'ground', 'rock'], ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], []],
  ice: [['grass', 'ground', 'flying', 'dragon'], ['fire', 'water', 'ice', 'steel'], []],
  fighting: [['normal', 'ice', 'rock', 'steel'], ['poison', 'flying', 'psychic', 'bug', 'fairy'], ['ghost']],
  poison: [['grass', 'fairy'], ['poison', 'ground', 'rock', 'ghost'], ['steel']],
  ground: [['fire', 'electric', 'poison', 'rock', 'steel'], ['grass', 'bug'], ['flying']],
  flying: [['grass', 'fighting', 'bug'], ['electric', 'rock', 'steel'], []],
  psychic: [['fighting', 'poison'], ['psychic', 'steel'], []],
  bug: [['grass', 'psychic'], ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'], []],
  rock: [['fire', 'ice', 'flying', 'bug'], ['fighting', 'ground', 'steel'], []],
  ghost: [['psychic', 'ghost'], [], ['normal']],
  dragon: [['dragon'], ['steel'], ['fairy']],
  steel: [['ice', 'rock', 'fairy'], ['fire', 'water', 'electric', 'steel'], []],
  fairy: [['fighting', 'dragon'], ['fire', 'poison', 'steel'], []],
}

// Multiplicador de daño que recibe un Pokémon con estos tipos, por tipo atacante
export function defenses(types: string[]) {
  return Object.keys(CHART).map(atk => {
    const [x2, half, zero] = CHART[atk]
    const mult = types.reduce((m, d) => m * (zero.includes(d) ? 0 : x2.includes(d) ? 2 : half.includes(d) ? 0.5 : 1), 1)
    return { type: atk, mult }
  })
}
