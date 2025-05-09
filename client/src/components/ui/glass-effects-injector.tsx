import React, { useEffect } from 'react';
import { useGlassEffects } from '@/contexts/GlassEffectsContext';
import { useGlassEffectStyles } from '@/hooks/use-glass-effect-styles';

/**
 * This component injects global CSS variables for glass effects
 * It should be mounted at the application root to ensure glass effects
 * are applied application-wide
 */
export const GlassEffectsInjector: React.FC = () => {
  // This will apply the settings to the :root element
  useGlassEffectStyles();

  // Apply additional CSS classes based on settings when needed
  const { settings } = useGlassEffects();

  useEffect(() => {
    // Use data attributes instead of classes for better compatibility
    // Set the current glass variant
    document.body.setAttribute('data-glass-variant', settings.variant);
    
    // Set the background effect
    document.body.setAttribute('data-glass-effect', settings.backgroundEffect);
    
    // Set the blur strength
    document.body.setAttribute('data-glass-blur', settings.blurStrength);
    
    // Set the transparency level
    document.body.setAttribute('data-glass-transparency', settings.transparency);
    
    // Set the background intensity
    document.body.setAttribute('data-glass-intensity', settings.backgroundIntensity);
    
    // Cleanup function
    return () => {
      document.body.removeAttribute('data-glass-variant');
      document.body.removeAttribute('data-glass-effect');
      document.body.removeAttribute('data-glass-blur');
      document.body.removeAttribute('data-glass-transparency');
      document.body.removeAttribute('data-glass-intensity');
    };
  }, [settings]);

  // This component doesn't render anything visible
  return null;
};

export default GlassEffectsInjector;