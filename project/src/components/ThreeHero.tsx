import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function SpinningKnot() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.2;
    ref.current.rotation.y += delta * 0.3;
  });
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <torusKnotGeometry args={[1.1, 0.35, 128, 32]} />
      <meshStandardMaterial
        color={new THREE.Color('#6ee7ff')}
        metalness={0.6}
        roughness={0.2}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

export default function ThreeHero() {
  return (
    <div className="absolute inset-0 -z-0">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 4.2], fov: 45 }}
      >
        <color attach="background" args={["#f8fafc"]} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <group position={[0, 0.2, 0]}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.6}>
              <SpinningKnot />
            </Float>
          </group>
        </Suspense>
        <directionalLight position={[5, 5, 5]} intensity={1.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <ambientLight intensity={0.4} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}
