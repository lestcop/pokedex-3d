import { useAnimations, useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const MODEL = (id: number) =>
  `https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt/regular/${id}.glb`

type Props = { id: number; position: [number, number, number]; height?: number }

export default function Pokemon3DModel({ id, position, height = 1.6 }: Props) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(MODEL(id))

  const model = useMemo(() => {
    const c = clone(scene)
    c.updateMatrixWorld(true) // actualiza el esqueleto antes de medir
    const box = new THREE.Box3().setFromObject(c, true)
    const size = box.getSize(new THREE.Vector3())
    const s = height / (size.y || 1)
    c.scale.setScalar(s)
    c.position.y = -box.min.y * s
    c.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.frustumCulled = false // evita que desaparezca al animarse
      }
    })
    return c
  }, [scene, height])

  const { actions, names } = useAnimations(animations, group)

  useEffect(() => {
    console.log('🎬 Animaciones de', id, names)
    const idle = names.find(n => /idle/i.test(n)) ?? names[0]
    if (idle) actions[idle]?.reset().fadeIn(0.3).play()
  }, [actions, names, id])

  return (
    <group ref={group} position={position}>
      <primitive object={model} />
    </group>
  )
}