/**
 * Neo-Glass UI Component Library
 * Based on modern glassmorphism design principles
 */

import React, { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import '../../../styles/neo-glass.css';

interface NeoGlassCardProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  glow?: 'primary' | 'secondary' | 'tertiary' | 'none';
  highlight?: boolean;
}

export const NeoGlassCard: React.FC<NeoGlassCardProps> = ({
  children,
  className,
  size = 'md',
  glow = 'none',
  highlight = false,
}) => {
  return (
    <div
      className={cn(
        'neo-glass-card',
        size && `${size}`,
        glow !== 'none' && `${glow}-glow`,
        highlight && 'highlight',
        className
      )}
    >
      {children}
    </div>
  );
};

interface NeoGlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'default';
  isIcon?: boolean;
}

export const NeoGlassButton: React.FC<NeoGlassButtonProps> = ({
  children,
  className,
  variant = 'default',
  isIcon = false,
  ...props
}) => {
  return (
    <button
      className={cn(
        'neo-glass-button',
        variant !== 'default' && variant,
        isIcon && 'neo-glass-icon-button',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

interface NeoGlassSwitchProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
  label?: string;
}

export const NeoGlassSwitch: React.FC<NeoGlassSwitchProps> = ({
  checked,
  onChange,
  className,
  label
}) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'neo-glass-switch',
          checked && 'active',
          className
        )}
        onClick={onChange}
        role="switch"
        aria-checked={checked}
      />
      {label && <span className="neo-glass-text-muted text-sm">{label}</span>}
    </div>
  );
};

interface NeoGlassProgressProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export const NeoGlassProgress: React.FC<NeoGlassProgressProps> = ({
  value,
  className,
  showLabel = false
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  return (
    <div className="w-full">
      <div className={cn('neo-glass-progress', className)}>
        <div 
          className="neo-glass-progress-bar" 
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-end mt-1">
          <span className="neo-glass-text-muted text-xs">{clampedValue}%</span>
        </div>
      )}
    </div>
  );
};

interface NeoGlassAvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export const NeoGlassAvatar: React.FC<NeoGlassAvatarProps> = ({
  src,
  alt,
  size = 64,
  className
}) => {
  return (
    <div 
      className={cn('neo-glass-avatar', className)}
      style={{ width: size, height: size }}
    >
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

interface NeoGlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
}

export const NeoGlassInput: React.FC<NeoGlassInputProps> = ({
  className,
  label,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block neo-glass-text-muted mb-1 text-sm">
          {label}
        </label>
      )}
      <input
        className={cn('neo-glass-input', className)}
        {...props}
      />
    </div>
  );
};

interface NeoGlassBadgeProps {
  children: ReactNode;
  className?: string;
}

export const NeoGlassBadge: React.FC<NeoGlassBadgeProps> = ({
  children,
  className,
}) => {
  return (
    <span className={cn('neo-glass-badge', className)}>
      {children}
    </span>
  );
};

interface NeoGlassMuskBubbleProps {
  message: string;
  className?: string;
}

export const NeoGlassMuskBubble: React.FC<NeoGlassMuskBubbleProps> = ({
  message,
  className,
}) => {
  return (
    <div className={cn('neo-glass-musk-bubble', className)}>
      {message}
    </div>
  );
};

interface NeoGlassSparkleProps {
  top?: string;
  left?: string;
  delay?: number;
  className?: string;
}

export const NeoGlassSparkle: React.FC<NeoGlassSparkleProps> = ({
  top = '0',
  left = '0',
  delay = 0,
  className,
}) => {
  return (
    <div 
      className={cn('neo-glass-sparkle', className)}
      style={{ 
        top, 
        left, 
        animationDelay: `${delay}s`
      }}
    />
  );
};

// Container with gradient background
interface NeoPageContainerProps {
  children: ReactNode;
  className?: string;
}

export const NeoPageContainer: React.FC<NeoPageContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('neo-page-bg', className)}>
      {children}
    </div>
  );
};