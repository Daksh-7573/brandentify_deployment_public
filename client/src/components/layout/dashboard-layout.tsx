import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import RightSidebar from "@/components/layout/right-sidebar";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { DashboardPageSkeleton } from "@/components/ui/page-skeletons/dashboard-skeleton";

type DashboardLayoutProps = {
  children: ReactNode;
  hideRightSidebar?: boolean;
};

const DashboardLayout = ({ children, hideRightSidebar = false }: DashboardLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to landing if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/');
    return null;
  }

  // Note: Pages handle their own loading states with page-specific skeletons
  // Don't show wrapper skeleton here to avoid double skeleton flash

  return (
    <div 
      className="min-h-screen flex flex-col responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      {/* Glass UI overlay to maintain design consistency */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pt-16 relative z-10"> {/* Padding-top for fixed header */}
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-screen">
            {children}
          </div>
        </main>

        {/* Right sidebar - Mobile-responsive */}
        {!hideRightSidebar && (
          <div className="w-full lg:w-80 h-64 lg:h-auto border-t lg:border-t-0 lg:border-l border-gray-200">
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;