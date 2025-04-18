import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface MuskAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withSparks?: boolean;
}

/**
 * Musk Avatar component - displays the Musk AI assistant avatar
 * with optional decoration/effects
 */
const MuskAvatar = ({ size = 'md', withSparks = false }: MuskAvatarProps) => {
  const [pulsing, setPulsing] = useState(false);

  // Determine size classes based on size prop
  const sizeClasses = {
    sm: 'w-8 h-8', 
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  // Add periodic pulsing effect
  useEffect(() => {
    if (withSparks) {
      // Start pulsing every few seconds
      const interval = setInterval(() => {
        setPulsing(true);
        setTimeout(() => setPulsing(false), 1000);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [withSparks]);

  return (
    <div className="relative inline-block">
      {/* Main Avatar */}
      <div 
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${
          pulsing ? 'animate-pulse' : ''
        }`}
      >
        {/* "M" letter for Musk */}
        <span className="text-white font-bold" style={{ 
          fontSize: size === 'sm' ? '16px' : 
                   size === 'md' ? '20px' : 
                   size === 'lg' ? '28px' : '36px' 
        }}>
          M
        </span>
      </div>
      
      {/* Sparks decoration */}
      {withSparks && (
        <div className="absolute -top-2 -right-1">
          <Sparkles className={`
            text-yellow-400 
            ${size === 'sm' ? 'w-4 h-4' : 
              size === 'md' ? 'w-5 h-5' : 
              size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'}
          `} />
        </div>
      )}
    </div>
  );
};

export default MuskAvatar;