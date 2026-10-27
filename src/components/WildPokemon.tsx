import { Billboard, useTexture } from '@react-three/drei'

const ART = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

type Props = { id: number; position: [number, number, number] }

export default function WildPokemon({ id, position }: Props) {
  const texture = useTexture(ART(id))
  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[1.8, 1.8]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.1} />
      </mesh>
    </Billboard>
  )
}