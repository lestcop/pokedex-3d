import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

const SPEED = 5
const LIMIT = 24
const PLAYER_R = 0.4
const POKEMON_R = 0.8
const CAM_OFFSET = new THREE.Vector3(0, 4, 7)

type Keys = 'forward' | 'back' | 'left' | 'right'
type Props = { obstacles: [number, number, number][] }

export default function Player({ obstacles }: Props) {
  const ref = useRef<THREE.Mesh>(null)
  const [, get] = useKeyboardControls<Keys>()

  useFrame((state, delta) => {
    const p = ref.current
    if (!p) return
    const { forward, back, left, right } = get()
    const dir = new THREE.Vector3(Number(right) - Number(left), 0, Number(back) - Number(forward))

    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(SPEED * delta)
      p.position.add(dir)
      p.rotation.y = Math.atan2(dir.x, dir.z)

      // 🧱 Colisiones: si choca con un Pokémon, lo empuja hacia afuera
      const minDist = PLAYER_R + POKEMON_R
      for (const [ox, , oz] of obstacles) {
        const dx = p.position.x - ox
        const dz = p.position.z - oz
        const dist = Math.hypot(dx, dz)
        if (dist < minDist && dist > 0.0001) {
          const push = (minDist - dist) / dist
          p.position.x += dx * push
          p.position.z += dz * push
        }
      }

      p.position.x = THREE.MathUtils.clamp(p.position.x, -LIMIT, LIMIT)
      p.position.z = THREE.MathUtils.clamp(p.position.z, -LIMIT, LIMIT)
    }

    state.camera.position.lerp(p.position.clone().add(CAM_OFFSET), 0.1)
    state.camera.lookAt(p.position)
  })

  return (
    <mesh ref={ref} position={[0, 0.7, 0]} castShadow>
      <capsuleGeometry args={[0.4, 0.6, 4, 8]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
  )
}