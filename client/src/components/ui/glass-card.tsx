import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { useGlassEffects } from '@/contexts/GlassEffectsContext';
import { useGlassEffectStyles } from '@/hooks/use-glass-effect-styles';

const glassCardVariants = cva(
  "relative overflow-hidden border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white/65 border-gray-200/50 shadow-sm hover:shadow-md dark:bg-gray-800/40 dark:border-gray-700/50",
        dark: "bg-gray-900/70 border-gray-700/50 shadow-md hover:shadow-lg text-white",
        colored: "bg-primary/10 border-primary/20 shadow-sm hover:shadow-md",
        transparent: "bg-transparent border-gray-200/30 shadow-none hover:bg-white/10 dark:hover:bg-white/5",
        ultraGlass: "bg-white/25 border-white/30 dark:bg-black/20 dark:border-white/10",
        frosted: "bg-white/80 border-white/50 dark:bg-gray-900/50 dark:border-gray-800/50",
        cosmic: "bg-primary/15 border-primary/30 shadow-md shadow-primary/10 dark:shadow-primary/20",
        ultra: "bg-white/25 border-white/30 dark:bg-black/20 dark:border-white/10", // Add Ultra variant to match settings type
      },
      size: {
        sm: "p-3 rounded-lg",
        md: "p-4 rounded-xl",
        lg: "p-6 rounded-2xl",
        xl: "p-8 rounded-3xl",
      },
      elevation: {
        flat: "shadow-none",
        raised: "shadow-md hover:shadow-lg",
        floating: "shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-1",
        glow: "shadow-lg shadow-primary/20 hover:shadow-primary/30",
      },
      interactive: {
        true: "hover:border-primary/30 hover:bg-white/75 dark:hover:bg-white/15 cursor-pointer",
        false: "",
      },
      blurStrength: {
        none: "",
        sm: "backdrop-blur-sm",
        md: "backdrop-blur-md",
        lg: "backdrop-blur-lg",
        xl: "backdrop-blur-xl",
        "2xl": "backdrop-blur-2xl",
        "3xl": "backdrop-blur-3xl",
      },
      transparency: {
        none: "",  // For compatibility with the global settings
        low: "",  // Use default transparency from variant
        medium: "!bg-opacity-50",
        high: "!bg-opacity-30",
        ultra: "!bg-opacity-10",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      elevation: "raised",
      interactive: false,
      blurStrength: "md",
      transparency: "low",
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean;
  innerClassName?: string;
  backgroundEffect?: "none" | "gradient" | "noise" | "glow" | "refraction";
  backgroundIntensity?: "low" | "medium" | "high";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { 
      className, 
      variant: propVariant, 
      size, 
      elevation, 
      interactive, 
      blurStrength: propBlurStrength,
      transparency: propTransparency,
      children, 
      innerClassName,
      backgroundEffect: propBackgroundEffect = "none",
      backgroundIntensity: propBackgroundIntensity = "medium",
      ...props 
    }, 
    ref
  ) => {
    // Get global glass effect settings
    const { settings } = useGlassEffects();
    const { cssVariables } = useGlassEffectStyles();
    
    // Use global settings or prop values with prop taking precedence
    const variant = propVariant || (settings.variant === 'ultra' ? 'frosted' : settings.variant) as any;
    const blurStrength = propBlurStrength || (settings.blurStrength === 'none' ? 'sm' : settings.blurStrength) as any;
    const transparency = propTransparency || (settings.transparency === 'none' ? 'low' : settings.transparency) as any;
    const backgroundEffect = propBackgroundEffect !== "none" ? propBackgroundEffect : settings.backgroundEffect as any;
    const backgroundIntensity = propBackgroundIntensity || settings.backgroundIntensity as any;
    
    // CSS custom properties will be automatically applied by the GlassEffectsInjector at the root level
    const inlineStyles = useMemo(() => {
      // No need to apply CSS variables here as they're now applied to :root
      return {
        style: props.style
      };
    }, [props.style]);
    
    // Determine background effect styles based on variant and effect type
    const renderBackgroundEffect = () => {
      if (backgroundEffect === "none") return null;
      
      if (backgroundEffect === "gradient") {
        return (
          <div 
            className={cn(
              "absolute inset-0 -z-10 bg-gradient-to-tr opacity-50",
              {
                "from-primary/20 via-primary/5 to-transparent blur-xl": variant !== "dark" && variant !== "cosmic",
                "from-primary/30 via-primary/10 to-transparent blur-2xl": variant === "cosmic",
                "from-gray-900/30 via-gray-800/20 to-transparent blur-xl": variant === "dark",
                "opacity-30": backgroundIntensity === "low",
                "opacity-50": backgroundIntensity === "medium",
                "opacity-70": backgroundIntensity === "high",
              }
            )}
          />
        );
      }
      
      if (backgroundEffect === "noise") {
        return (
          <div 
            className={cn(
              "absolute inset-0 -z-10 opacity-[0.15] mix-blend-overlay",
              {
                "opacity-[0.07]": backgroundIntensity === "low",
                "opacity-[0.15]": backgroundIntensity === "medium",
                "opacity-[0.25]": backgroundIntensity === "high",
              }
            )}
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
              backgroundSize: '150px'
            }}
          />
        );
      }
      
      if (backgroundEffect === "glow") {
        return (
          <div 
            className={cn(
              "absolute inset-0 -z-10 opacity-40 rounded-full blur-2xl",
              {
                "bg-primary/30": variant !== "dark",
                "bg-purple-500/20": variant === "cosmic",
                "bg-blue-500/20": variant === "dark",
                "opacity-20": backgroundIntensity === "low",
                "opacity-40": backgroundIntensity === "medium",
                "opacity-60": backgroundIntensity === "high",
              }
            )}
            style={{ 
              transform: 'translate(-20%, -20%) scale(1.5)'
            }}
          />
        );
      }
      
      if (backgroundEffect === "refraction") {
        return (
          <>
            <div 
              className={cn(
                "absolute inset-0 -z-10 opacity-30",
                {
                  "opacity-15": backgroundIntensity === "low",
                  "opacity-30": backgroundIntensity === "medium",
                  "opacity-50": backgroundIntensity === "high",
                }
              )}
              style={{ 
                backgroundImage: `linear-gradient(125deg, transparent 30%, rgba(255, 255, 255, 0.2) 31%, rgba(255, 255, 255, 0.2) 33%, transparent 33%)`,
                backgroundSize: '300% 300%',
                animation: 'refraction 10s ease-in-out infinite',
              }}
            />
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes refraction {
                  0% { background-position: 0% 0%; }
                  50% { background-position: 100% 100%; }
                  100% { background-position: 0% 0%; }
                }
              `
            }} />
          </>
        );
      }
      
      return null;
    };
    
    return (
      <div
        ref={ref}
        {...props}
        style={props.style}
        className={cn(
          "glass-card",
          glassCardVariants({ 
            variant, 
            size, 
            elevation, 
            interactive,
            blurStrength,
            transparency
          }),
          className
        )}
      >
        <div className={cn("relative z-10 h-full w-full", innerClassName)}>
          {children}
        </div>
        {renderBackgroundEffect()}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };