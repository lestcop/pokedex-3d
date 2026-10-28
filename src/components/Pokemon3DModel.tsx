import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const MODEL = (id: number) =>
  `https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt/regular/${id}.glb`

type Props = { id: number; position: [number, number, number]; height?: number }

export default function Pokemon3DModel({ id, position, height = 1.6 }: Props) {
  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(MODEL(id))

  const model = useMemo(() => {
    const c = clone(scene)
    c.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(c, true)
    const size = box.getSize(new THREE.Vector3())
    const s = height / (size.y || 1)
    c.scale.setScalar(s)
    c.position.y = -box.min.y * s
    c.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.frustumCulled = false
      }
    })
    return c
  }, [scene, height])

  const { actions, names } = useAnimations(animations, group)
  const hasAnim = names.length > 0

  useEffect(() => {
    const idle = names.find(n => /idle/i.test(n)) ?? names[0]
    if (idle) actions[idle]?.reset().fadeIn(0.3).play()
  }, [actions, names])

  // Movimiento por código para los modelos sin animación
  const phase = useMemo(() => (id * 1.7) % (Math.PI * 2), [id])
  useFrame(({ clock }) => {
    if (hasAnim || !body.current) return
    const t = clock.elapsedTime + phase
    body.current.position.y = Math.abs(Math.sin(t * 1.5)) * 0.08          // saltitos suaves
    const breath = 1 + Math.sin(t * 2) * 0.03                              // respiración
    body.current.scale.set(breath, 1 / breath, breath)
    body.current.rotation.y = Math.sin(t * 0.4) * 0.6                      // mira a los lados
  })

  return (
    <group ref={group} position={position}>
      <group ref={body}>
        <primitive object={model} />
      </group>
    </group>
  )
}