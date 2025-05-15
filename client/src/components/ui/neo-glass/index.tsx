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
}

export const NeoGlassCard = ({ children, className = '', style }: NeoGlassCardProps) => {
  return (
    <div className={`neo-glass-card ${className}`} style={style}>
      {children}
    </div>
  );
};

// Button component
interface NeoGlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const NeoGlassButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  type = 'button',
  disabled = false
}: NeoGlassButtonProps) => {
  const variantClass = variant === 'secondary' ? 'secondary' : '';
  
  return (
    <button
      type={type}
      className={`neo-glass-button ${variantClass} ${className}`}
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