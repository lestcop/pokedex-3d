import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Sky } from '@react-three/drei'
import { useQueries } from '@tanstack/react-query'
import { Suspense } from 'react'
import { getIdsByType } from '../api/pokemon'
import Player from './Player'
import WildPokemon from './WildPokemon'

const KEYS = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'back', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
]

const ZONES = [
  { name: 'bosque', color: '#4ade80', x: -17, types: ['grass', 'bug'] },
  { name: 'agua', color: '#60a5fa', x: 0, types: ['water'] },
  { name: 'cueva', color: '#a8a29e', x: 17, types: ['rock', 'ground'] },
]

const PER_ZONE = 6

// Posición fija por Pokémon (no cambia en cada render)
function spot(id: number, zoneX: number): [number, number, number] {
  const r1 = Math.sin(id * 12.9898) * 43758.5453
  const r2 = Math.sin(id * 78.233) * 12345.6789
  const fx = r1 - Math.floor(r1)
  const fz = r2 - Math.floor(r2)
  return [zoneX + (fx - 0.5) * 13, 0.9, (fz - 0.5) * 40]
}

export default function World({ onExit }: { onExit: () => void }) {
  const allTypes = ZONES.flatMap(z => z.types)
  const results = useQueries({
    queries: allTypes.map(t => ({ queryKey: ['type', t], queryFn: () => getIdsByType(t) })),
  })

  const wild = ZONES.flatMap(z => {
    const ids = new Set<number>()
    z.types.forEach(t => {
      const res = results[allTypes.indexOf(t)].data
      res?.forEach(id => ids.add(id))
    })
    return [...ids].slice(0, PER_ZONE).map(id => ({ id, position: spot(id, z.x) }))
  })

  return (
    <div className="fixed inset-0">
      <button onClick={onExit} className="absolute top-3 left-3 z-10 bg-white/80 rounded-full px-4 py-2 text-sm">
        ← Pokédex
      </button>
      <KeyboardControls map={KEYS}>
        <Canvas shadows camera={{ position: [0, 4, 7], fov: 60 }}>
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
          {ZONES.map(z => (
            <mesh key={z.name} rotation-x={-Math.PI / 2} position={[z.x, 0, 0]} receiveShadow>
              <planeGeometry args={[17, 50]} />
              <meshStandardMaterial color={z.color} />
            </mesh>
          ))}
          <Suspense fallback={null}>
            {wild.map(w => <WildPokemon key={w.id} id={w.id} position={w.position} />)}
          </Suspense>
          <Player />
        </Canvas>
      </KeyboardControls>
    </div>
  )
}