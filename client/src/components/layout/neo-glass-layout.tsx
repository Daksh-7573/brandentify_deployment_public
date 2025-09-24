import React from 'react';

interface NeoGlassLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * NeoGlassLayout component
 * Wraps content in a Neo-Glass card container for consistent styling across pages
 */
export function NeoGlassLayout({ children, className = '' }: NeoGlassLayoutProps) {
  return (
    <div className="container mx-auto max-w-7xl px-2 sm:px-4 py-4 sm:py-8 md:py-24 flex justify-center">
      <div className={`neo-glass-panel rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-10 ${className}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * NeoGlassSection component
 * Creates a section within the main Neo-Glass layout
 */
interface NeoGlassSectionProps extends NeoGlassLayoutProps {
  title?: string;
}

export function NeoGlassSection({ children, className = '', title }: NeoGlassSectionProps) {
  return (
    <div className={`neo-glass-card rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 ${className}`}>
      {title && (
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">{title}</h2>
      )}
      {children}
    </div>
  );
}

/**
 * NeoGlassMenu component
 * Creates a styled navigation menu with Neo-Glass styling
 */
export function NeoGlassMenu({ children, className = '' }: NeoGlassLayoutProps) {
  return (
    <nav className={`neo-glass-card rounded-lg p-2 ${className}`}>
      {children}
    </nav>
  );
}