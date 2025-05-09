import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Home, Search, Users, MessageCircle, Book, Rocket, Settings, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  notificationCount?: number;
}

const TopMenuItem: React.FC<TopMenuItemProps> = ({ icon, label, href, active, notificationCount }) => {
  return (
    <Link href={href}>
      <GlassButton
        variant={active ? "glass-dark" : "glass"}
        className={cn(
          "h-full px-4 rounded-full flex gap-2 items-center justify-center relative",
          active ? "bg-primary/20" : "hover:bg-primary/10"
        )}
      >
        {icon}
        <span className="hidden md:inline">{label}</span>
        {notificationCount && notificationCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
            {notificationCount > 9 ? '9+' : notificationCount}
          </div>
        )}
      </GlassButton>
    </Link>
  );
};

const TopMenuBar: React.FC = () => {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  
  const menuItems = [
    { icon: <Home className="h-5 w-5" />, label: "Home", href: "/", active: location === "/" },
    { icon: <MessageCircle className="h-5 w-5" />, label: "Chat", href: "/chat", active: location === "/chat" || location === "/messages" },
    { icon: <Users className="h-5 w-5" />, label: "Network", href: "/smart-connect", active: location === "/smart-connect" },
    { icon: <Rocket className="h-5 w-5" />, label: "Career Capsule", href: "/career-capsule", active: location === "/career-capsule" },
    { icon: <Book className="h-5 w-5" />, label: "Brand Quests", href: "/brand-quests", active: location === "/brand-quests" },
    { icon: <Search className="h-5 w-5" />, label: "Search", href: "/search", active: location === "/search" },
  ];

  // Example notification count - replace with actual data
  const notificationCount = 3;

  return (
    <GlassCard 
      variant="frosted" 
      blurStrength="md"
      transparency="medium"
      backgroundEffect="noise"
      backgroundIntensity="medium"
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-5xl w-[95%] px-2 py-2 flex items-center justify-between rounded-full shadow-lg border-primary/20 layer-3"
    >
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <GlassButton variant="glass" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
            </GlassButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Navigation</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {menuItems.map((item) => (
              <DropdownMenuItem key={item.label} asChild>
                <Link href={item.href} className="w-full flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="hidden lg:flex items-center space-x-1">
        {menuItems.map((item) => (
          <TopMenuItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={item.active}
          />
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <TopMenuItem
          icon={<Bell className="h-5 w-5" />}
          label="Notifications"
          href="/notifications"
          active={location === "/notifications"}
          notificationCount={notificationCount}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <GlassButton variant="glass" className="h-10 w-10 p-0 rounded-full">
              <Avatar className="h-8 w-8">
                {user?.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.name || 'User'} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </GlassButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut && signOut()} className="cursor-pointer">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </GlassCard>
  );
};

export default TopMenuBar;