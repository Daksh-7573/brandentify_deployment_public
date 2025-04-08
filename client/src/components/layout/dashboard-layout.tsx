import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import RightSidebar from "@/components/layout/right-sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
  hideSidebar?: boolean;
  hideRightSidebar?: boolean;
};

const DashboardLayout = ({ children, hideSidebar = false, hideRightSidebar = false }: DashboardLayoutProps) => {
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden pt-16"> {/* Added padding-top (pt-16) to account for fixed header */}
        {/* Sidebar */}
        {!hideSidebar && <Sidebar activePage={location.startsWith('/search') ? 'search' : 'dashboard'} />}

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto bg-gray-50 ${!hideSidebar ? 'pl-0 md:pl-0' : ''}`}>
          <div className="min-h-screen">
            {children}
          </div>
        </main>

        {/* Right sidebar */}
        {!hideRightSidebar && <RightSidebar />}
      </div>
    </div>
  );
};

export default DashboardLayout;