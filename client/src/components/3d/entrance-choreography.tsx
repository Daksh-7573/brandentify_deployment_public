import { useRef, useEffect, useState, ReactNode } from 'react';
import { gsap } from 'gsap';

interface EntranceChoreographyProps {
  children: ReactNode;
  onComplete?: () => void;
}

export function EntranceChoreography({ children, onComplete }: EntranceChoreographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Create master entrance timeline
    const masterTimeline = gsap.timeline({
      onComplete: () => {
        setAnimationComplete(true);
        onComplete?.();
      }
    });

    // Phase 1: Background reveal
    masterTimeline.fromTo(container,
      { 
        opacity: 0,
        scale: 1.1,
        filter: 'blur(20px)'
      },
      { 
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.5,
        ease: "power3.out"
      }
    );

    // Phase 2: Hero section dramatic entrance
    const heroElements = container.querySelectorAll('[data-hero]');
    heroElements.forEach((element, index) => {
      masterTimeline.fromTo(element,
        { 
          y: 100,
          opacity: 0,
          scale: 0.8,
          rotationX: -90
        },
        { 
          y: 0,
          opacity: 1,
          scale: 1,
          rotationX: 0,
          duration: 1.2,
          ease: "back.out(1.7)"
        },
        `-=${0.8 - (index * 0.2)}`
      );
    });

    // Phase 3: Feature cards cascade
    const featureCards = container.querySelectorAll('[data-feature-card]');
    featureCards.forEach((card, index) => {
      masterTimeline.fromTo(card,
        { 
          y: 80,
          opacity: 0,
          scale: 0.9,
          rotationY: -45
        },
        { 
          y: 0,
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 0.8,
          ease: "back.out(1.4)"
        },
        `-=${0.6 - (index * 0.1)}`
      );

      // Add individual card hover preparations
      card.addEventListener('mouseenter', () => {
        if (animationComplete) {
          gsap.to(card, {
            y: -20,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        if (animationComplete) {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
    });

    // Phase 4: Call-to-action spectacular entrance
    const ctaElements = container.querySelectorAll('[data-cta]');
    ctaElements.forEach((element, index) => {
      masterTimeline.fromTo(element,
        { 
          scale: 0,
          opacity: 0,
          rotation: 180
        },
        { 
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 1,
          ease: "elastic.out(1, 0.5)"
        },
        `-=${0.3 - (index * 0.1)}`
      );
    });

    // Phase 5: Particle burst finale
    const createParticleBurst = () => {
      const particleContainer = document.createElement('div');
      particleContainer.className = 'fixed inset-0 pointer-events-none z-50';
      document.body.appendChild(particleContainer);

      const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];
      
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-2 h-2 rounded-full';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = '50%';
        particle.style.top = '50%';
        particleContainer.appendChild(particle);

        gsap.to(particle, {
          x: (Math.random() - 0.5) * window.innerWidth,
          y: (Math.random() - 0.5) * window.innerHeight,
          opacity: 0,
          scale: 0,
          duration: 2,
          ease: "power2.out",
          delay: Math.random() * 0.5,
          onComplete: () => {
            particleContainer.removeChild(particle);
            if (particleContainer.children.length === 0) {
              document.body.removeChild(particleContainer);
            }
          }
        });
      }
    };

    masterTimeline.call(createParticleBurst, [], "-=0.5");

    // Continuous subtle animations after entrance
    masterTimeline.to({}, { duration: 0.5 }); // Pause

    // Add floating animations to specific elements
    const floatingElements = container.querySelectorAll('[data-float-continuous]');
    floatingElements.forEach((element, index) => {
      gsap.to(element, {
        y: 10,
        duration: 2 + (index * 0.3),
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: index * 0.2
      });
    });

    return () => {
      masterTimeline.kill();
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {children}
    </div>
  );
}