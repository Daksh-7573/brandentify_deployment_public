import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface RobotInteractions {
  onEnter: boolean;
  onHover: boolean;
  onFeaturePoint: boolean;
  onCelebrate: boolean;
}

interface AdaptiveRobotProps {
  containerRef: React.RefObject<HTMLDivElement>;
  mousePosition: { x: number; y: number };
  interactions: RobotInteractions;
}

interface SpeechBubbleProps {
  message: string;
  visible: boolean;
  position: [number, number, number];
}

// Speech Bubble Component
function SpeechBubble({ message, visible, position }: SpeechBubbleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && visible) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  if (!visible || !message) return null;

  return (
    <group position={position}>
      {/* Speech bubble background */}
      <Box ref={meshRef} args={[3, 1, 0.1]} position={[0, 1, 0]}>
        <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
      </Box>
      
      {/* Speech bubble tail */}
      <Cylinder args={[0.1, 0.2, 0.5]} position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
        <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
      </Cylinder>
    </group>
  );
}

// Robot Body Component
function RobotBody({ 
  mousePosition, 
  interactions, 
  containerRef 
}: {
  mousePosition: { x: number; y: number };
  interactions: RobotInteractions;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  
  const { camera, viewport } = useThree();
  
  // Convert mouse position to 3D world coordinates
  const getMouseDirection = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((mousePosition.x - rect.left) / rect.width) * 2 - 1;
    const y = -((mousePosition.y - rect.top) / rect.height) * 2 + 1;
    
    return { x: x * 0.5, y: y * 0.5 };
  }, [mousePosition, containerRef]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const mouseDir = getMouseDirection();
    
    if (bodyRef.current) {
      // Floating movement with breathing animation
      bodyRef.current.position.y = Math.sin(time * 1.5) * 0.2;
      bodyRef.current.rotation.y = Math.sin(time * 0.8) * 0.1;
      
      // Celebration spinning
      if (interactions.onCelebrate) {
        bodyRef.current.rotation.y += 0.1;
      }
      
      // Happy bouncing
      if (interactions.onEnter) {
        bodyRef.current.position.y += Math.sin(time * 8) * 0.3;
      }
    }
    
    if (headRef.current) {
      // Head follows cursor with smooth interpolation
      const targetRotationY = mouseDir.x * 0.5;
      const targetRotationX = -mouseDir.y * 0.3;
      
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        targetRotationY,
        0.05
      );
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        targetRotationX,
        0.05
      );
      
      // Curious tilting
      if (interactions.onHover) {
        headRef.current.rotation.z = Math.sin(time * 3) * 0.2;
      }
    }
    
    // Eye tracking
    if (leftEyeRef.current && rightEyeRef.current) {
      const eyeRotationY = mouseDir.x * 0.3;
      const eyeRotationX = -mouseDir.y * 0.2;
      
      leftEyeRef.current.rotation.y = eyeRotationY;
      leftEyeRef.current.rotation.x = eyeRotationX;
      rightEyeRef.current.rotation.y = eyeRotationY;
      rightEyeRef.current.rotation.x = eyeRotationX;
    }
    
    // Arm gestures
    if (leftArmRef.current && rightArmRef.current) {
      if (interactions.onEnter) {
        // Waving gesture
        rightArmRef.current.rotation.z = Math.sin(time * 6) * 0.8 - 0.5;
      } else if (interactions.onFeaturePoint) {
        // Pointing gesture
        rightArmRef.current.rotation.z = -1.2;
        rightArmRef.current.rotation.x = mouseDir.y * 0.5;
      } else if (interactions.onCelebrate) {
        // Thumbs up
        rightArmRef.current.rotation.z = -1.5;
        leftArmRef.current.rotation.z = 1.5;
      } else {
        // Resting position
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.z, 
          0.3, 
          0.05
        );
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.z, 
          -0.3, 
          0.05
        );
      }
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Robot Body */}
      <Box args={[1, 1.5, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Robot Head */}
      <group ref={headRef} position={[0, 1.2, 0]}>
        <Box args={[0.8, 0.8, 0.8]}>
          <meshStandardMaterial color="#6366f1" metalness={0.7} roughness={0.3} />
        </Box>
        
        {/* Eyes */}
        <Sphere ref={leftEyeRef} args={[0.1]} position={[-0.2, 0.1, 0.35]}>
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
        </Sphere>
        <Sphere ref={rightEyeRef} args={[0.1]} position={[0.2, 0.1, 0.35]}>
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
        </Sphere>
        
        {/* Mouth indicator */}
        <Box args={[0.3, 0.05, 0.1]} position={[0, -0.2, 0.35]}>
          <meshStandardMaterial 
            color={interactions.onCelebrate ? "#00ff00" : "#ffffff"} 
            emissive={interactions.onCelebrate ? "#00ff00" : "#000000"}
            emissiveIntensity={interactions.onCelebrate ? 0.3 : 0}
          />
        </Box>
      </group>
      
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.7, 0.3, 0]}>
        <Cylinder args={[0.1, 0.1, 0.8]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} />
        </Cylinder>
        
        {/* Left Hand */}
        <Sphere args={[0.15]} position={[0, -0.5, 0]}>
          <meshStandardMaterial color="#6366f1" metalness={0.7} roughness={0.3} />
        </Sphere>
      </group>
      
      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.7, 0.3, 0]}>
        <Cylinder args={[0.1, 0.1, 0.8]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} />
        </Cylinder>
        
        {/* Right Hand */}
        <Sphere args={[0.15]} position={[0, -0.5, 0]}>
          <meshStandardMaterial color="#6366f1" metalness={0.7} roughness={0.3} />
        </Sphere>
      </group>
      
      {/* Legs */}
      <Cylinder args={[0.15, 0.15, 0.8]} position={[-0.3, -1.2, 0]}>
        <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.8]} position={[0.3, -1.2, 0]}>
        <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* Feet */}
      <Box args={[0.4, 0.2, 0.6]} position={[-0.3, -1.8, 0.1]}>
        <meshStandardMaterial color="#6366f1" metalness={0.7} roughness={0.3} />
      </Box>
      <Box args={[0.4, 0.2, 0.6]} position={[0.3, -1.8, 0.1]}>
        <meshStandardMaterial color="#6366f1" metalness={0.7} roughness={0.3} />
      </Box>
    </group>
  );
}

// Main Adaptive Robot Component
export default function AdaptiveRobot({ containerRef, mousePosition, interactions }: AdaptiveRobotProps) {
  const [speechMessage, setSpeechMessage] = useState('');
  const [showSpeech, setShowSpeech] = useState(false);
  
  const careerTips = [
    "Ready to boost your career? Let's explore!",
    "Your next opportunity awaits!",
    "Building your brand starts here!",
    "Success is just one step away!",
    "Let's unlock your potential together!",
    "Your career journey begins now!",
    "Excellence is a habit, not an act!",
    "Dream big, achieve bigger!"
  ];

  // Handle speech messages based on interactions
  useEffect(() => {
    let message = '';
    
    if (interactions.onEnter) {
      message = "Welcome to Brandentifier! 👋";
    } else if (interactions.onFeaturePoint) {
      message = "This feature will accelerate your growth!";
    } else if (interactions.onCelebrate) {
      message = "Excellent choice! Let's get started! 🎉";
    } else if (interactions.onHover) {
      message = careerTips[Math.floor(Math.random() * careerTips.length)];
    }
    
    if (message) {
      setSpeechMessage(message);
      setShowSpeech(true);
      
      const timer = setTimeout(() => {
        setShowSpeech(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [interactions]);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
        
        {/* Speech Bubble */}
        <SpeechBubble 
          message={speechMessage}
          visible={showSpeech}
          position={[0, 3, 0]}
        />
        
        {/* Robot Body */}
        <RobotBody 
          mousePosition={mousePosition}
          interactions={interactions}
          containerRef={containerRef}
        />
      </Canvas>
      
      {/* Text overlay for speech (fallback) */}
      {showSpeech && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg max-w-xs text-center text-sm font-medium z-50">
          {speechMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      )}
    </div>
  );
}