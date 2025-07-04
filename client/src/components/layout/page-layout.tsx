import { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";
import Header from "@/components/layout/header";
import { NeoGlassLayout } from "@/components/layout/neo-glass-layout";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

interface PageLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageLayout({ 
  title, 
  description, 
  icon, 
  actions, 
  children 
}: PageLayoutProps) {
  return (
    <div 
      className="flex min-h-screen w-full flex-col responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      {/* Glass UI overlay to maintain design consistency - Modal Screen Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <Header />
        <div className="mt-14"> {/* Reduced top margin to avoid gap */}
          <PageHeader 
            heading={title}
            description={description}
            icon={icon}
            action={actions}
            className="text-white"
          />
          
          <NeoGlassLayout>
            <main className="flex-1">
              {children}
            </main>
          </NeoGlassLayout>
        </div>
      </div>
    </div>
  );
}