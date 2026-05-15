import React from "react";

interface NeoGlassLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * NeoGlassLayout component
 * Wraps content in a Neo-Glass card container for consistent styling across pages
 */
export function NeoGlassLayout({
  children,
  className = "",
}: NeoGlassLayoutProps) {
  return (
    <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4 md:py-10 flex justify-center items-start">
      <div
        className={`neo-glass-panel rounded-lg p-3 sm:p-4 md:p-5 mb-2 sm:mb-3 md:mb-4 w-full overflow-x-hidden ${className}`}
      >
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

export function NeoGlassSection({
  children,
  className = "",
  title,
}: NeoGlassSectionProps) {
  return (
    <div
      className={`neo-glass-card rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 ${className}`}
    >
      {title && (
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

/**
 * NeoGlassMenu component
 * Creates a styled navigation menu with Neo-Glass styling
 */
export function NeoGlassMenu({
  children,
  className = "",
}: NeoGlassLayoutProps) {
  return (
    <nav className={`neo-glass-card rounded-lg p-2 ${className}`}>
      {children}
    </nav>
  );
}
