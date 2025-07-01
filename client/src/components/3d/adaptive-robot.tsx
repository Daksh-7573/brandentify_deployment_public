import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface AdaptiveRobotProps {
  containerRef: React.RefObject<HTMLDivElement>;
  mousePosition: { x: number; y: number };
  interactions: {
    onEnter: boolean;
    onHover: boolean;
    onFeaturePoint: boolean;
    onCelebrate: boolean;
  };
}

export function AdaptiveRobot({ containerRef, mousePosition, interactions }: AdaptiveRobotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const robotRef = useRef<THREE.Group>();
  const headRef = useRef<THREE.Mesh>();
  const eyesRef = useRef<THREE.Group>();
  const animationIdRef = useRef<number>();
  const [speechBubble, setSpeechBubble] = useState<string>('');

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    });

    renderer.setSize(300, 400);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create robot
    const robot = new THREE.Group();
    robotRef.current = robot;

    // Robot body (sleek design)
    const bodyGeometry = new THREE.CapsuleGeometry(0.8, 1.5, 8, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4f46e5, 
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    robot.add(body);

    // Robot head
    const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x6366f1, 
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.2;
    headRef.current = head;
    robot.add(head);

    // Robot eyes
    const eyes = new THREE.Group();
    const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 1.3, 0.4);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 1.3, 0.4);
    
    eyes.add(leftEye, rightEye);
    eyesRef.current = eyes;
    robot.add(eyes);

    // Robot arms
    const armGeometry = new THREE.CapsuleGeometry(0.2, 1.2, 6, 12);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0x5b21b6 });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.2, 0.2, 0);
    leftArm.rotation.z = Math.PI / 6;
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.2, 0.2, 0);
    rightArm.rotation.z = -Math.PI / 6;
    
    robot.add(leftArm, rightArm);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Add point light for dynamic effects
    const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    scene.add(robot);
    camera.position.z = 5;

    // Floating animation
    gsap.to(robot.position, {
      y: 0.3,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });

    // Gentle rotation
    gsap.to(robot.rotation, {
      y: Math.PI * 0.1,
      duration: 4,
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
  }, []);

  // Handle mouse tracking
  useEffect(() => {
    if (!headRef.current || !eyesRef.current) return;

    const normalizedX = (mousePosition.x / window.innerWidth) * 2 - 1;
    const normalizedY = -(mousePosition.y / window.innerHeight) * 2 + 1;

    // Head tracking
    gsap.to(headRef.current.rotation, {
      y: normalizedX * 0.3,
      x: normalizedY * 0.2,
      duration: 0.5,
      ease: "power2.out"
    });

    // Eyes tracking
    gsap.to(eyesRef.current.rotation, {
      y: normalizedX * 0.2,
      x: normalizedY * 0.15,
      duration: 0.3,
      ease: "power2.out"
    });
  }, [mousePosition]);

  // Handle interactions
  useEffect(() => {
    if (!robotRef.current) return;

    if (interactions.onEnter) {
      // Wave animation
      gsap.fromTo(robotRef.current.rotation, 
        { y: -Math.PI * 0.5 },
        { y: 0, duration: 1, ease: "back.out(1.7)" }
      );
      setSpeechBubble("Welcome to your career journey! 🚀");
      setTimeout(() => setSpeechBubble(''), 3000);
    }

    if (interactions.onFeaturePoint) {
      // Point gesture
      gsap.to(robotRef.current.rotation, {
        y: Math.PI * 0.1,
        duration: 0.5,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
      setSpeechBubble("This feature will boost your career! ⭐");
      setTimeout(() => setSpeechBubble(''), 2500);
    }

    if (interactions.onCelebrate) {
      // Celebration spin
      gsap.to(robotRef.current.rotation, {
        y: Math.PI * 2,
        duration: 1,
        ease: "power2.inOut"
      });
      setSpeechBubble("Awesome choice! Let's get started! 🎉");
      setTimeout(() => setSpeechBubble(''), 3000);
    }
  }, [interactions]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (rendererRef.current && sceneRef.current) {
        // Camera position based on mouse
        const camera = rendererRef.current.getContext().canvas;
        rendererRef.current.render(sceneRef.current, new THREE.PerspectiveCamera(75, 300/400, 0.1, 1000));
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
    <div className="relative">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ maxWidth: '300px', maxHeight: '400px' }}
      />
      
      {/* Speech Bubble */}
      {speechBubble && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 max-w-xs">
          <div className="text-sm text-gray-800 font-medium">
            {speechBubble}
          </div>
          <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/90"></div>
        </div>
      )}
    </div>
  );
}