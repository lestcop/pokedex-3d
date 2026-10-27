import { Canvas } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles, useTexture } from '@react-three/drei'
import { Suspense } from 'react'

function ArtworkPlane({ url }: { url: string }) {
  const texture = useTexture(url)
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial map={texture} transparent side={2} />
      </mesh>
    </Float>
  )
}

type Props = { url: string; color: string }

export default function Pokemon3D({ url, color }: Props) {
  return (
    <div className="h-64 w-full">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 3, 4]} intensity={1} />
        <Sparkles count={40} scale={[4, 3, 1]} position={[0, 0, -1]} size={2} speed={0.3} opacity={0.6} color={color} />
        <Suspense fallback={null}>
          <ArtworkPlane url={url} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}