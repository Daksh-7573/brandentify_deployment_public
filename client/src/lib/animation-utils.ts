/**
 * Lumos Flow Animation Utilities
 * Helper functions to apply dynamic animations in the Brandentifier platform
 */

/**
 * Creates a sparkle trail effect that follows the mouse cursor
 * @param selector CSS selector for elements that should trigger the effect
 */
export function initSparkleTrail(selector: string = '.sparkle-trigger') {
  if (typeof window === 'undefined') return;

  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    element.addEventListener('mousemove', (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create sparkle element
      const sparkle = document.createElement('div');
      sparkle.classList.add('sparkle-trail');
      sparkle.style.top = `${y}px`;
      sparkle.style.left = `${x}px`;
      
      // Random size
      const size = 3 + Math.random() * 7;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      
      // Random color from our theme
      const colors = ['#AEE6E6', '#FFD6C0', '#E4D7FA', '#B7E4C7'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.background = randomColor;
      
      // Add to DOM
      target.appendChild(sparkle);
      
      // Animate and remove
      setTimeout(() => {
        sparkle.style.opacity = '0.7';
        sparkle.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px) scale(${Math.random() * 0.5 + 0.5})`;
        
        setTimeout(() => {
          sparkle.remove();
        }, 700);
      }, 10);
    });
  });
}

/**
 * Applies a 3D tilt effect to cards based on mouse position
 * @param selector CSS selector for elements that should have the tilt effect
 */
export function initTiltCards(selector: string = '.tilt-card') {
  if (typeof window === 'undefined') return;

  const cards = document.querySelectorAll(selector);
  
  cards.forEach(card => {
    const element = card as HTMLElement;
    
    element.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation based on mouse position
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateY = ((x - centerX) / centerX) * 5; // Max 5deg rotation
      const rotateX = ((centerY - y) / centerY) * 5; // Max 5deg rotation
      
      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    element.addEventListener('mouseleave', () => {
      // Reset transform on mouse leave
      element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
    
    // Add click handler for card flip if it has front/back
    if (element.querySelector('.tilt-card-front') && element.querySelector('.tilt-card-back')) {
      element.addEventListener('click', () => {
        element.classList.toggle('flipped');
      });
    }
  });
}

/**
 * Creates ambient aura elements that float slowly in the background
 * @param container CSS selector for the container element
 * @param count Number of aura elements to create
 */
export function createAmbientAuras(container: string = '.ambient-container', count: number = 3) {
  if (typeof window === 'undefined') return;
  
  const containerEl = document.querySelector(container);
  if (!containerEl) return;
  
  // Colors from our theme
  const colors = [
    'rgba(174, 230, 230, 0.15)', // Sky Blush
    'rgba(255, 214, 192, 0.15)', // Peach Mist
    'rgba(228, 215, 250, 0.15)'  // Soft Lavender
  ];
  
  for (let i = 0; i < count; i++) {
    const aura = document.createElement('div');
    aura.classList.add('ambient-aura');
    
    // Random starting position
    const left = 20 + Math.random() * 60; // 20-80% of container width
    const top = 20 + Math.random() * 60; // 20-80% of container height
    
    aura.style.left = `${left}%`;
    aura.style.top = `${top}%`;
    aura.style.background = colors[i % colors.length];
    
    // Random size
    const size = 200 + Math.random() * 200; // 200-400px
    aura.style.width = `${size}px`;
    aura.style.height = `${size}px`;
    
    // Random animation duration
    const duration = 15 + Math.random() * 15; // 15-30s
    aura.style.animationDuration = `${duration}s`;
    
    // Random animation delay
    const delay = Math.random() * 10; // 0-10s
    aura.style.animationDelay = `${delay}s`;
    
    containerEl.appendChild(aura);
  }
}

/**
 * Animates XP progress bar with liquid fill effect
 * @param selector CSS selector for the XP bar element
 * @param percent Percentage to fill (0-100)
 */
export function animateXpBar(selector: string, percent: number) {
  if (typeof window === 'undefined') return;
  
  const xpBar = document.querySelector(selector);
  if (!xpBar) return;
  
  const fill = xpBar.querySelector('.xp-fill') as HTMLElement;
  if (!fill) return;
  
  // Set the fill percentage as a CSS variable
  fill.style.setProperty('--fill-percent', `${percent}%`);
  fill.classList.add('animate');
}

/**
 * Trigger a level-up animation with confetti
 * @param selector CSS selector for the element to animate
 */
export function triggerLevelUp(selector: string) {
  if (typeof window === 'undefined') return;
  
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) return;
  
  // Add level-up effect classes
  element.classList.add('level-up-active');
  
  // Create confetti
  for (let i = 0; i < 30; i++) {
    createConfetti(element);
  }
  
  // Remove class after animation
  setTimeout(() => {
    element.classList.remove('level-up-active');
  }, 2000);
}

/**
 * Creates a confetti particle
 * @param container Element to append confetti to
 */
function createConfetti(container: HTMLElement) {
  // Colors from our theme
  const colors = ['#AEE6E6', '#FFD6C0', '#E4D7FA', '#B7E4C7', '#FFB3AB'];
  
  const confetti = document.createElement('div');
  confetti.classList.add('confetti-piece');
  
  // Random position within container
  const left = Math.random() * 100;
  confetti.style.left = `${left}%`;
  
  // Random size
  const size = 5 + Math.random() * 10;
  confetti.style.width = `${size}px`;
  confetti.style.height = `${size}px`;
  
  // Random color
  confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
  
  // Random rotation
  const rotation = Math.random() * 360;
  confetti.style.transform = `rotate(${rotation}deg)`;
  
  // Random animation duration
  const duration = 1 + Math.random() * 2;
  confetti.style.animationDuration = `${duration}s`;
  
  // Add to container
  container.appendChild(confetti);
  
  // Remove after animation
  setTimeout(() => {
    confetti.remove();
  }, duration * 1000);
}

/**
 * Animate badge unlock with floating effect and halo
 * @param selector CSS selector for the badge element
 */
export function animateBadgeUnlock(selector: string) {
  if (typeof window === 'undefined') return;
  
  const badge = document.querySelector(selector) as HTMLElement;
  if (!badge) return;
  
  // Add badge unlock class
  badge.classList.add('badge-unlock');
  
  // Create halo effect
  const halo = document.createElement('div');
  halo.classList.add('badge-halo');
  badge.appendChild(halo);
  
  // Remove halo after animation
  setTimeout(() => {
    halo.remove();
  }, 2000);
}