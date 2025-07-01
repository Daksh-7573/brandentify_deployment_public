import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ParticleSystemProps {
  containerRef: React.RefObject<HTMLDivElement>;
  mousePosition: { x: number; y: number };
  particleCount?: number;
  colorScheme?: 'blue' | 'purple' | 'multi' | 'rainbow';
}

function AnimatedParticles({ 
  mousePosition, 
  particleCount = 200, 
  colorScheme = 'multi',
  containerRef 
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>();
  const originalPositionsRef = useRef<Float32Array>();
  
  // Generate particles with random positions and velocities
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random positions in 3D space
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      
      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
      
      // Color based on scheme
      let r, g, b;
      switch (colorScheme) {
        case 'blue':
          r = 0.2 + Math.random() * 0.3;
          g = 0.4 + Math.random() * 0.4;
          b = 0.8 + Math.random() * 0.2;
          break;
        case 'purple':
          r = 0.6 + Math.random() * 0.4;
          g = 0.2 + Math.random() * 0.3;
          b = 0.8 + Math.random() * 0.2;
          break;
        case 'rainbow':
          const hue = Math.random();
          const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
          r = color.r;
          g = color.g;
          b = color.b;
          break;
        default: // multi
          r = 0.4 + Math.random() * 0.6;
          g = 0.4 + Math.random() * 0.6;
          b = 0.6 + Math.random() * 0.4;
      }
      
      colors[i3] = r;
      colors[i3 + 1] = g;
      colors[i3 + 2] = b;
    }
    
    velocitiesRef.current = velocities;
    originalPositionsRef.current = positions.slice();
    
    return { positions, colors };
  }, [particleCount, colorScheme]);

  // Mouse interaction calculations
  const getMouseInfluence = () => {
    if (!containerRef.current) return { x: 0, y: 0, z: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((mousePosition.x - rect.left) / rect.width) * 2 - 1;
    const y = -((mousePosition.y - rect.top) / rect.height) * 2 + 1;
    
    return { 
      x: x * 10, 
      y: y * 10, 
      z: 0 
    };
  };

  useFrame((state) => {
    if (!pointsRef.current || !velocitiesRef.current || !originalPositionsRef.current) return;
    
    const time = state.clock.elapsedTime;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const mouseInfluence = getMouseInfluence();
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Get current position
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];
      
      // Calculate distance to mouse cursor
      const dx = mouseInfluence.x - x;
      const dy = mouseInfluence.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Mouse attraction/repulsion effect
      if (distance < 5) {
        const force = (5 - distance) / 5;
        velocitiesRef.current[i3] += dx * force * 0.001;
        velocitiesRef.current[i3 + 1] += dy * force * 0.001;
      }
      
      // Apply velocities with some randomness
      positions[i3] += velocitiesRef.current[i3] + Math.sin(time + i * 0.01) * 0.005;
      positions[i3 + 1] += velocitiesRef.current[i3 + 1] + Math.cos(time + i * 0.01) * 0.005;
      positions[i3 + 2] += velocitiesRef.current[i3 + 2] + Math.sin(time * 0.5 + i * 0.1) * 0.003;
      
      // Apply damping
      velocitiesRef.current[i3] *= 0.99;
      velocitiesRef.current[i3 + 1] *= 0.99;
      velocitiesRef.current[i3 + 2] *= 0.99;
      
      // Boundary wrapping
      if (positions[i3] > 10) positions[i3] = -10;
      if (positions[i3] < -10) positions[i3] = 10;
      if (positions[i3 + 1] > 10) positions[i3 + 1] = -10;
      if (positions[i3 + 1] < -10) positions[i3 + 1] = 10;
      if (positions[i3 + 2] > 5) positions[i3 + 2] = -5;
      if (positions[i3 + 2] < -5) positions[i3 + 2] = 5;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors}>
      <PointMaterial
        transparent
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function ParticleSystem(props: ParticleSystemProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <AnimatedParticles {...props} />
      </Canvas>
    </div>
  );
}