import { ReactNode } from "react";
import Header from "@/components/layout/header";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

interface AppShellProps {
  children: ReactNode;
  hideHeader?: boolean;
  className?: string;
}

export function AppShell({ children, hideHeader = false, className = "" }: AppShellProps) {
  console.log('[AppShell] Rendering with hideHeader:', hideHeader);
  return (
    <div 
      className="fixed inset-0 w-full h-full responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full h-full overflow-auto flex flex-col">
        {!hideHeader && <Header />}
        
        <main className={`flex-1 ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
