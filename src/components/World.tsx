import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Sky } from '@react-three/drei'
import { useQueries } from '@tanstack/react-query'
import { Suspense } from 'react'
import { getIdsByType } from '../api/pokemon'
import Player from './Player'
import Pokemon3DModel from './Pokemon3DModel'

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
const FOG = '#dbeafe'

// Posición fija dentro de su zona (márgenes para no pisar el borde)
function spot(id: number, zoneX: number): [number, number, number] {
  const r1 = Math.sin(id * 12.9898) * 43758.5453
  const r2 = Math.sin(id * 78.233) * 12345.6789
  const fx = r1 - Math.floor(r1)
  const fz = r2 - Math.floor(r2)
  return [zoneX + (fx - 0.5) * 12, 0, (fz - 0.5) * 36]
}

export default function World({ onExit }: { onExit: () => void }) {
  const allTypes = ZONES.flatMap(z => z.types)
  const results = useQueries({
    queries: allTypes.map(t => ({ queryKey: ['type', t], queryFn: () => getIdsByType(t) })),
  })

  // Cada Pokémon aparece una sola vez, en la primera zona que le corresponda
  const used = new Set<number>()
  const wild = ZONES.flatMap(z => {
    const ids: number[] = []
    z.types.forEach(t => {
      results[allTypes.indexOf(t)].data?.forEach(id => {
        if (!used.has(id) && ids.length < PER_ZONE) {
          used.add(id)
          ids.push(id)
        }
      })
    })
    return ids.map(id => ({ id, position: spot(id, z.x) }))
  })

  return (
    <div className="fixed inset-0">
      <button onClick={onExit} className="absolute top-3 left-3 z-10 bg-white/80 rounded-full px-4 py-2 text-sm">
        ← Pokédex
      </button>
      <KeyboardControls map={KEYS}>
        <Canvas shadows camera={{ position: [0, 4, 7], fov: 60 }}>
          <color attach="background" args={[FOG]} />
          <fog attach="fog" args={[FOG, 15, 45]} />
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />

          <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[300, 300]} />
            <meshStandardMaterial color="#86c27a" />
          </mesh>

          {ZONES.map(z => (
            <mesh key={z.name} rotation-x={-Math.PI / 2} position={[z.x, 0, 0]} receiveShadow>
              <planeGeometry args={[17, 50]} />
              <meshStandardMaterial color={z.color} />
            </mesh>
          ))}

          {wild.map(w => (
            <Suspense key={w.id} fallback={null}>
              <Pokemon3DModel id={w.id} position={w.position} />
            </Suspense>
          ))}

          <Player obstacles={wild.map(w => w.position)} />
        </Canvas>
      </KeyboardControls>
    </div>
  )
}