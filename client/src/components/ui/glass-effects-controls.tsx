import React from 'react';
import { 
  Sliders,
  Droplets,
  Fingerprint,
  WandSparkles,
  Layers,
  Sparkles,
  X,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { useGlassEffects, GlassVariant, BlurStrength, TransparencyLevel, BackgroundEffect, BackgroundIntensity } from '@/contexts/GlassEffectsContext';

interface SelectOptionProps {
  value: string;
  label: string;
  current: string;
  onChange: (value: any) => void;
  icon?: React.ReactNode;
}

// SelectOption component for dropdowns
const SelectOption: React.FC<SelectOptionProps> = ({ value, label, current, onChange, icon }) => (
  <div 
    className={`px-3 py-2 rounded-md cursor-pointer flex items-center gap-2 transition-all ${
      current === value 
        ? 'bg-primary/20 text-gray-800 dark:text-white font-medium' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
    }`}
    onClick={() => onChange(value)}
  >
    {icon && <span className="text-primary">{icon}</span>}
    {label}
  </div>
);

// Main controls component
export const GlassEffectsControls: React.FC = () => {
  const { settings, updateSettings, toggleControls, applyThemePreset } = useGlassEffects();

  // Variant options with icons
  const variantOptions: {value: GlassVariant, label: string, icon: React.ReactNode}[] = [
    { value: 'default', label: 'Default', icon: <Layers size={16} /> },
    { value: 'frosted', label: 'Frosted Glass', icon: <Droplets size={16} /> },
    { value: 'ultra', label: 'Ultra Glass', icon: <WandSparkles size={16} /> },
    { value: 'cosmic', label: 'Cosmic Glass', icon: <Sparkles size={16} /> },
    { value: 'colored', label: 'Colored Glass', icon: <Palette size={16} /> },
    { value: 'dark', label: 'Dark Glass', icon: <Fingerprint size={16} /> },
  ];

  // Blur strength options
  const blurOptions: {value: BlurStrength, label: string}[] = [
    { value: 'none', label: 'None' },
    { value: 'sm', label: 'Subtle' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Strong' },
    { value: 'xl', label: 'Heavy' },
    { value: '2xl', label: 'Maximum' },
  ];

  // Transparency options
  const transparencyOptions: {value: TransparencyLevel, label: string}[] = [
    { value: 'none', label: 'None' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'ultra', label: 'Ultra' },
  ];

  // Background effect options
  const backgroundEffectOptions: {value: BackgroundEffect, label: string}[] = [
    { value: 'none', label: 'None' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'glow', label: 'Glow' },
    { value: 'noise', label: 'Noise' },
    { value: 'pattern', label: 'Pattern' },
  ];

  // Background intensity options
  const backgroundIntensityOptions: {value: BackgroundIntensity, label: string}[] = [
    { value: 'none', label: 'None' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  // Theme preset options
  const themePresets = [
    { id: 'default', name: 'Default', color: '#667EEA' },
    { id: 'galaxy', name: 'Galaxy', color: '#BB6DFF' },
    { id: 'minimal', name: 'Minimal', color: '#9CA3AF' },
    { id: 'corporate', name: 'Corporate', color: '#0EA5E9' },
    { id: 'creative', name: 'Creative', color: '#F43F5E' },
  ];

  if (!settings.isControlsOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => toggleControls()}
      >
        <motion.div
          className="w-full max-w-2xl mx-4"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard
            variant="frosted"
            blurStrength="lg"
            transparency="low"
            backgroundEffect="gradient"
            className="relative p-0 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Vision Pro Inspired UI Controls</h2>
              </div>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => toggleControls()}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Theme Presets */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme Presets</h3>
                <div className="flex flex-wrap gap-2">
                  {themePresets.map((preset) => (
                    <button
                      key={preset.id}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                        (
                          preset.id === 'galaxy' && settings.variant === 'frosted' && settings.backgroundEffect === 'noise' ||
                          preset.id === 'minimal' && settings.variant === 'default' && settings.backgroundEffect === 'none' ||
                          preset.id === 'corporate' && settings.variant === 'ultra' ||
                          preset.id === 'creative' && settings.variant === 'cosmic' ||
                          preset.id === 'default' && settings.variant === 'default' && settings.backgroundEffect === 'none' && settings.blurStrength === 'md'
                        ) ? 'ring-2 ring-offset-2 ring-primary/50 dark:ring-primary/70 ring-offset-white dark:ring-offset-gray-900' : ''
                      }`}
                      style={{ 
                        backgroundColor: `${preset.color}15`, 
                        color: preset.color,
                        border: `1px solid ${preset.color}30`
                      }}
                      onClick={() => applyThemePreset(preset.id as any)}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }}></span>
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Glass Variant */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Glass Variant</h3>
                  <div className="space-y-1 bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                    {variantOptions.map((option) => (
                      <SelectOption 
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        current={settings.variant}
                        onChange={(value) => updateSettings({ variant: value as GlassVariant })}
                        icon={option.icon}
                      />
                    ))}
                  </div>
                </div>

                {/* Visual Effects */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Visual Effects</h3>
                  
                  {/* Blur Strength */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">Blur Strength</label>
                    <div className="flex flex-wrap gap-1.5">
                      {blurOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`px-2 py-1 text-xs rounded-md ${
                            settings.blurStrength === option.value
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => updateSettings({ blurStrength: option.value })}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Transparency */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">Transparency</label>
                    <div className="flex flex-wrap gap-1.5">
                      {transparencyOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`px-2 py-1 text-xs rounded-md ${
                            settings.transparency === option.value
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => updateSettings({ transparency: option.value })}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Background Effect */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">Background Effect</label>
                    <div className="flex flex-wrap gap-1.5">
                      {backgroundEffectOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`px-2 py-1 text-xs rounded-md ${
                            settings.backgroundEffect === option.value
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => updateSettings({ backgroundEffect: option.value })}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Background Intensity */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">Background Intensity</label>
                    <div className="flex flex-wrap gap-1.5">
                      {backgroundIntensityOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`px-2 py-1 text-xs rounded-md ${
                            settings.backgroundIntensity === option.value
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => updateSettings({ backgroundIntensity: option.value })}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <GlassButton 
                variant="outline" 
                size="sm"
                onClick={() => toggleControls()}
              >
                Close
              </GlassButton>
              <GlassButton 
                variant="glass-dark" 
                size="sm"
                onClick={() => toggleControls()}
              >
                Apply Changes
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Floating toggle button for glass controls
export const GlassEffectsToggle: React.FC = () => {
  const { toggleControls } = useGlassEffects();

  return (
    <motion.button
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleControls}
    >
      <Sliders className="w-5 h-5" />
    </motion.button>
  );
};