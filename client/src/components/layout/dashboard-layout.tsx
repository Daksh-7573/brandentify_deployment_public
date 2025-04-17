import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import RightSidebar from "@/components/layout/right-sidebar";
import MuskButton from "@/components/musk/musk-button";

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="h-16 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-full mx-auto px-6 h-full flex items-center justify-between">
            <div className="h-8 w-44 animate-pulse bg-gray-200 rounded"></div>
            <div className="flex space-x-4">
              <div className="h-9 w-24 animate-pulse bg-gray-200 rounded"></div>
              <div className="h-9 w-9 animate-pulse bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-gray-50 pt-16 flex justify-center items-start">
          <div className="w-full max-w-7xl px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm h-60 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-4/6"></div>
                <div className="h-24 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden pt-16"> {/* Padding-top for fixed header */}
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="min-h-screen">
            {children}
          </div>
        </main>

        {/* Right sidebar */}
        {!hideRightSidebar && <RightSidebar />}
      </div>
      
      {/* Musk AI Button - Floating on all pages */}
      <MuskButton 
        context={{
          userId: isAuthenticated ? 1 : undefined, // Use authenticated user ID when available
          page: location
        }} 
      />
    </div>
  );
};

export default DashboardLayout;