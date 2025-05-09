import React from 'react';
import { useLocation } from 'wouter';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Sparkles, ArrowRight } from 'lucide-react';

const GlassDemoCard: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <GlassCard 
      variant="frosted"
      size="md"
      elevation="floating"
      blurStrength="md"
      transparency="medium"
      backgroundEffect="noise"
      backgroundIntensity="medium"
      className="w-full max-w-md mx-auto"
    >
      <div className="p-6 flex flex-col items-center">
        <div className="mb-4 bg-primary/30 p-3 rounded-full">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        
        <h2 className="text-xl font-bold text-center mb-2">
          Vision Pro Inspired UI
        </h2>
        
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Experience our fully customized glass interface with the settings you selected: 
          Frosted Glass, Medium Transparency, Medium Blur, and Noise Texture.
        </p>
        
        <GlassButton
          variant="glass-dark"
          size="lg"
          onClick={() => setLocation('/design-system')}
          className="group"
        >
          <span className="mr-2">View Full Demo</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </GlassButton>
      </div>
    </GlassCard>
  );
};

export default GlassDemoCard;