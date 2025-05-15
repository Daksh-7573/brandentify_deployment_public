import React, { ReactNode } from 'react';
import '../../../styles/neo-glass-main.css';

// Base container component with background
interface NeoGlassContainerProps {
  children: ReactNode;
  className?: string;
}

export const NeoGlassContainer = ({ children, className = '' }: NeoGlassContainerProps) => {
  return (
    <div className={`neo-glass-container ${className}`}>
      <div className="neo-glass-content">
        {children}
      </div>
    </div>
  );
};

// Panel component
interface NeoGlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const NeoGlassPanel = ({ children, className = '', style }: NeoGlassPanelProps) => {
  return (
    <div className={`neo-glass-panel ${className}`} style={style}>
      {children}
    </div>
  );
};

// Card component
interface NeoGlassCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glow?: 'primary' | 'secondary' | 'none';
}

export const NeoGlassCard = ({ 
  children, 
  className = '', 
  style,
  glow = 'none'
}: NeoGlassCardProps) => {
  const glowClass = glow === 'primary' ? 'shadow-[0_0_15px_rgba(30,215,96,0.3)]' : 
                   glow === 'secondary' ? 'shadow-[0_0_15px_rgba(80,100,255,0.3)]' : '';
                   
  return (
    <div className={`neo-glass-card ${glowClass} ${className}`} style={style}>
      {children}
    </div>
  );
};

// Button component
interface NeoGlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isIcon?: boolean;
  glow?: 'primary' | 'secondary' | 'none';
}

export const NeoGlassButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  type = 'button',
  disabled = false,
  isIcon = false,
  glow = 'none'
}: NeoGlassButtonProps) => {
  let variantClass = '';
  
  if (variant === 'secondary') {
    variantClass = 'secondary';
  } else if (variant === 'tertiary') {
    variantClass = 'bg-black/20 hover:bg-black/30 text-white border border-white/10';
  }
  
  const iconClass = isIcon ? 'p-2 flex items-center justify-center' : '';
  const glowClass = glow === 'primary' ? 'shadow-[0_0_15px_rgba(30,215,96,0.5)]' : 
                   glow === 'secondary' ? 'shadow-[0_0_15px_rgba(80,100,255,0.5)]' : '';
  
  return (
    <button
      type={type}
      className={`neo-glass-button ${variantClass} ${iconClass} ${glowClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Input component
interface NeoGlassInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
}

export const NeoGlassInput = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  name,
  id,
  required = false,
  disabled = false
}: NeoGlassInputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`neo-glass-input ${className}`}
      name={name}
      id={id}
      required={required}
      disabled={disabled}
    />
  );
};

// Select component
interface NeoGlassSelectProps {
  children: ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
}

export const NeoGlassSelect = ({ 
  children, 
  value, 
  onChange, 
  className = '',
  name,
  id,
  required = false,
  disabled = false
}: NeoGlassSelectProps) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`neo-glass-input ${className}`}
      name={name}
      id={id}
      required={required}
      disabled={disabled}
    >
      {children}
    </select>
  );
};

// Textarea component
interface NeoGlassTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export const NeoGlassTextarea = ({ 
  placeholder, 
  value, 
  onChange, 
  className = '',
  name,
  id,
  required = false,
  disabled = false,
  rows = 4
}: NeoGlassTextareaProps) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`neo-glass-input ${className}`}
      name={name}
      id={id}
      required={required}
      disabled={disabled}
      rows={rows}
    />
  );
};

// Label component
interface NeoGlassLabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export const NeoGlassLabel = ({ children, htmlFor, className = '' }: NeoGlassLabelProps) => {
  return (
    <label htmlFor={htmlFor} className={`block text-white mb-2 ${className}`}>
      {children}
    </label>
  );
};

// Form group component (label + input/select/textarea)
interface NeoGlassFormGroupProps {
  children: ReactNode;
  className?: string;
}

export const NeoGlassFormGroup = ({ children, className = '' }: NeoGlassFormGroupProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

// Form component
interface NeoGlassFormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export const NeoGlassForm = ({ children, onSubmit, className = '' }: NeoGlassFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};

// Header component
interface NeoGlassHeaderProps {
  children: ReactNode;
  className?: string;
}

export const NeoGlassHeader = ({ children, className = '' }: NeoGlassHeaderProps) => {
  return (
    <header className={`neo-glass-header p-4 ${className}`}>
      {children}
    </header>
  );
};

// Sidebar component
interface NeoGlassSidebarProps {
  children: ReactNode;
  className?: string;
}

export const NeoGlassSidebar = ({ children, className = '' }: NeoGlassSidebarProps) => {
  return (
    <aside className={`neo-glass-sidebar p-4 ${className}`}>
      {children}
    </aside>
  );
};

// Avatar component
interface NeoGlassAvatarProps {
  src?: string;
  alt: string;
  className?: string;
}

export const NeoGlassAvatar = ({ src, alt, className = '' }: NeoGlassAvatarProps) => {
  return (
    <div className={`neo-glass-avatar ${className}`}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <span>{alt.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
};

// Divider component
interface NeoGlassDividerProps {
  className?: string;
}

export const NeoGlassDivider = ({ className = '' }: NeoGlassDividerProps) => {
  return (
    <div className={`neo-glass-divider ${className}`} />
  );
};

// Badge component
interface NeoGlassBadgeProps {
  children: ReactNode;
  className?: string;
}

export const NeoGlassBadge = ({ children, className = '' }: NeoGlassBadgeProps) => {
  return (
    <span className={`neo-glass-badge ${className}`}>
      {children}
    </span>
  );
};

// Tabs component
interface NeoGlassTabsProps {
  children: ReactNode;
  className?: string;
}

export const NeoGlassTabs = ({ children, className = '' }: NeoGlassTabsProps) => {
  return (
    <div className={`neo-glass-tabs ${className}`}>
      {children}
    </div>
  );
};

// Tab component
interface NeoGlassTabProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NeoGlassTab = ({ 
  children, 
  active = false, 
  onClick, 
  className = '' 
}: NeoGlassTabProps) => {
  const activeClass = active ? 'active' : '';
  
  return (
    <div 
      className={`neo-glass-tab ${activeClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Modal component
interface NeoGlassModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
}

export const NeoGlassModal = ({ 
  children, 
  isOpen, 
  onClose, 
  title, 
  className = '' 
}: NeoGlassModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="neo-glass-modal-backdrop" onClick={onClose}>
      <div 
        className={`neo-glass-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="neo-glass-modal-header">
          <h2 className="neo-glass-modal-title">{title}</h2>
          <button className="neo-glass-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Musk AI-specific components
interface NeoGlassMuskBubbleProps {
  message: string;
  className?: string;
}

export const NeoGlassMuskBubble = ({ message, className = '' }: NeoGlassMuskBubbleProps) => {
  return (
    <div className={`bg-primary/20 backdrop-blur-sm py-2 px-3 rounded-xl max-w-[80%] ${className}`}>
      <p className="text-white text-sm">{message}</p>
    </div>
  );
};

interface NeoGlassSparkleProps {
  top?: string;
  left?: string;
  delay?: number;
  className?: string;
}

export const NeoGlassSparkle = ({ 
  top = '0', 
  left = '0',
  delay = 0,
  className = '' 
}: NeoGlassSparkleProps) => {
  const animationDelay = `${delay}s`;
  
  return (
    <div 
      className={`absolute w-3 h-3 rounded-full bg-white/60 blur-[1px] animate-pulse ${className}`}
      style={{ 
        top, 
        left,
        animationDelay
      }}
    />
  );
};

// Progress bar component
interface NeoGlassProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export const NeoGlassProgress = ({ 
  value, 
  max = 100, 
  className = '' 
}: NeoGlassProgressProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={`h-2 bg-white/10 rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-primary rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Switch component
interface NeoGlassSwitchProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  className?: string;
}

export const NeoGlassSwitch = ({ 
  checked, 
  onChange, 
  label, 
  className = '' 
}: NeoGlassSwitchProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                   focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
                   ${checked ? 'bg-primary' : 'bg-white/10'}`}
        onClick={onChange}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform
                     ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
      {label && <span className="text-white text-sm">{label}</span>}
    </div>
  );
};

// Page container component
interface NeoPageContainerProps {
  children: ReactNode;
  background?: 'gradient' | 'white-room' | 'mixed';
  className?: string;
}

export const NeoPageContainer = ({ 
  children, 
  background = 'gradient', 
  className = '' 
}: NeoPageContainerProps) => {
  let backgroundClasses = '';

  switch (background) {
    case 'white-room':
      backgroundClasses = 'bg-[url(/assets/dark-living-room.jpg)] bg-cover bg-center';
      break;
    case 'mixed':
      backgroundClasses = 'bg-gradient-to-br from-primary/30 to-blue-800/50';
      break;
    case 'gradient':
    default:
      backgroundClasses = 'bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]';
      break;
  }

  return (
    <div className={`min-h-screen ${backgroundClasses} ${className}`}>
      {children}
    </div>
  );
};