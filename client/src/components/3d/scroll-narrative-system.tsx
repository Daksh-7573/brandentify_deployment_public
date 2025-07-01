import { useRef, useEffect, useState, ReactNode } from 'react';
import { gsap } from 'gsap';

interface ScrollNarrativeSystemProps {
  children: ReactNode;
  onStoryProgress?: (progress: number) => void;
}

export function ScrollNarrativeSystem({ children, onStoryProgress }: ScrollNarrativeSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Create scroll-based progress tracking
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / documentHeight, 1);
      setStoryProgress(progress);
      onStoryProgress?.(progress);
    };

    // Create floating elements animation
    const createFloatingElements = () => {
      const floatingElements = container.querySelectorAll('[data-float]');
      
      floatingElements.forEach((element, index) => {
        const amplitude = parseFloat(element.getAttribute('data-float') || '20');
        const delay = index * 0.2;
        
        gsap.to(element, {
          y: amplitude,
          duration: 3 + (index * 0.5),
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
          delay
        });
        
        // Add rotation for more dynamic movement
        gsap.to(element, {
          rotation: 5,
          duration: 4 + (index * 0.3),
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
          delay: delay + 1
        });
      });
    };

    // Create entrance animations for sections with Intersection Observer
    const createSectionAnimations = () => {
      const sections = container.querySelectorAll('[data-section]');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target;
            const animationType = section.getAttribute('data-animation') || 'fadeUp';
            
            let fromVars: any = {};
            let toVars: any = {};
            
            switch (animationType) {
              case 'fadeUp':
                fromVars = { opacity: 0, y: 100 };
                toVars = { opacity: 1, y: 0 };
                break;
              case 'slideLeft':
                fromVars = { opacity: 0, x: 100 };
                toVars = { opacity: 1, x: 0 };
                break;
              case 'scale':
                fromVars = { opacity: 0, scale: 0.8 };
                toVars = { opacity: 1, scale: 1 };
                break;
              case 'rotate':
                fromVars = { opacity: 0, rotation: -90 };
                toVars = { opacity: 1, rotation: 0 };
                break;
            }
            
            gsap.fromTo(section, fromVars, {
              ...toVars,
              duration: 1,
              ease: "back.out(1.7)"
            });
            
            observer.unobserve(section);
          }
        });
      }, { threshold: 0.1 });
      
      sections.forEach(section => observer.observe(section));
      
      return observer;
    };

    // Create card cascade animations
    const createCardAnimations = () => {
      const cardContainers = container.querySelectorAll('[data-cards]');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardContainer = entry.target;
            const cards = cardContainer.querySelectorAll('[data-card]');
            
            gsap.fromTo(cards, 
              { 
                opacity: 0, 
                y: 60,
                scale: 0.9,
                rotationX: -45
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                rotationX: 0,
                duration: 0.8,
                ease: "back.out(1.7)",
                stagger: 0.1
              }
            );
            
            observer.unobserve(cardContainer);
          }
        });
      }, { threshold: 0.1 });
      
      cardContainers.forEach(container => observer.observe(container));
      
      return observer;
    };

    // Create magnetic cursor effects
    const createMagneticEffects = () => {
      const magneticElements = container.querySelectorAll('[data-magnetic]');
      
      magneticElements.forEach((element) => {
        const strength = parseFloat(element.getAttribute('data-magnetic') || '0.3');
        
        element.addEventListener('mousemove', (e: any) => {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (e.clientX - centerX) * strength;
          const deltaY = (e.clientY - centerY) * strength;
          
          gsap.to(element, {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease: "power2.out"
          });
        });
        
        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
          });
        });
      });
    };

    // Initialize all animations
    const sectionObserver = createSectionAnimations();
    const cardObserver = createCardAnimations();
    createFloatingElements();
    createMagneticEffects();

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      sectionObserver?.disconnect();
      cardObserver?.disconnect();
    };
  }, [onStoryProgress]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full"
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800/50 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${storyProgress * 100}%` }}
        />
      </div>

      {/* Parallax background layers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Layer 1 - Slowest */}
        <div 
          data-parallax="0.1"
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)'
          }}
        />
        
        {/* Layer 2 - Medium */}
        <div 
          data-parallax="0.3"
          className="absolute inset-0 opacity-10"
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`
              }}
              data-float="30"
            />
          ))}
        </div>
        
        {/* Layer 3 - Fastest */}
        <div 
          data-parallax="0.5"
          className="absolute inset-0 opacity-5"
        >
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 border border-purple-400 rounded-full opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              data-float="50"
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}