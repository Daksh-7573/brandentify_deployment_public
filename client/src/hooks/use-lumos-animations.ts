import { useCallback } from 'react';

/**
 * Lumos Animation System - Motion-driven interactions for the Animated Template
 * Code Name: Lumos Flow - Where Career Meets Joy
 */
export function useLumosAnimations() {
  /**
   * Creates ambient floating auras in the background
   * @param selector - The CSS selector for the container
   * @param count - Number of auras to create
   */
  const initAmbientAuras = useCallback((selector: string, count: number = 3) => {
    const container = document.querySelector(selector);
    if (!container) return;

    // Clear existing auras
    const existingAuras = container.querySelectorAll('.lumos-aura');
    existingAuras.forEach(aura => aura.remove());

    // Create new auras
    for (let i = 0; i < count; i++) {
      const aura = document.createElement('div');
      aura.classList.add('lumos-aura');
      
      // Randomize aura properties
      const size = Math.random() * 300 + 100; // 100-400px
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const hue = Math.floor(Math.random() * 60) + 220; // Blue/Purple hues
      const animDuration = Math.random() * 20 + 20; // 20-40s
      const delay = Math.random() * 5;
      
      // Apply styles
      Object.assign(aura.style, {
        width: `${size}px`,
        height: `${size}px`,
        left: `${posX}%`,
        top: `${posY}%`,
        background: `radial-gradient(circle, hsla(${hue}, 70%, 60%, 0.1) 0%, transparent 70%)`,
        animationDuration: `${animDuration}s`,
        animationDelay: `${delay}s`
      });
      
      container.appendChild(aura);
    }
  }, []);
  
  /**
   * Animates a staggered card stack to create depth
   * @param selector - CSS selector for the container
   */
  const animateCardStack = useCallback((selector: string) => {
    const container = document.querySelector(selector);
    if (!container) return;
    
    const cards = container.querySelectorAll('.project-card, .skill-card, .education-card');
    
    cards.forEach((card, index) => {
      card.classList.add('lumos-card');
      
      // Add interaction effects with timing based on index
      (card as HTMLElement).style.transitionDelay = `${index * 0.05}s`;
      
      // Add interactive hover state
      card.addEventListener('mouseenter', () => {
        const otherCards = Array.from(cards).filter(c => c !== card);
        otherCards.forEach(c => c.classList.add('lumos-card-dim'));
      });
      
      card.addEventListener('mouseleave', () => {
        cards.forEach(c => c.classList.remove('lumos-card-dim'));
      });
    });
  }, []);
  
  /**
   * Adds parallax slide animations for section transitions
   * @param sectionSelector - CSS selector for the section
   * @param contentSelector - CSS selector for the content container
   */
  const animateParallaxSlide = useCallback((sectionSelector: string, contentSelector: string) => {
    const section = document.querySelector(sectionSelector);
    if (!section) return;
    
    const content = section.querySelector(contentSelector);
    if (!content) return;
    
    // Add helper classes
    section.classList.add('lumos-section');
    content.classList.add('lumos-content');
    
    // Create parallax background if not present
    if (!section.querySelector('.lumos-parallax-bg')) {
      const bgElement = document.createElement('div');
      bgElement.classList.add('lumos-parallax-bg');
      section.insertBefore(bgElement, content);
    }
    
    // Set up scroll-triggered animations
    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how far the section is into the viewport
      const percentVisible = Math.min(
        Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)),
        1
      );
      
      // Apply transformation based on scroll position
      const translateY = 50 - (percentVisible * 50);
      const opacity = Math.min(1, percentVisible * 1.5);
      
      const bg = section.querySelector('.lumos-parallax-bg') as HTMLElement;
      if (bg) {
        bg.style.transform = `translateY(${translateY * 0.5}px)`;
        bg.style.opacity = `${opacity * 0.3}`;
      }
      
      (content as HTMLElement).style.transform = `translateY(${translateY * 0.2}px)`;
      (content as HTMLElement).style.opacity = `${opacity}`;
    };
    
    // Add event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call
    handleScroll();
    
    // Cleanup - this is just for reference, we're not using React effects here
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  /**
   * Adds sparkle effects to elements on interaction
   * @param selector - CSS selector for elements to apply sparkle effect to
   */
  const addSparkleEffect = useCallback((selector: string) => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(el => {
      el.classList.add('sparkle-trigger');
      
      el.addEventListener('mouseenter', () => {
        // Create sparkle elements
        for (let i = 0; i < 5; i++) {
          const sparkle = document.createElement('div');
          sparkle.classList.add('sparkle');
          
          // Randomize sparkle properties
          const size = Math.random() * 10 + 5; // 5-15px
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          const animDuration = Math.random() * 1 + 1; // 1-2s
          const delay = Math.random() * 0.5;
          
          // Apply styles
          Object.assign(sparkle.style, {
            width: `${size}px`,
            height: `${size}px`,
            left: `${posX}%`,
            top: `${posY}%`,
            animationDuration: `${animDuration}s`,
            animationDelay: `${delay}s`
          });
          
          el.appendChild(sparkle);
          
          // Remove sparkle after animation
          setTimeout(() => {
            sparkle.remove();
          }, (animDuration + delay) * 1000);
        }
      });
    });
  }, []);
  
  /**
   * Adds smooth typing effect to elements
   * @param selector - CSS selector for elements to apply typing effect to
   * @param speed - Speed of typing in milliseconds per character
   */
  const addTypingEffect = useCallback((selector: string, speed: number = 50) => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(el => {
      const text = el.textContent || '';
      el.textContent = '';
      el.classList.add('typing-text');
      
      let i = 0;
      const type = () => {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else {
          // Add blinking cursor effect after typing is complete
          el.classList.add('typing-done');
        }
      };
      
      // Start typing when element is in view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              type();
            }, 400); // Slight delay before typing starts
            observer.disconnect();
          }
        });
      });
      
      observer.observe(el);
    });
  }, []);
  
  /**
   * Adds 3D tilt effect to cards
   * @param selector - CSS selector for elements to apply 3D tilt effect to
   * @param intensity - Intensity of the tilt effect (default: 10)
   */
  const addTiltEffect = useCallback((selector: string, intensity: number = 10) => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(el => {
      el.classList.add('tilt-card');
      
      el.addEventListener('mousemove', (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = el.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left; // x position within the element
        const y = mouseEvent.clientY - rect.top; // y position within the element
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX; // -1 to 1
        const deltaY = (y - centerY) / centerY; // -1 to 1
        
        (el as HTMLElement).style.transform = `perspective(1000px) rotateX(${-deltaY * intensity}deg) rotateY(${deltaX * intensity}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      
      el.addEventListener('mouseleave', () => {
        (el as HTMLElement).style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }, []);
  
  return {
    initAmbientAuras,
    animateCardStack,
    animateParallaxSlide,
    addSparkleEffect,
    addTypingEffect,
    addTiltEffect,
  };
}