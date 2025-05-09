import React, { createContext, useContext, useState, useEffect } from 'react';

// Types for glass effect settings
export type GlassVariant = 'default' | 'frosted' | 'ultra' | 'cosmic' | 'colored' | 'dark';
export type BlurStrength = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type TransparencyLevel = 'none' | 'low' | 'medium' | 'high' | 'ultra';
export type BackgroundEffect = 'none' | 'gradient' | 'glow' | 'noise' | 'pattern';
export type BackgroundIntensity = 'none' | 'low' | 'medium' | 'high';

// Types for the context
export interface GlassEffectsSettings {
  variant: GlassVariant;
  blurStrength: BlurStrength;
  transparency: TransparencyLevel;
  backgroundEffect: BackgroundEffect;
  backgroundIntensity: BackgroundIntensity;
  isControlsOpen: boolean;
}

interface GlassEffectsContextType {
  settings: GlassEffectsSettings;
  updateSettings: (settings: Partial<GlassEffectsSettings>) => void;
  toggleControls: () => void;
  applyThemePreset: (preset: 'default' | 'galaxy' | 'minimal' | 'corporate' | 'creative') => void;
}

// Default settings
const defaultSettings: GlassEffectsSettings = {
  variant: 'default',
  blurStrength: 'md',
  transparency: 'medium',
  backgroundEffect: 'none',
  backgroundIntensity: 'medium',
  isControlsOpen: false,
};

// Galaxy theme preset settings
const galaxyPreset: GlassEffectsSettings = {
  variant: 'frosted',
  blurStrength: 'md',
  transparency: 'medium',
  backgroundEffect: 'noise',
  backgroundIntensity: 'medium',
  isControlsOpen: false,
};

// Minimal theme preset settings
const minimalPreset: GlassEffectsSettings = {
  variant: 'default',
  blurStrength: 'sm',
  transparency: 'low',
  backgroundEffect: 'none',
  backgroundIntensity: 'none',
  isControlsOpen: false,
};

// Corporate theme preset settings
const corporatePreset: GlassEffectsSettings = {
  variant: 'ultra',
  blurStrength: 'lg',
  transparency: 'high',
  backgroundEffect: 'gradient',
  backgroundIntensity: 'low',
  isControlsOpen: false,
};

// Creative theme preset settings
const creativePreset: GlassEffectsSettings = {
  variant: 'cosmic',
  blurStrength: 'xl',
  transparency: 'high',
  backgroundEffect: 'glow',
  backgroundIntensity: 'high',
  isControlsOpen: false,
};

// Create the context
const GlassEffectsContext = createContext<GlassEffectsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  toggleControls: () => {},
  applyThemePreset: () => {},
});

// Storage key for persisting settings
const STORAGE_KEY = 'glass_effects_settings';

// Provider component
export const GlassEffectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [settings, setSettings] = useState<GlassEffectsSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    }
    return defaultSettings;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  // Update settings function
  const updateSettings = (newSettings: Partial<GlassEffectsSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };

  // Toggle controls visibility
  const toggleControls = () => {
    setSettings(prev => ({
      ...prev,
      isControlsOpen: !prev.isControlsOpen,
    }));
  };

  // Apply theme presets
  const applyThemePreset = (preset: 'default' | 'galaxy' | 'minimal' | 'corporate' | 'creative') => {
    switch (preset) {
      case 'galaxy':
        setSettings({...galaxyPreset});
        break;
      case 'minimal':
        setSettings({...minimalPreset});
        break;
      case 'corporate':
        setSettings({...corporatePreset});
        break;
      case 'creative':
        setSettings({...creativePreset});
        break;
      default:
        setSettings({...defaultSettings});
    }
  };

  return (
    <GlassEffectsContext.Provider value={{ settings, updateSettings, toggleControls, applyThemePreset }}>
      {children}
    </GlassEffectsContext.Provider>
  );
};

// Custom hook to use the context
export const useGlassEffects = () => useContext(GlassEffectsContext);