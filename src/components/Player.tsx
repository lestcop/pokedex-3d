import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

const SPEED = 5
const LIMIT = 24
const CAM_OFFSET = new THREE.Vector3(0, 4, 7)

type Keys = 'forward' | 'back' | 'left' | 'right'

export default function Player() {
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
      p.position.x = THREE.MathUtils.clamp(p.position.x, -LIMIT, LIMIT)
      p.position.z = THREE.MathUtils.clamp(p.position.z, -LIMIT, LIMIT)
      p.rotation.y = Math.atan2(dir.x, dir.z)
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