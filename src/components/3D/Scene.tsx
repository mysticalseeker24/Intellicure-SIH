import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { InteractiveBox } from './InteractiveBox';

interface SceneProps {
  onBoxClick: (boxType: string) => void;
}

export default function Scene({ onBoxClick }: SceneProps) {
  return (
    <div className="h-96 w-full">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 45 }}
        shadows
        className="rounded-xl"
      >
        <Suspense fallback={null}>
          <Environment preset="apartment" />
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          
          {/* Three interactive boxes */}
          <InteractiveBox
            position={[-2.5, 0, 0]}
            color="#3b82f6"
            label="Search Records"
            onClick={() => onBoxClick('search')}
          />
          <InteractiveBox
            position={[0, 0, 0]}
            color="#10b981"
            label="Hospital Directory"
            onClick={() => onBoxClick('directory')}
          />
          <InteractiveBox
            position={[2.5, 0, 0]}
            color="#f59e0b"
            label="Analytics"
            onClick={() => onBoxClick('analytics')}
          />
          
          <ContactShadows
            position={[0, -1, 0]}
            opacity={0.3}
            scale={10}
            blur={2}
            far={4}
          />
          
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}