import { useEffect, useRef } from 'react';
import {
  initSparkleTrail,
  initTiltCards,
  createAmbientAuras,
  animateXpBar,
  triggerLevelUp,
  animateBadgeUnlock
} from '@/lib/animation-utils';

/**
 * Hook to easily add Lumos Flow animations to components
 */
export function useLumosAnimations() {
  const initialized = useRef(false);
  
  /**
   * Initialize all animations when component mounts
   */
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    // Initialize basic animations with a slight delay to ensure DOM is ready
    setTimeout(() => {
      initSparkleTrail();
      initTiltCards();
    }, 500);
    
  }, []);
  
  /**
   * Initialize ambient background auras in the specified container
   * @param containerSelector CSS selector for the container element
   * @param count Number of aura elements to create
   */
  const initAmbientAuras = (containerSelector: string, count: number = 3) => {
    setTimeout(() => {
      createAmbientAuras(containerSelector, count);
    }, 100);
  };
  
  /**
   * Animate an XP progress bar with the specified percentage
   * @param selector CSS selector for the XP bar
   * @param percent Percentage to fill (0-100)
   */
  const animateXp = (selector: string, percent: number) => {
    animateXpBar(selector, percent);
  };
  
  /**
   * Trigger a level-up animation with confetti effect
   * @param selector CSS selector for the element to animate
   */
  const levelUp = (selector: string) => {
    triggerLevelUp(selector);
  };
  
  /**
   * Animate a badge unlock with floating effect and halo
   * @param selector CSS selector for the badge element
   */
  const unlockBadge = (selector: string) => {
    animateBadgeUnlock(selector);
  };

  /**
   * Add page transition animation classes
   * @param pageRef React ref to the page component
   */
  const pageTransition = (pageRef: React.RefObject<HTMLElement>) => {
    if (!pageRef.current) return;
    
    // Add the transition class
    pageRef.current.classList.add('page-transition-fade');
    
    // Remove it after animation to avoid conflicts with other animations
    setTimeout(() => {
      if (pageRef.current) {
        pageRef.current.classList.remove('page-transition-fade');
      }
    }, 1000);
  };
  
  /**
   * Set up modal animations (glassy backdrop with float-up content)
   * @param backdropRef React ref to the modal backdrop
   * @param contentRef React ref to the modal content
   */
  const setupModalAnimation = (
    backdropRef: React.RefObject<HTMLElement>,
    contentRef: React.RefObject<HTMLElement>
  ) => {
    if (backdropRef.current) {
      backdropRef.current.classList.add('modal-backdrop');
    }
    
    if (contentRef.current) {
      contentRef.current.classList.add('modal-content');
    }
  };
  
  /**
   * Apply card stack fly-in animation to a container of cards
   * @param containerSelector CSS selector for the container element
   */
  const animateCardStack = (containerSelector: string) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const cards = container.querySelectorAll('.card, .card-stack-item');
    
    cards.forEach((card) => {
      card.classList.add('card-stack-item', 'entering');
    });
  };
  
  /**
   * Apply parallax slide animation for tab/section transitions
   * @param containerSelector CSS selector for the container element
   * @param enteringSelector CSS selector for entering content
   * @param exitingSelector CSS selector for exiting content (optional)
   */
  const animateParallaxSlide = (
    containerSelector: string,
    enteringSelector: string,
    exitingSelector?: string
  ) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    // Add container class
    container.classList.add('slide-parallax-container');
    
    // Animate entering content
    const entering = container.querySelector(enteringSelector);
    if (entering) {
      entering.classList.add('slide-parallax-item', 'entering');
    }
    
    // Animate exiting content if provided
    if (exitingSelector) {
      const exiting = container.querySelector(exitingSelector);
      if (exiting) {
        exiting.classList.add('slide-parallax-item', 'exiting');
      }
    }
  };

  return {
    initAmbientAuras,
    animateXp,
    levelUp,
    unlockBadge,
    pageTransition,
    setupModalAnimation,
    animateCardStack,
    animateParallaxSlide
  };
}