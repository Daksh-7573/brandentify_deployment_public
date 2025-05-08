import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';

export interface PageLayoutProps {
  children: ReactNode;
  title: string;
  className?: string;
}

/**
 * A consistent page layout component with title management
 */
export function PageLayout({ children, title, className = '' }: PageLayoutProps) {
  return (
    <>
      <Helmet>
        <title>{title} | Brandentifier</title>
      </Helmet>
      <main className={`min-h-screen bg-background ${className}`}>
        {children}
      </main>
    </>
  );
}