import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface InteractiveBoxProps {
  position: [number, number, number];
  color: string;
  label: string;
  onClick: () => void;
}

export function InteractiveBox({ position, color, label, onClick }: InteractiveBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group
      position={position}
    >
      <RoundedBox
        ref={meshRef}
        args={[1.5, 1.5, 1.5]}
        radius={0.05}
        smoothness={4}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={hovered ? new THREE.Color(color).multiplyScalar(1.2) : color}
          roughness={0.3}
          metalness={0.1}
        />
      </RoundedBox>
      
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        maxWidth={2}
        textAlign="center"
      >
        {label}
      </Text>
    </group>
  );
}