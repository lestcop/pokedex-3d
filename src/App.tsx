import { useQuery } from '@tanstack/react-query'
import { getGen1 } from './api/pokemon'

export default function App() {
  const { data, isLoading, error } = useQuery({ queryKey: ['gen1'], queryFn: getGen1 })
  if (isLoading) return <p className="p-4">Cargando… ⏳</p>
  if (error) return <p className="p-4 text-red-500">{error.message}</p>

  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-4">🔴 Pokédex 3D</h1>
      <ul className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {data!.map(p => (
          <li key={p.id} className="rounded-xl bg-slate-100 p-2 text-center">
            <img src={p.image} alt={p.name} loading="lazy" className="w-full" />
            <p className="text-xs text-slate-500">#{String(p.id).padStart(3, '0')}</p>
            <p className="capitalize font-medium">{p.name}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}