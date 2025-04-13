import React from 'react';
import { cn } from '@/lib/utils';

// Neo Card component
interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const NeoCard: React.FC<NeoCardProps> = ({ 
  children, 
  className, 
  hoverEffect = true,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        'neo-card',
        hoverEffect ? 'hover:transform hover:-translate-y-1 hover:shadow-lg' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Neo Button Component
interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  className, 
  variant = 'default',
  size = 'md',
  disabled,
  iconLeft,
  iconRight,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantClasses = {
    default: 'neo-button',
    outline: 'border-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10',
    ghost: 'bg-transparent hover:bg-primary/10 text-neo-text-primary'
  };
  
  return (
    <button 
      className={cn(
        'rounded-full font-medium transition-all',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {iconLeft && <span className="mr-2">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-2">{iconRight}</span>}
    </button>
  );
};

// Section Title with animated underline
interface NeoSectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export const NeoSectionTitle: React.FC<NeoSectionTitleProps> = ({ 
  children, 
  className, 
  as = 'h2',
  ...props 
}) => {
  const Component = as;
  
  return (
    <Component 
      className={cn('neo-section-title', className)}
      {...props}
    >
      {children}
    </Component>
  );
};

// Skill Tag
interface NeoSkillTagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const NeoSkillTag: React.FC<NeoSkillTagProps> = ({ 
  children, 
  className, 
  icon,
  ...props 
}) => {
  return (
    <div 
      className={cn('neo-skill', className)}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </div>
  );
};

// Service/Offer Card
interface NeoOfferCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const NeoOfferCard: React.FC<NeoOfferCardProps> = ({ 
  title, 
  description, 
  icon,
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn('neo-offer-card', className)}
      {...props}
    >
      {icon && (
        <div className="text-primary mr-4 p-2 rounded-full bg-primary/10">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-neo-text-secondary text-sm">{description}</p>
      </div>
    </div>
  );
};

// Project Card
interface NeoProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  imageSrc?: string;
  tags?: string[];
}

export const NeoProjectCard: React.FC<NeoProjectCardProps> = ({ 
  title, 
  description, 
  imageSrc, 
  tags = [],
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn('neo-project-card', className)}
      {...props}
    >
      {imageSrc && (
        <img src={imageSrc} alt={title} />
      )}
      <div className="neo-project-overlay">
        <h3 className="font-semibold text-lg mb-1 text-white">{title}</h3>
        <p className="text-gray-200 text-sm mb-2">{description}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span 
                key={index} 
                className="text-xs bg-primary/20 text-primary/90 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Timeline Item
interface NeoTimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  date?: string;
  children?: React.ReactNode;
}

export const NeoTimelineItem: React.FC<NeoTimelineItemProps> = ({ 
  title, 
  subtitle, 
  date,
  children,
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn('neo-timeline-item', className)}
      {...props}
    >
      <div className="mb-1">
        <h3 className="font-semibold text-neo-text-primary">{title}</h3>
        {subtitle && (
          <p className="text-sm text-neo-text-secondary">{subtitle}</p>
        )}
        {date && (
          <p className="text-xs text-neo-text-secondary mt-1">{date}</p>
        )}
      </div>
      {children && (
        <div className="mt-2 text-sm">
          {children}
        </div>
      )}
    </div>
  );
};

// Timeline Container
interface NeoTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const NeoTimeline: React.FC<NeoTimelineProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn('neo-timeline', className)}
      {...props}
    >
      {children}
    </div>
  );
};