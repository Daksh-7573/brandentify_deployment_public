import React, { useEffect, useState, useRef, useCallback } from 'react';

interface ScrollNarrativeSystemProps {
  children: React.ReactNode;
  onSectionChange?: (section: string) => void;
}

interface Section {
  id: string;
  element: HTMLElement;
  progress: number;
  isVisible: boolean;
}

export default function ScrollNarrativeSystem({ children, onSectionChange }: ScrollNarrativeSystemProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Enhanced scroll handler with narrative progression
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    
    // Overall scroll progress
    const progress = Math.min(scrollTop / documentHeight, 1);
    setScrollProgress(progress);

    // Calculate section progress
    setSections(prevSections => 
      prevSections.map(section => {
        const rect = section.element.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        const elementHeight = rect.height;
        
        // Calculate how much of the element is visible
        const startVisible = elementTop - windowHeight;
        const endVisible = elementTop + elementHeight;
        
        let sectionProgress = 0;
        if (scrollTop > startVisible && scrollTop < endVisible) {
          sectionProgress = (scrollTop - startVisible) / (endVisible - startVisible);
        } else if (scrollTop >= endVisible) {
          sectionProgress = 1;
        }

        return {
          ...section,
          progress: Math.max(0, Math.min(1, sectionProgress)),
          isVisible: rect.top < windowHeight && rect.bottom > 0
        };
      })
    );
  }, []);

  // Initialize intersection observer for sections
  useEffect(() => {
    if (!containerRef.current) return;

    const sectionElements = containerRef.current.querySelectorAll('[data-section]');
    
    const newSections: Section[] = Array.from(sectionElements).map(element => ({
      id: element.getAttribute('data-section') || '',
      element: element as HTMLElement,
      progress: 0,
      isVisible: false
    }));

    setSections(newSections);

    // Set up intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId && sectionId !== currentSection) {
              setCurrentSection(sectionId);
              onSectionChange?.(sectionId);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    newSections.forEach(section => {
      observerRef.current?.observe(section.element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [currentSection, onSectionChange]);

  // Add scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Apply scroll-based transformations
  useEffect(() => {
    sections.forEach(section => {
      const element = section.element;
      const progress = section.progress;

      // Parallax effect based on progress
      const parallaxOffset = progress * 50;
      element.style.transform = `translateY(${parallaxOffset}px)`;

      // Fade in effect
      const opacity = Math.min(1, progress * 2);
      element.style.opacity = opacity.toString();

      // Scale effect for dramatic entrance
      const scale = 0.8 + (progress * 0.2);
      element.style.transform += ` scale(${scale})`;

      // Rotation effect for some sections
      if (section.id === 'features') {
        const rotation = (progress - 0.5) * 5;
        element.style.transform += ` rotateX(${rotation}deg)`;
      }

      // Blur effect that clears as it comes into view
      const blurAmount = Math.max(0, (1 - progress) * 10);
      element.style.filter = `blur(${blurAmount}px)`;
    });
  }, [sections]);

  return (
    <div ref={containerRef} className="relative">
      {/* Scroll progress indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800/20 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Scroll-based particle effects */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + Math.sin(scrollProgress * Math.PI * 2 + i) * 30}%`,
              transform: `translateY(${scrollProgress * -100}px) scale(${0.5 + scrollProgress * 0.5})`,
              opacity: Math.sin(scrollProgress * Math.PI * 4 + i) * 0.5 + 0.5,
              transition: 'all 0.1s ease-out'
            }}
          />
        ))}
      </div>

      {/* Section-based narrative text */}
      <div className="fixed bottom-8 left-8 z-40 max-w-md">
        <div className="bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg border border-white/20 transition-all duration-500">
          {currentSection === 'hero' && (
            <p className="text-sm">Welcome to the future of career development! Let me show you around...</p>
          )}
          {currentSection === 'features' && (
            <p className="text-sm">These amazing features will transform your professional journey. Each one is designed with you in mind!</p>
          )}
          {currentSection === 'cta' && (
            <p className="text-sm">Ready to begin? Your career transformation starts with a single click!</p>
          )}
        </div>
      </div>

      {/* Enhanced micro-interactions overlay */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {/* Dynamic light beams following scroll */}
        <div 
          className="absolute w-1 bg-gradient-to-b from-blue-400/40 to-transparent"
          style={{
            height: '200px',
            left: `${20 + scrollProgress * 60}%`,
            top: `${scrollProgress * 80}%`,
            transform: `rotate(${scrollProgress * 45}deg)`,
            opacity: scrollProgress
          }}
        />
        <div 
          className="absolute w-1 bg-gradient-to-b from-purple-400/40 to-transparent"
          style={{
            height: '150px',
            right: `${20 + scrollProgress * 40}%`,
            top: `${20 + scrollProgress * 60}%`,
            transform: `rotate(${-scrollProgress * 30}deg)`,
            opacity: scrollProgress * 0.8
          }}
        />

        {/* Scroll-triggered sparkles */}
        {sections.map((section, index) => (
          section.isVisible && (
            <div
              key={section.id}
              className="absolute text-2xl animate-ping"
              style={{
                left: `${30 + index * 15}%`,
                top: `${40 + section.progress * 20}%`,
                animationDelay: `${index * 0.2}s`,
                opacity: section.progress
              }}
            >
              ✨
            </div>
          )
        ))}
      </div>

      {children}
    </div>
  );
}