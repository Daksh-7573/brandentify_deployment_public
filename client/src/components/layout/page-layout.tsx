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
      className="fixed inset-0 w-full h-full flex flex-col responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Glass UI overlay to maintain design consistency - Modal Screen Effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 flex w-full h-full flex-col overflow-auto">
        <Header />
        <div className="mt-3"> {/* Match Brand Quests perfect spacing */}
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
