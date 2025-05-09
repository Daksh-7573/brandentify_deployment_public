import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { 
  Zap, 
  User, 
  ChevronRight, 
  Bell, 
  Shield, 
  BookOpen, 
  Award,
  Users,
  Briefcase,
  Lightbulb,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Palette,
  Wand2,
  Eye,
  Layers,
  Droplets,
  LayoutGrid,
  Sliders,
  Fingerprint
} from 'lucide-react';

// Load themes from theme.json
import themeData from '../../../theme.json';

// Type definitions for theme data
interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  accent: string;
  muted: string;
  glass: string;
  glassDark: string;
  shadow: string;
  border: string;
  highlight: string;
  glassBg: string;
  glassDarkBg: string;
}

interface ThemeEffects {
  glassEffect: string;
  glassDarkEffect: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  glowEffect: string;
}

interface DarkTheme {
  name: string;
  displayName: string;
  colors: ThemeColors;
  effects: ThemeEffects;
}

// Glass Effect Showcase components
const BlurStrength = ({ title, strength, active, onClick }: { 
  title: string; 
  strength: string; 
  active: boolean;
  onClick: () => void;
}) => (
  <button 
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
      active 
        ? 'bg-primary text-white' 
        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
    onClick={onClick}
  >
    {title}
  </button>
);

const EffectSelector = ({ title, effect, active, onClick }: { 
  title: string;
  effect: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button 
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-primary text-white' 
        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
    onClick={onClick}
  >
    {effect === 'none' && <Eye className="h-4 w-4" />}
    {effect === 'gradient' && <Layers className="h-4 w-4" />}
    {effect === 'noise' && <Fingerprint className="h-4 w-4" />}
    {effect === 'glow' && <Wand2 className="h-4 w-4" />}
    {effect === 'refraction' && <Droplets className="h-4 w-4" />}
    {title}
  </button>
);

// Demo component for Vision Pro-inspired UI
const DesignSystemDemo: React.FC = () => {
  // State for theme selection
  const [theme, setTheme] = useState<'light' | string>('light');
  const [themeStyles, setThemeStyles] = useState<Record<string, string>>({});
  
  // States for glass configuration
  const [blurStrength, setBlurStrength] = useState<"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl">("md");
  const [transparency, setTransparency] = useState<"low" | "medium" | "high" | "ultra">("low");
  const [backgroundEffect, setBackgroundEffect] = useState<"none" | "gradient" | "noise" | "glow" | "refraction">("none");
  const [backgroundIntensity, setBackgroundIntensity] = useState<"low" | "medium" | "high">("medium");
  const [selectedCardVariant, setSelectedCardVariant] = useState<string>("ultraGlass");

  // Get available dark themes from theme.json
  const darkThemes: DarkTheme[] = themeData.darkThemes || [];
  
  // Apply selected theme styles
  useEffect(() => {
    const applyTheme = () => {
      let styles: Record<string, string> = {};
      let selectedTheme: DarkTheme | null = null;
      
      if (theme === 'light') {
        // Reset to light theme (default styles)
        document.documentElement.classList.remove('dark');
        document.documentElement.style.setProperty('--bg-gradient', 'linear-gradient(to bottom right, #F9FAFF, rgba(225, 229, 255, 0.2))');
      } else {
        // Apply dark theme
        document.documentElement.classList.add('dark');
        
        // Find the selected dark theme
        selectedTheme = darkThemes.find(t => t.name === theme) || null;
        
        if (selectedTheme) {
          // Set up background gradient based on the theme
          document.documentElement.style.setProperty(
            '--bg-gradient', 
            `linear-gradient(to bottom right, ${selectedTheme.colors.background}, ${selectedTheme.colors.tertiary})`
          );
          
          // Apply CSS variables for the theme
          Object.entries(selectedTheme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, value);
            styles[key] = value;
          });
        }
      }
      
      setThemeStyles(styles);
    };
    
    applyTheme();
    
    // Cleanup function to reset styles when component unmounts
    return () => {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.removeProperty('--bg-gradient');
      
      // Reset any custom CSS variables
      if (theme !== 'light') {
        const selectedTheme = darkThemes.find(t => t.name === theme);
        if (selectedTheme) {
          Object.keys(selectedTheme.colors).forEach(key => {
            document.documentElement.style.removeProperty(`--${key}`);
          });
        }
      }
    };
  }, [theme, darkThemes]);

  // Available card variants for glass effects showcase
  const cardVariants = [
    { id: 'ultraGlass', name: 'Ultra Glass' },
    { id: 'frosted', name: 'Frosted Glass' },
    { id: 'cosmic', name: 'Cosmic Glass' },
    { id: 'transparent', name: 'Transparent' },
  ];

  // Available transparency levels
  const transparencyLevels = [
    { id: 'low', name: 'Low' },
    { id: 'medium', name: 'Medium' },
    { id: 'high', name: 'High' },
    { id: 'ultra', name: 'Ultra' },
  ];

  // Available blur strengths
  const blurStrengths = [
    { id: 'none', name: 'None' },
    { id: 'sm', name: 'Small' },
    { id: 'md', name: 'Medium' },
    { id: 'lg', name: 'Large' },
    { id: 'xl', name: 'X-Large' },
    { id: '2xl', name: '2X-Large' },
    { id: '3xl', name: '3X-Large' },
  ];

  // Background effects
  const backgroundEffects = [
    { id: 'none', name: 'None' },
    { id: 'gradient', name: 'Gradient' },
    { id: 'noise', name: 'Noise Texture' },
    { id: 'glow', name: 'Inner Glow' },
    { id: 'refraction', name: 'Refraction' },
  ];

  // Intensity options
  const intensityLevels = [
    { id: 'low', name: 'Low' },
    { id: 'medium', name: 'Medium' },
    { id: 'high', name: 'High' },
  ];

  return (
    <div 
      className="min-h-screen p-6 sm:p-8 lg:p-12 transition-all duration-300 relative"
      style={{ 
        backgroundImage: theme === 'light' 
          ? 'url("/images/pattern-bg.svg")'
          : 'url("/images/pattern-bg-dark.svg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Vision Pro Inspired Design System
          </h1>
          <p className="text-gray-500 dark:text-gray-300 max-w-3xl mx-auto">
            Modern, minimalist UI components with depth, glassmorphism, and subtle animations for a spatial computing experience.
          </p>
          
          {/* Theme Selector */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <GlassButton 
              variant={theme === 'light' ? 'primary' : 'outline'} 
              size="pill-sm" 
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </GlassButton>
            
            {darkThemes.map((darkTheme) => (
              <GlassButton 
                key={darkTheme.name}
                variant={theme === darkTheme.name ? 'primary' : 'outline'} 
                size="pill-sm" 
                onClick={() => setTheme(darkTheme.name)}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                {darkTheme.displayName}
              </GlassButton>
            ))}
          </div>
        </div>

        {/* Theme Info Section */}
        {theme !== 'light' && (
          <section className="mb-16">
            <GlassCard 
              variant={theme === 'light' ? 'colored' : 'dark'} 
              className="mb-8"
            >
              <div className="flex flex-col md:flex-row gap-4 items-start p-2">
                <div className="p-3 rounded-full bg-primary/20 dark:bg-primary/30">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {darkThemes.find(t => t.name === theme)?.displayName} Theme Applied
                  </h2>
                  <p className="text-gray-500 dark:text-gray-300 mt-1">
                    Experiencing the {darkThemes.find(t => t.name === theme)?.displayName} color scheme with subtle depth and glass effects
                  </p>
                </div>
              </div>
            </GlassCard>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(themeStyles).slice(0, 12).map(([key, value]) => (
                <div 
                  key={key} 
                  className="flex flex-col items-center p-3 rounded-lg overflow-hidden"
                  style={{ backgroundColor: value }}
                >
                  <span className="text-xs font-mono mt-2 bg-black/30 text-white px-2 py-1 rounded-full">
                    {key}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Glass Effects Showcase Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Vision Pro Inspired Glass Effects</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Controls Column */}
            <div className="lg:col-span-1 space-y-8">
              <GlassCard 
                variant={theme === 'light' ? 'default' : 'dark'} 
                size="lg"
                blurStrength="md"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-full bg-primary/20 dark:bg-primary/30">
                    <Sliders className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Glass Effect Controls</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                      Customize the glass effects to see Vision Pro-inspired UI in action
                    </p>
                  </div>
                </div>
                
                {/* Card Variant Selection */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Glass Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {cardVariants.map(variant => (
                      <button
                        key={variant.id}
                        className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          selectedCardVariant === variant.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedCardVariant(variant.id)}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Transparency Selection */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Transparency Level</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {transparencyLevels.map(level => (
                      <button
                        key={level.id}
                        className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          transparency === level.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setTransparency(level.id as any)}
                      >
                        {level.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Blur Strength Selection */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Blur Strength</h4>
                  <div className="flex flex-wrap gap-2">
                    {blurStrengths.map(strength => (
                      <BlurStrength
                        key={strength.id}
                        title={strength.name}
                        strength={strength.id}
                        active={blurStrength === strength.id}
                        onClick={() => setBlurStrength(strength.id as any)}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Background Effects Selection */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Background Effects</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {backgroundEffects.map(effect => (
                      <EffectSelector
                        key={effect.id}
                        title={effect.name}
                        effect={effect.id}
                        active={backgroundEffect === effect.id}
                        onClick={() => setBackgroundEffect(effect.id as any)}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Intensity Selection (only if background effect is set) */}
                {backgroundEffect !== 'none' && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Effect Intensity</h4>
                    <div className="flex gap-2">
                      {intensityLevels.map(level => (
                        <button
                          key={level.id}
                          className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            backgroundIntensity === level.id
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => setBackgroundIntensity(level.id as any)}
                        >
                          {level.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
            
            {/* Preview Column */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-6">
                {/* Large Preview */}
                <GlassCard
                  variant={selectedCardVariant as any}
                  size="lg"
                  blurStrength={blurStrength}
                  transparency={transparency}
                  backgroundEffect={backgroundEffect}
                  backgroundIntensity={backgroundIntensity}
                  elevation="floating"
                  className="min-h-[240px] transition-all duration-300 relative"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Glass Effect Preview</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                        This is a real-time preview of the Vision Pro inspired glass effect with your selected settings.
                      </p>
                      <GlassButton variant="primary" size="pill">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Interactive Glass Button
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
                
                {/* Small Cards Showcase */}
                <div className="grid grid-cols-2 gap-4">
                  <GlassCard
                    variant={selectedCardVariant as any}
                    size="md"
                    blurStrength={blurStrength}
                    transparency={transparency}
                    backgroundEffect={backgroundEffect === 'none' ? 'gradient' : backgroundEffect}
                    backgroundIntensity={backgroundIntensity}
                    elevation="raised"
                    className="h-[180px] flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Protected View</h4>
                    </div>
                  </GlassCard>
                  
                  <GlassCard
                    variant={selectedCardVariant as any}
                    size="md"
                    blurStrength={blurStrength}
                    transparency={transparency}
                    backgroundEffect={backgroundEffect === 'none' ? 'glow' : backgroundEffect}
                    backgroundIntensity={backgroundIntensity}
                    elevation="raised"
                    className="h-[180px] flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                        <LayoutGrid className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Spatial View</h4>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transparency Showcase */}
        <section className="mb-16 relative">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Transparency & Blur Showcase</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="relative h-64 overflow-hidden rounded-2xl border border-white/20">
              {/* Background content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white">Background Content</h3>
                  <p className="text-white/80 mt-2">This text is behind the glass panels</p>
                </div>
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary"></div>
                  <div className="h-12 w-12 rounded-lg bg-accent"></div>
                  <div className="h-12 w-12 rounded-lg bg-success"></div>
                </div>
              </div>
              
              {/* Glass overlay panels with different blur and transparency */}
              <div className="absolute right-0 top-0 w-3/4 h-1/2 p-4">
                <GlassCard
                  variant="ultraGlass"
                  blurStrength="sm"
                  transparency="low"
                  className="h-full"
                >
                  <div className="flex items-center h-full justify-center">
                    <div className="text-center">
                      <p className="text-sm font-semibold dark:text-white">Subtle Blur</p>
                      <p className="text-xs text-gray-500 dark:text-gray-300">backdrop-blur-sm</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
              
              <div className="absolute left-0 bottom-0 w-3/5 h-3/5 p-4">
                <GlassCard
                  variant="frosted"
                  blurStrength="2xl"
                  transparency="medium"
                  className="h-full"
                >
                  <div className="flex items-center h-full justify-center">
                    <div className="text-center">
                      <p className="text-sm font-semibold dark:text-white">Heavy Blur</p>
                      <p className="text-xs text-gray-500 dark:text-gray-300">backdrop-blur-2xl</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
            
            <div className="relative h-64 overflow-hidden rounded-2xl border border-white/20">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2) 2px, transparent 0)',
                  backgroundSize: '30px 30px'
                }}></div>
              </div>
              
              {/* Overlapping transparent cards */}
              <div className="absolute left-4 top-4 w-2/3 h-1/2">
                <GlassCard
                  variant="ultraGlass"
                  blurStrength="lg"
                  transparency="high"
                  className="h-full"
                >
                  <div className="flex items-center h-full justify-center">
                    <div className="text-center">
                      <p className="text-sm font-semibold dark:text-white">High Transparency</p>
                      <p className="text-xs text-gray-500 dark:text-gray-300">bg-opacity-30</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
              
              <div className="absolute right-4 bottom-4 w-2/3 h-1/2">
                <GlassCard
                  variant="ultraGlass"
                  blurStrength="xl"
                  transparency="ultra"
                  className="h-full"
                >
                  <div className="flex items-center h-full justify-center">
                    <div className="text-center">
                      <p className="text-sm font-semibold dark:text-white">Ultra Transparency</p>
                      <p className="text-xs text-gray-500 dark:text-gray-300">bg-opacity-10</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
              
              <div className="absolute left-1/4 top-1/4 right-1/4 bottom-1/4">
                <GlassCard
                  variant="cosmic"
                  blurStrength="md"
                  backgroundEffect="glow"
                  className="h-full"
                >
                  <div className="flex items-center h-full justify-center">
                    <div className="text-center">
                      <p className="text-sm font-semibold dark:text-white">Glow Effect</p>
                      <p className="text-xs text-gray-500 dark:text-gray-300">Inner illumination</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
          
          {/* Vision Pro-style Cards with Depth */}
          <div className="relative h-40 overflow-hidden rounded-2xl border border-white/20 mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10"></div>
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 40px 40px, rgba(255,255,255,0.1) 1px, transparent 0)',
                backgroundSize: '50px 50px'
              }}></div>
              
              <div className="flex space-x-4">
                {[...Array(5)].map((_, index) => (
                  <div 
                    key={index} 
                    className="relative"
                    style={{ transform: `translateZ(${(index + 1) * 5}px)` }}
                  >
                    <GlassCard
                      variant={index % 2 === 0 ? "frosted" : "cosmic"}
                      blurStrength={["sm", "md", "lg", "xl", "2xl"][index % 5] as any}
                      transparency={["low", "medium", "high", "ultra", "low"][index % 5] as any}
                      elevation="floating"
                      className={`w-28 h-28 flex items-center justify-center transform transition-all duration-500 ${
                        index === 2 ? 'scale-110 shadow-lg shadow-primary/20 z-10' : ''
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-800 dark:text-white">{index + 1}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">Layer</div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </section>
        
        {/* Galaxy Theme Showcase - Vision Pro Inspired */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Vision Pro Inspired Galaxy Theme</h2>
          
          <GlassCard 
            variant="frosted" 
            blurStrength="md"
            transparency="medium"
            backgroundEffect="noise"
            backgroundIntensity="medium"
            className="p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Selected Theme Settings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Theme</span>
                    <span className="font-medium text-primary">Galaxy</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Glass Variant</span>
                    <span className="font-medium text-primary">Frosted Glass</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Transparency Level</span>
                    <span className="font-medium text-primary">Medium</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Blur Strength</span>
                    <span className="font-medium text-primary">Medium</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Background Effect</span>
                    <span className="font-medium text-primary">Noise Texture</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Galaxy Color Palette</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md p-3 flex flex-col items-center" style={{ backgroundColor: '#BB6DFF' }}>
                    <span className="text-xs font-mono mt-1 bg-black/30 text-white px-2 py-0.5 rounded-full">Primary</span>
                  </div>
                  <div className="rounded-md p-3 flex flex-col items-center" style={{ backgroundColor: '#52B5F9' }}>
                    <span className="text-xs font-mono mt-1 bg-black/30 text-white px-2 py-0.5 rounded-full">Secondary</span>
                  </div>
                  <div className="rounded-md p-3 flex flex-col items-center" style={{ backgroundColor: '#667FFF' }}>
                    <span className="text-xs font-mono mt-1 bg-black/30 text-white px-2 py-0.5 rounded-full">Accent</span>
                  </div>
                  <div className="rounded-md p-3 flex flex-col items-center" style={{ backgroundColor: '#42D392' }}>
                    <span className="text-xs font-mono mt-1 bg-black/30 text-white px-2 py-0.5 rounded-full">Success</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center">
              <GlassButton variant="glass-dark" size="pill" glow="active" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Galaxy Theme with Glass Dark Button
              </GlassButton>
            </div>
          </GlassCard>
          
          {/* Layer 3 Demo */}
          <div className="relative h-48 overflow-hidden rounded-2xl border border-white/20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
            
            {/* Background elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/30 backdrop-blur-sm flex items-center justify-center text-white">
                  Layer 1
                </div>
                <div className="w-16 h-16 rounded-lg bg-secondary/30 backdrop-blur-sm flex items-center justify-center text-white">
                  Layer 2
                </div>
                <div className="w-16 h-16 rounded-lg bg-accent/30 backdrop-blur-sm flex items-center justify-center text-white">
                  Base
                </div>
              </div>
            </div>
            
            {/* Layer 3 - Highlighted */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <GlassCard
                variant="frosted"
                blurStrength="md"
                transparency="medium"
                backgroundEffect="noise"
                backgroundIntensity="medium"
                elevation="floating"
                className="w-36 h-36 flex items-center justify-center shadow-lg shadow-primary/30 ring-2 ring-primary/20 ring-offset-2 ring-offset-background/30 transform scale-110"
              >
                <div className="text-center">
                  <div className="font-bold text-white mb-1">Layer 3</div>
                  <div className="text-xs text-gray-200">Selected Layer</div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>
        
        {/* Card Variants Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Glass Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard variant="default" className="relative dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Personal Profile</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Manage your professional details</p>
                </div>
              </div>
              <div className="absolute bottom-4 right-4">
                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              </div>
            </GlassCard>

            <GlassCard 
              variant="colored" 
              elevation="floating" 
              interactive={true}
              backgroundEffect="gradient"
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Stay updated with latest activity</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-full">
                3 New
              </div>
            </GlassCard>

            <GlassCard 
              variant="dark" 
              className="text-white"
              backgroundEffect="glow"
              backgroundIntensity="low"
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Career Protection</h3>
                  <p className="text-sm text-gray-300 mt-1">Secure your career growth</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard 
              variant="frosted" 
              elevation="raised" 
              className="border-primary/20 dark:border-primary/30"
              blurStrength="xl"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Learning Path</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Tailored education resources</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Button Variants Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Button Variants</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <GlassButton variant="default">Default</GlassButton>
              <GlassButton variant="primary">Primary</GlassButton>
              <GlassButton variant="secondary">Secondary</GlassButton>
              <GlassButton variant="outline">Outline</GlassButton>
              <GlassButton variant="glass">Glass</GlassButton>
              <GlassButton variant="glass-dark">Glass Dark</GlassButton>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
              <GlassButton variant="primary" size="pill" glow="subtle" className="flex gap-2">
                <Zap className="h-4 w-4" /> New Pulse
              </GlassButton>
              <GlassButton variant="outline" size="pill-lg">
                View Portfolio
              </GlassButton>
              <GlassButton variant="glass" size="pill-sm" glow="active">
                Quick Actions
              </GlassButton>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Feature Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard 
              variant={theme === 'light' ? 'default' : 'dark'} 
              size="lg" 
              elevation="floating" 
              className="h-full"
              backgroundEffect="gradient"
              backgroundIntensity="low"
            >
              <div className="flex flex-col h-full">
                <div className={`bg-gradient-to-br ${theme === 'light' ? 'from-primary/20 to-accent/20' : 'from-primary/30 to-accent/30'} p-4 rounded-xl mb-4 w-fit`}>
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Career Capsule</h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm flex-grow">
                  Plan your next 5 years with clarity. AI-powered career growth roadmap with realistic milestones.
                </p>
                <GlassButton 
                  variant={theme === 'light' ? 'glass' : 'glass-dark'} 
                  size="pill-sm" 
                  className="mt-4 w-full justify-between"
                >
                  <span>Explore Career Capsule</span>
                  <ChevronRight className="h-4 w-4" />
                </GlassButton>
              </div>
            </GlassCard>
            
            <GlassCard 
              variant={theme === 'light' ? 'default' : 'dark'} 
              size="lg" 
              elevation="floating" 
              className="h-full"
              backgroundEffect="noise"
              backgroundIntensity="low"
            >
              <div className="flex flex-col h-full">
                <div className={`${theme === 'light' ? 'bg-gradient-to-br from-indigo-100 to-purple-100' : 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30'} p-4 rounded-xl mb-4 w-fit`}>
                  <Users className={`h-8 w-8 ${theme === 'light' ? 'text-indigo-500' : 'text-indigo-300'}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Mentorship Connect</h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm flex-grow">
                  Connect with industry experts who can guide your career path based on real experience.
                </p>
                <GlassButton 
                  variant={theme === 'light' ? 'glass' : 'glass-dark'} 
                  size="pill-sm" 
                  className="mt-4 w-full justify-between"
                >
                  <span>Find Mentors</span>
                  <ChevronRight className="h-4 w-4" />
                </GlassButton>
              </div>
            </GlassCard>
            
            <GlassCard 
              variant={theme === 'light' ? 'default' : 'dark'} 
              size="lg" 
              elevation="floating" 
              className="h-full"
              backgroundEffect="glow"
              backgroundIntensity="low"
            >
              <div className="flex flex-col h-full">
                <div className={`${theme === 'light' ? 'bg-gradient-to-br from-blue-100 to-cyan-100' : 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30'} p-4 rounded-xl mb-4 w-fit`}>
                  <Briefcase className={`h-8 w-8 ${theme === 'light' ? 'text-blue-500' : 'text-blue-300'}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Shadow Resume</h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm flex-grow">
                  Your living CV powered by AI. Analyze strengths, suggest improvements, and track your growth.
                </p>
                <GlassButton 
                  variant={theme === 'light' ? 'glass' : 'glass-dark'} 
                  size="pill-sm" 
                  className="mt-4 w-full justify-between"
                >
                  <span>View Shadow Resume</span>
                  <ChevronRight className="h-4 w-4" />
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Hero Card Section */}
        <section>
          <GlassCard 
            variant={theme === 'light' ? 'colored' : 'dark'} 
            size="xl" 
            className="relative overflow-hidden border-primary/30"
            blurStrength="lg"
            backgroundEffect="refraction"
            backgroundIntensity="medium"
          >
            <div className="absolute inset-0 z-0">
              <div className={`absolute inset-0 bg-gradient-to-br ${theme === 'light' ? 'from-primary/20 via-secondary/20 to-transparent' : 'from-primary/30 via-secondary/30 to-transparent'} opacity-50`} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-black/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-primary mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>New Feature</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Discover Your Career Path With Musk AI
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
                  Turn your career growth into an interactive AI-guided journey with personalized advice, skills analysis, and opportunity mapping.
                </p>
                <div className="flex flex-wrap gap-3">
                  <GlassButton variant="primary" size="pill" glow="subtle">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Get Career Advice
                  </GlassButton>
                  <GlassButton variant={theme === 'light' ? 'glass' : 'glass-dark'} size="pill">
                    Learn More
                  </GlassButton>
                </div>
              </div>
              <div className="w-full md:w-2/5 flex justify-center md:justify-end">
                <div className={`${theme === 'light' ? 'bg-white/40' : 'bg-white/10'} backdrop-blur-md p-1 rounded-xl border ${theme === 'light' ? 'border-white/50' : 'border-white/10'} shadow-xl`}>
                  <div className={`${theme === 'light' ? 'bg-primary/5' : 'bg-primary/10'} rounded-lg p-6 relative`}>
                    <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      AI Powered
                    </div>
                    <div className="flex flex-col gap-3 min-w-[240px]">
                      <div className={`${theme === 'light' ? 'bg-white/80' : 'bg-white/20'} p-3 rounded-lg shadow-sm`}>
                        <h4 className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-300'} mb-1`}>Current Position</h4>
                        <p className="text-sm font-semibold dark:text-white">Senior UX Designer</p>
                      </div>
                      <div className={`${theme === 'light' ? 'bg-white/80' : 'bg-white/20'} p-3 rounded-lg shadow-sm`}>
                        <h4 className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-300'} mb-1`}>Target Position</h4>
                        <p className="text-sm font-semibold dark:text-white">Design Director</p>
                      </div>
                      <div className={`${theme === 'light' ? 'bg-white/80' : 'bg-white/20'} p-3 rounded-lg shadow-sm`}>
                        <h4 className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-300'} mb-1`}>Timeline</h4>
                        <p className="text-sm font-semibold dark:text-white">3 Years</p>
                      </div>
                      <div className="flex justify-end">
                        <GlassButton variant="primary" size="sm">
                          Start Planning
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>
      </div>
    </div>
  );
};

export default DesignSystemDemo;