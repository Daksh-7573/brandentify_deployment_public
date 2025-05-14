import { ReactNode, useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart2, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  Shield, 
  ChevronDown 
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
}

interface AdminUser {
  id: number;
  userId: number;
  roleId: number;
  roleName: string;
  permissions: string[];
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [_, navigate] = useLocation();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>("");
  const { toast } = useToast();
  
  useEffect(() => {
    // Set current path
    setCurrentPath(window.location.pathname);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Check if user has admin access
    const checkAdminAccess = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('/api/admin/stats', {
          method: 'GET'
        });
        
        if (response.ok) {
          // User has admin access
          const sessionData = await apiRequest('/api/admin/session', {
            method: 'GET'
          });
          
          if (sessionData.ok) {
            const adminData = await sessionData.json();
            setAdminUser(adminData.adminUser);
          }
        } else {
          // Not an admin, redirect to home
          toast({
            title: "Access Denied",
            description: "You don't have admin access",
            variant: "destructive"
          });
          navigate('/');
        }
      } catch (error) {
        console.error("Admin access check error:", error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [navigate, isAuthenticated, toast]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest('/api/admin/logout', {
        method: 'POST'
      });
      
      toast({
        title: "Logged Out",
        description: "You've been logged out from the admin panel"
      });
      
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out",
        variant: "destructive"
      });
    }
  };
  
  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If no admin access, this will redirect automatically
  if (!adminUser) return null;
  
  // Navigation links
  const navLinks = [
    { 
      path: "/admin", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      path: "/admin/users", 
      label: "User Management", 
      icon: <Users className="h-5 w-5" />,
      permission: "view_users"
    },
    { 
      path: "/admin/content", 
      label: "Content", 
      icon: <FileText className="h-5 w-5" />,
      permission: "view_content"
    },
    { 
      path: "/admin/analytics", 
      label: "Analytics", 
      icon: <BarChart2 className="h-5 w-5" />,
      permission: "view_analytics"
    },
    { 
      path: "/admin/settings", 
      label: "Settings", 
      icon: <Settings className="h-5 w-5" />,
      permission: "manage_settings"
    },
    { 
      path: "/admin/roles", 
      label: "Roles & Permissions", 
      icon: <Shield className="h-5 w-5" />,
      permission: "manage_users"
    },
  ];
  
  // Filter links based on permissions
  const filteredLinks = navLinks.filter(link => {
    // If no permission required or has full_access, show the link
    if (!link.permission || adminUser.permissions.includes('full_access')) {
      return true;
    }
    
    // Check if user has the required permission
    return adminUser.permissions.includes(link.permission);
  });
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold">Brandentifier Admin</h1>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{adminUser.roleName}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <Link 
                key={link.path} 
                href={link.path}
                onClick={() => setCurrentPath(link.path)}
              >
                <a 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full justify-start text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Mobile navigation */}
      <Sheet>
        <div className="sticky top-0 z-10 flex lg:hidden items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          
          <h1 className="text-lg font-bold">Brandentifier Admin</h1>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Shield className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="font-medium">{user?.name || 'Admin User'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-xs">{adminUser.roleName}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-gray-800">
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold">Brandentifier Admin</h1>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
          
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{adminUser.roleName}</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <SheetClose key={link.path} asChild>
                  <Link 
                    href={link.path}
                    onClick={() => setCurrentPath(link.path)}
                  >
                    <a 
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm ${
                        isActive 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </a>
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-red-500"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}