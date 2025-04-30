import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Settings, User, BarChart, Briefcase, Menu, FileText } from "lucide-react";

// Navigation items for the sidebar
const navItems = [
  {
    name: "Home",
    href: "/industry-pulse",
    icon: Home
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User
  },
  {
    name: "Services",
    href: "/services",
    icon: Briefcase
  },
  {
    name: "Resume & CV",
    href: "/resume-cv",
    icon: FileText
  },
  {
    name: "Analytics",
    href: "/radar",
    icon: BarChart
  },
  {
    name: "Settings",
    href: "/edit-profile",
    icon: Settings
  }
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile top navigation */}
      <div className="sm:hidden bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center justify-between">
        <button 
          onClick={toggleMenu}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold">Brandentifier</span>
        <div></div> {/* Empty div for flex spacing */}
      </div>

      {/* Mobile sidebar (collapsible) */}
      <div className={`
        fixed z-40 inset-0 transform ease-in-out duration-300 
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        sm:hidden
      `}>
        <div className="bg-white dark:bg-gray-800 h-full w-80 shadow-xl p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">Brandentifier</h1>
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="space-y-1">
            {navItems.map(item => (
              <Link 
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                <a className={`
                  flex items-center px-4 py-3 rounded-md transition-colors
                  ${location === item.href 
                    ? "bg-primary text-white" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"}
                `}>
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Close menu when clicking outside */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50" 
          onClick={() => setIsMenuOpen(false)}
          style={{ zIndex: -1 }}
        ></div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden sm:flex">
        <div className="w-64 h-screen bg-white dark:bg-gray-800 shadow-md fixed">
          <div className="p-5">
            <h1 className="text-xl font-bold mb-8">Brandentifier</h1>
            <nav className="space-y-1">
              {navItems.map(item => (
                <Link key={item.name} href={item.href}>
                  <a className={`
                    flex items-center px-4 py-3 rounded-md transition-colors
                    ${location === item.href 
                      ? "bg-primary text-white" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"}
                  `}>
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="ml-64 flex-1">
          {children}
        </div>
      </div>

      {/* Mobile content area */}
      <div className="sm:hidden">
        {children}
      </div>
    </div>
  );
}