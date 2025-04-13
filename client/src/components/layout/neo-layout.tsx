import React from 'react';
import { NeoSidebar } from './neo-sidebar';
import Header from './header';
import { ThemeToggle } from '../theme/theme-toggle';

interface NeoLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export const NeoLayout: React.FC<NeoLayoutProps> = ({ 
  children,
  hideSidebar = false
}) => {
  return (
    <div className="neo-content-grid">
      {!hideSidebar && <NeoSidebar />}
      
      <div className={`neo-main-content ${hideSidebar ? 'ml-0' : ''}`}>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        <Header />
        
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
};