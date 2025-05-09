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
    // Add a class to the body to indicate the current glass variant
    document.body.classList.remove(
      'variant-default',
      'variant-frosted', 
      'variant-ultra', 
      'variant-cosmic', 
      'variant-colored',
      'variant-dark'
    );
    document.body.classList.add(`variant-${settings.variant}`);

    // Add a class for the background effect
    document.body.classList.remove(
      'effect-none',
      'effect-gradient',
      'effect-glow',
      'effect-noise',
      'effect-pattern'
    );
    document.body.classList.add(`effect-${settings.backgroundEffect}`);

    // Add a class for the blur strength
    document.body.classList.remove(
      'blur-none',
      'blur-sm',
      'blur-md',
      'blur-lg',
      'blur-xl',
      'blur-2xl'
    );
    document.body.classList.add(`blur-${settings.blurStrength}`);

    // Add a class for transparency
    document.body.classList.remove(
      'transparency-none',
      'transparency-low',
      'transparency-medium',
      'transparency-high',
      'transparency-ultra'
    );
    document.body.classList.add(`transparency-${settings.transparency}`);

  }, [settings]);

  // This component doesn't render anything visible
  return null;
};

export default GlassEffectsInjector;