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