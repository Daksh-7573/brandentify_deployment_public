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
  Palette
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

// Demo component for Vision Pro-inspired UI
const DesignSystemDemo: React.FC = () => {
  // State for theme selection
  const [theme, setTheme] = useState<'light' | string>('light');
  const [themeStyles, setThemeStyles] = useState<Record<string, string>>({});

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

  return (
    <div 
      className="min-h-screen p-6 sm:p-8 lg:p-12 transition-colors duration-300"
      style={{ background: 'var(--bg-gradient, linear-gradient(to bottom right, #F9FAFF, rgba(225, 229, 255, 0.2)))' }}
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

            <GlassCard variant="colored" elevation="floating" interactive={true}>
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

            <GlassCard variant="dark" className="text-white">
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

            <GlassCard variant="transparent" elevation="raised" className="border border-primary/20 dark:border-primary/30">
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
            <GlassCard variant={theme === 'light' ? 'default' : 'dark'} size="lg" elevation="floating" className="h-full">
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
            
            <GlassCard variant={theme === 'light' ? 'default' : 'dark'} size="lg" elevation="floating" className="h-full">
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
            
            <GlassCard variant={theme === 'light' ? 'default' : 'dark'} size="lg" elevation="floating" className="h-full">
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