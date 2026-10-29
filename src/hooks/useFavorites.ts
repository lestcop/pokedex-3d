import { useSyncExternalStore } from 'react'

const KEY = 'pokelex:favs'
const listeners = new Set<() => void>()

let favs: number[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
})()

function save(next: number[]) {
  favs = next
  localStorage.setItem(KEY, JSON.stringify(next))
  listeners.forEach(l => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useFavorites() {
  const list = useSyncExternalStore(subscribe, () => favs)
  const isFav = (id: number) => list.includes(id)
  const toggle = (id: number) => save(isFav(id) ? list.filter(f => f !== id) : [...list, id])
  return { favs: list, isFav, toggle }
}