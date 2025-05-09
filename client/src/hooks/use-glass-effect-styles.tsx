import { useMemo } from 'react';
import { useGlassEffects } from '@/contexts/GlassEffectsContext';

/**
 * Hook that generates CSS styles based on the glass effects settings
 * Use this hook to apply global glass effect settings to any component
 */
export const useGlassEffectStyles = () => {
  const { settings } = useGlassEffects();
  
  // Generate CSS styles based on current settings
  const styles = useMemo(() => {
    // Base styles for all glass effects
    const baseStyles: Record<string, string> = {};
    
    // Apply blur based on blurStrength setting
    if (settings.blurStrength !== 'none') {
      const blurMap: Record<string, string> = {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      };
      baseStyles['--glass-blur'] = blurMap[settings.blurStrength] || '8px';
    } else {
      baseStyles['--glass-blur'] = '0px';
    }
    
    // Apply transparency level
    if (settings.transparency !== 'none') {
      const transparencyMap: Record<string, string> = {
        'low': '0.8',
        'medium': '0.65',
        'high': '0.45',
        'ultra': '0.25',
      };
      baseStyles['--glass-opacity'] = transparencyMap[settings.transparency] || '0.65';
    } else {
      baseStyles['--glass-opacity'] = '1';
    }
    
    // Apply background effect styles
    if (settings.backgroundEffect !== 'none') {
      const intensityMap: Record<string, string> = {
        'low': '0.1',
        'medium': '0.2',
        'high': '0.35',
      };
      const intensity = intensityMap[settings.backgroundIntensity] || '0.2';
      
      if (settings.backgroundEffect === 'gradient') {
        baseStyles['--glass-gradient-opacity'] = intensity;
      } else if (settings.backgroundEffect === 'glow') {
        baseStyles['--glass-glow-opacity'] = intensity;
      } else if (settings.backgroundEffect === 'noise') {
        baseStyles['--glass-noise-opacity'] = intensity;
      } else if (settings.backgroundEffect === 'pattern') {
        baseStyles['--glass-pattern-opacity'] = intensity;
      }
    }
    
    // Apply styles for the variant selected
    if (settings.variant === 'frosted') {
      baseStyles['--glass-backdrop-blur'] = baseStyles['--glass-blur'];
      baseStyles['--glass-background-opacity'] = '0.4';
      baseStyles['--glass-border-opacity'] = '0.2';
    } else if (settings.variant === 'ultra') {
      baseStyles['--glass-backdrop-blur'] = `calc(${baseStyles['--glass-blur']} * 1.5)`;
      baseStyles['--glass-background-opacity'] = '0.25';
      baseStyles['--glass-border-opacity'] = '0.25';
    } else if (settings.variant === 'cosmic') {
      baseStyles['--glass-backdrop-blur'] = baseStyles['--glass-blur'];
      baseStyles['--glass-background-opacity'] = '0.35';
      baseStyles['--glass-border-opacity'] = '0.3';
      baseStyles['--glass-shadow-opacity'] = '0.6';
    } else if (settings.variant === 'colored' || settings.variant === 'dark') {
      baseStyles['--glass-backdrop-blur'] = baseStyles['--glass-blur'];
      baseStyles['--glass-background-opacity'] = '0.5';
      baseStyles['--glass-border-opacity'] = '0.2';
    }
    
    return baseStyles;
  }, [settings]);

  // Generate CSS variable string for direct application to style attribute
  const cssVariables = useMemo(() => {
    return Object.entries(styles)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');
  }, [styles]);

  return {
    styles,
    cssVariables
  };
};