import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'pokelex:theme'

const initial = (): Theme =>
  (localStorage.getItem(KEY) as Theme | null) ?? 'light'

// Modo oscuro cálido: guarda la preferencia y pone la clase .dark en <html>
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initial)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(KEY, theme)
  }, [theme])
  return { theme, toggle: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')) }
}
