import { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";
import Header from "@/components/layout/header";

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
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="pt-16"> {/* Changed from mt-16 to pt-16 for better spacing with fixed glass header */}
        <PageHeader 
          heading={title}
          description={description}
          icon={icon}
          action={actions}
        />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}