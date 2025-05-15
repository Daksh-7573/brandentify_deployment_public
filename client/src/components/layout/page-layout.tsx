import { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";
import Header from "@/components/layout/header";
import { NeoGlassLayout } from "@/components/layout/neo-glass-layout";

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
      <div className="mt-16">
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
  );
}