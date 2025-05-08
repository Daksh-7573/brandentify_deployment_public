import React, { ReactNode, useState } from 'react';
import { SpatialLayout, FloatingWindow, ControlPanel } from './SpatialLayout';
import { Button } from '@/components/ui/button';
import { Home, Menu, User, X, Briefcase, Brain, Compass, Settings, PanelLeft } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';

interface SpatialWindowProps {
  title: string;
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  initialPosition?: { x: number; y: number; z: number };
  width?: string;
  scale?: number;
}

export const SpatialWindow: React.FC<SpatialWindowProps> = ({
  title,
  children,
  isOpen = true,
  onClose,
  initialPosition = { x: 0, y: 0, z: 0 },
  width = '800px',
  scale = 1,
}) => {
  if (!isOpen) return null;
  
  return (
    <FloatingWindow
      title={title}
      onClose={onClose}
      initialPosition={initialPosition}
      initialScale={scale}
      width={width}
    >
      {children}
    </FloatingWindow>
  );
};

interface SpatialPortalLayoutProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
}

export const SpatialPortalLayout: React.FC<SpatialPortalLayoutProps> = ({
  children,
  title = 'Brandentifier',
  showSidebar = true,
}) => {
  const [location] = useLocation();
  const { user } = useCurrentUser();
  const [isSidebarOpen, setSidebarOpen] = useState(showSidebar);
  const [isProfileOpen, setProfileOpen] = useState(false);
  
  // Navigation items for the main menu
  const navItems = [
    { 
      name: 'Dashboard', 
      icon: <Home className="h-5 w-5" />, 
      href: '/industry-pulse',
      active: location === '/industry-pulse' || location === '/dashboard'
    },
    { 
      name: 'Career Capsule', 
      icon: <Compass className="h-5 w-5" />, 
      href: '/career-capsule',
      active: location === '/career-capsule'
    },
    { 
      name: 'Brand Quests', 
      icon: <Brain className="h-5 w-5" />, 
      href: '/brand-quests',
      active: location === '/brand-quests' || location === '/career-quests'
    },
    { 
      name: 'Portfolio', 
      icon: <Briefcase className="h-5 w-5" />, 
      href: '/portfolio-builder',
      active: location === '/portfolio-builder'
    },
  ];

  return (
    <SpatialLayout backgroundImage="linear-gradient(to bottom right, #0f172a, #1e293b)">
      {/* Main Content Window */}
      <SpatialWindow
        title={title}
        initialPosition={{ x: isSidebarOpen ? 150 : 0, y: 0, z: 0 }}
        width="80%"
      >
        <div className="bg-white/5 rounded-lg p-4">
          {children}
        </div>
      </SpatialWindow>
      
      {/* Sidebar Navigation */}
      <SpatialWindow
        title="Navigation"
        isOpen={isSidebarOpen}
        initialPosition={{ x: -400, y: 0, z: -10 }}
        width="300px"
        scale={0.95}
        onClose={() => setSidebarOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              B
            </div>
            <div className="text-white font-medium text-lg">Brandentifier</div>
          </div>
          
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  item.active 
                    ? "bg-white/20 text-white" 
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                )}>
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </SpatialWindow>
      
      {/* User Profile Card */}
      <SpatialWindow
        title="Profile"
        isOpen={isProfileOpen}
        initialPosition={{ x: 400, y: -50, z: -15 }}
        width="300px"
        scale={0.9}
        onClose={() => setProfileOpen(false)}
      >
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.photoURL || ''} alt={user?.name || 'User'} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-white text-lg font-medium">{user?.name || 'User'}</h3>
            <p className="text-gray-300 text-sm">{user?.title || 'Professional'}</p>
          </div>
          <div className="w-full pt-4 border-t border-white/10">
            <Link href="/profile">
              <a className="w-full block text-center bg-white/10 hover:bg-white/20 transition-colors text-white py-2 rounded-md">
                View Profile
              </a>
            </Link>
          </div>
        </div>
      </SpatialWindow>

      {/* Control Panel */}
      <ControlPanel>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/10 hover:bg-white/20"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <PanelLeft className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
          </Button>
          
          <Link href="/industry-pulse">
            <Button 
              variant={location === '/industry-pulse' ? "default" : "ghost"}
              size="icon" 
              className="rounded-full bg-white/10 hover:bg-white/20"
            >
              <Home className="h-5 w-5 text-white" />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/10 hover:bg-white/20"
            onClick={() => setProfileOpen(!isProfileOpen)}
          >
            <User className="h-5 w-5 text-white" />
          </Button>
          
          <Link href="/settings">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-white/10 hover:bg-white/20"
            >
              <Settings className="h-5 w-5 text-white" />
            </Button>
          </Link>
        </div>
      </ControlPanel>
    </SpatialLayout>
  );
};

export default SpatialPortalLayout;