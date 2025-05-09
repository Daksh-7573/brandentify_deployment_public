import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const glassCardVariants = cva(
  "relative overflow-hidden border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-[rgba(45,45,45,0.4)] border-[rgba(255,255,255,0.12)] shadow-md dark:bg-[rgba(30,30,30,0.5)] dark:border-[rgba(255,255,255,0.08)]",
        dark: "bg-[rgba(25,25,25,0.5)] border-[rgba(255,255,255,0.08)] shadow-md hover:shadow-lg text-white",
        colored: "bg-primary/10 border-primary/20 shadow-md hover:shadow-lg",
        transparent: "bg-transparent border-[rgba(255,255,255,0.1)] shadow-none hover:bg-white/10",
        ultraGlass: "bg-[rgba(30,30,30,0.4)] border-[rgba(255,255,255,0.15)] dark:bg-[rgba(20,20,20,0.5)] dark:border-[rgba(255,255,255,0.1)]",
        frosted: "bg-[rgba(45,45,45,0.4)] border-[rgba(255,255,255,0.12)] dark:bg-[rgba(30,30,30,0.5)] dark:border-[rgba(255,255,255,0.1)]",
        cosmic: "bg-[rgba(35,35,45,0.4)] border-[rgba(100,120,255,0.15)] shadow-md shadow-primary/10",
        spatial: "bg-[rgba(30,30,30,0.5)] border-[rgba(255,255,255,0.12)] shadow-lg",
      },
      size: {
        sm: "p-3 rounded-2xl",
        md: "p-4 rounded-3xl",
        lg: "p-6 rounded-3xl",
        xl: "p-8 rounded-[32px]",
      },
      elevation: {
        flat: "shadow-none",
        raised: "shadow-md hover:shadow-lg",
        floating: "shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-1",
        glow: "shadow-lg shadow-primary/20 hover:shadow-primary/30",
      },
      interactive: {
        true: "hover:border-primary/30 hover:bg-opacity-50 cursor-pointer scale-100 hover:scale-[1.02]",
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
        low: "bg-opacity-30 dark:bg-opacity-30",  // More transparent
        medium: "bg-opacity-40 dark:bg-opacity-50", // Medium transparency (default)
        high: "bg-opacity-60 dark:bg-opacity-60",  // Less transparent
        ultra: "bg-opacity-80 dark:bg-opacity-80",  // Almost opaque
      }
    },
    defaultVariants: {
      variant: "frosted",
      size: "md",
      elevation: "raised",
      interactive: false,
      blurStrength: "lg", // Higher blur for Vision Pro style
      transparency: "medium",
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
      variant, 
      size, 
      elevation, 
      interactive, 
      blurStrength,
      transparency,
      children, 
      innerClassName,
      backgroundEffect = "noise",
      backgroundIntensity = "medium",
      ...props 
    }, 
    ref
  ) => {
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
        className={cn(
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
        {...props}
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