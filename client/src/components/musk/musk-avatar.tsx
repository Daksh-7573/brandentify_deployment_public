import React from 'react';
import { Sparkles } from 'lucide-react';

interface MuskAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withSparks?: boolean;
}

/**
 * Musk Avatar component - displays the Musk AI assistant avatar
 * with optional decoration/effects
 */
const MuskAvatar: React.FC<MuskAvatarProps> = ({ 
  size = 'md',
  withSparks = true
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
    xl: 'h-28 w-28'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Main avatar */}
      <div 
        className={`bg-gradient-to-br from-primary/80 to-primary rounded-full ${sizeClasses[size]} flex items-center justify-center relative overflow-hidden ring-4 ring-primary/20`}
      >
        {/* Use Musk image if available, otherwise show first letter */}
        <img 
          src="/images/musk-avatar.png" 
          alt="Musk AI Assistant"
          className="h-full w-full object-cover"
          onError={(e) => {
            // If image fails to load, show a fallback
            const target = e.target as HTMLElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML += '<span class="text-white font-bold text-xl">M</span>';
            }
          }}
        />
        
        {/* Lightning bolt effect if withSparks is true */}
        {withSparks && (
          <div className="absolute top-1 right-1">
            <Sparkles className="h-4 w-4 text-yellow-300" />
          </div>
        )}
      </div>
      
      {/* Pulsing effect */}
      <div 
        className={`absolute inset-0 rounded-full bg-primary animate-ping opacity-20 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default MuskAvatar;