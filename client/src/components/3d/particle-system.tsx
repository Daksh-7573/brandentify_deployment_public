import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface ParticleSystemProps {
  containerRef: React.RefObject<HTMLDivElement>;
  mousePosition: { x: number; y: number };
  particleCount?: number;
  colorScheme?: 'blue' | 'purple' | 'multi';
}

export function ParticleSystem({ 
  containerRef, 
  mousePosition, 
  particleCount = 100,
  colorScheme = 'multi'
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const particlesRef = useRef<THREE.Points>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    });

    const rect = containerRef.current.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorPalettes = {
      blue: [
        new THREE.Color(0x3b82f6),
        new THREE.Color(0x1d4ed8),
        new THREE.Color(0x60a5fa)
      ],
      purple: [
        new THREE.Color(0x8b5cf6),
        new THREE.Color(0x7c3aed),
        new THREE.Color(0xa78bfa)
      ],
      multi: [
        new THREE.Color(0x3b82f6),
        new THREE.Color(0x8b5cf6),
        new THREE.Color(0xf59e0b),
        new THREE.Color(0x10b981),
        new THREE.Color(0xef4444)
      ]
    };

    const palette = colorPalettes[colorScheme];

    for (let i = 0; i < particleCount; i++) {
      // Random positions in 3D space
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Random colors from palette
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Random sizes
      sizes[i] = Math.random() * 0.5 + 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create particle material
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    scene.add(particles);

    camera.position.z = 10;

    // Continuous rotation animation
    gsap.to(particles.rotation, {
      y: Math.PI * 2,
      duration: 20,
      ease: "none",
      repeat: -1
    });

    // Floating motion
    gsap.to(particles.position, {
      y: 2,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
    };
  }, [particleCount, colorScheme]);

  // Handle mouse interaction
  useEffect(() => {
    if (!particlesRef.current) return;

    const normalizedX = (mousePosition.x / window.innerWidth) * 2 - 1;
    const normalizedY = -(mousePosition.y / window.innerHeight) * 2 + 1;

    // Particles react to mouse movement
    gsap.to(particlesRef.current.rotation, {
      x: normalizedY * 0.1,
      y: normalizedX * 0.1,
      duration: 1,
      ease: "power2.out"
    });

    // Scale effect based on mouse proximity to center
    const distanceFromCenter = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
    const scale = 1 + (1 - distanceFromCenter) * 0.2;
    
    gsap.to(particlesRef.current.scale, {
      x: scale,
      y: scale,
      z: scale,
      duration: 0.5,
      ease: "power2.out"
    });
  }, [mousePosition]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera);
      }
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}