import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassEffectsControls } from '@/components/ui/glass-effects-controls';
import { useGlassEffects } from '@/contexts/GlassEffectsContext';

const GlassEffectsDemo = () => {
  const { settings } = useGlassEffects();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-indigo-900 to-purple-950 p-8 flex flex-col gap-8 relative">
      {/* Background image for better glass effect visualization */}
      <div 
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: `url('/images/pattern-bg.svg')`,
          backgroundSize: 'cover'
        }}
      ></div>

      <header className="relative z-10">
        <GlassCard variant="frosted" size="lg" className="w-full max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Vision Pro Inspired Glass Effects</h1>
            <p className="text-lg opacity-80">Interactive demo of the customizable glass components</p>
          </div>
        </GlassCard>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 max-w-6xl mx-auto">
        <div className="md:col-span-1">
          <GlassCard className="sticky top-8 h-auto">
            <h2 className="text-xl font-bold mb-4">Controls</h2>
            <GlassEffectsControls />
          </GlassCard>
        </div>

        <div className="md:col-span-2 space-y-8">
          <GlassCard>
            <h2 className="text-xl font-bold mb-4">Current Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Variant:</p>
                <p>{settings.variant}</p>
              </div>
              <div>
                <p className="font-semibold">Blur:</p>
                <p>{settings.blurStrength}</p>
              </div>
              <div>
                <p className="font-semibold">Transparency:</p>
                <p>{settings.transparency}</p>
              </div>
              <div>
                <p className="font-semibold">Background Effect:</p>
                <p>{settings.backgroundEffect}</p>
              </div>
              <div>
                <p className="font-semibold">Background Intensity:</p>
                <p>{settings.backgroundIntensity}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-bold mb-6">Glass Card Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard 
                variant="default" 
                className="p-4 h-40 flex items-center justify-center"
                elevation="floating"
              >
                <div className="text-center">
                  <h3 className="font-semibold">Default Card</h3>
                  <p className="text-sm opacity-70">Using global settings</p>
                </div>
              </GlassCard>

              <GlassCard 
                variant="dark" 
                className="p-4 h-40 flex items-center justify-center"
                elevation="floating"
              >
                <div className="text-center">
                  <h3 className="font-semibold">Dark Card</h3>
                  <p className="text-sm opacity-70">Using global settings</p>
                </div>
              </GlassCard>

              <GlassCard 
                variant="colored" 
                className="p-4 h-40 flex items-center justify-center"
                elevation="glow"
              >
                <div className="text-center">
                  <h3 className="font-semibold">Colored Card</h3>
                  <p className="text-sm opacity-70">With glow effect</p>
                </div>
              </GlassCard>

              <GlassCard 
                variant="cosmic" 
                className="p-4 h-40 flex items-center justify-center"
                backgroundEffect="gradient"
              >
                <div className="text-center">
                  <h3 className="font-semibold">Cosmic Card</h3>
                  <p className="text-sm opacity-70">With gradient background</p>
                </div>
              </GlassCard>

              <GlassCard 
                className="p-4 h-40 flex items-center justify-center"
                backgroundEffect="noise"
              >
                <div className="text-center">
                  <h3 className="font-semibold">Noise Texture</h3>
                  <p className="text-sm opacity-70">Subtle noise background</p>
                </div>
              </GlassCard>

              <GlassCard 
                className="p-4 h-40 flex items-center justify-center"
                backgroundEffect="refraction"
              >
                <div className="text-center">
                  <h3 className="font-semibold">Refraction Effect</h3>
                  <p className="text-sm opacity-70">Animated light refraction</p>
                </div>
              </GlassCard>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-bold mb-6">Glass Button Examples</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <GlassButton variant="glass">Default Glass</GlassButton>
              <GlassButton variant="glass-dark">Dark Glass</GlassButton>
              <GlassButton variant="primary">Primary</GlassButton>
              <GlassButton variant="secondary">Secondary</GlassButton>
              <GlassButton variant="outline">Outline</GlassButton>
              <GlassButton variant="destructive">Destructive</GlassButton>
              <GlassButton variant="glass" glow="subtle">With Subtle Glow</GlassButton>
              <GlassButton variant="glass" glow="active">With Active Glow</GlassButton>
              <GlassButton variant="glass" size="pill">Pill Shape</GlassButton>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-bold mb-6">Content Card Example</h2>
            <GlassCard className="p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Spatial Computing Features</h3>
                <p className="mb-4">
                  Our platform integrates advanced Vision Pro inspired UI elements to create an 
                  immersive spatial computing experience.
                </p>
                <div className="flex gap-3 mt-4">
                  <GlassButton variant="glass">Learn More</GlassButton>
                  <GlassButton variant="outline">Documentation</GlassButton>
                </div>
              </div>
            </GlassCard>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default GlassEffectsDemo;