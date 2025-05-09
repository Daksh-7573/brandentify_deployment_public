import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Bell, Home, Search, Users, MessageCircle, Book, Rocket } from 'lucide-react';

interface TopMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const TopMenuItem: React.FC<TopMenuItemProps> = ({ icon, label, href, active }) => {
  return (
    <Link href={href}>
      <GlassButton
        variant={active ? "glass-dark" : "glass"}
        className={cn(
          "h-full px-4 rounded-full flex gap-2 items-center justify-center",
          active ? "bg-primary/20" : "hover:bg-primary/10"
        )}
      >
        {icon}
        <span className="hidden md:inline">{label}</span>
      </GlassButton>
    </Link>
  );
};

const SimpleTopMenuBar: React.FC = () => {
  const [location] = useLocation();
  
  const menuItems = [
    { icon: <Home className="h-5 w-5" />, label: "Home", href: "/", active: location === "/" },
    { icon: <MessageCircle className="h-5 w-5" />, label: "Chat", href: "/chat", active: location === "/chat" || location === "/messages" },
    { icon: <Users className="h-5 w-5" />, label: "Network", href: "/smart-connect", active: location === "/smart-connect" },
    { icon: <Rocket className="h-5 w-5" />, label: "Career Capsule", href: "/career-capsule", active: location === "/career-capsule" },
    { icon: <Book className="h-5 w-5" />, label: "Brand Quests", href: "/brand-quests", active: location === "/brand-quests" },
    { icon: <Search className="h-5 w-5" />, label: "Search", href: "/search", active: location === "/search" },
  ];

  return (
    <GlassCard 
      variant="frosted" 
      blurStrength="md"
      transparency="medium"
      backgroundEffect="noise"
      backgroundIntensity="medium"
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-5xl w-[95%] px-2 py-2 flex items-center justify-between rounded-full shadow-lg border-primary/20 layer-3"
    >
      <div className="flex-1">
        <div className="flex items-center space-x-2 justify-center">
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
      </div>

      <div className="flex items-center space-x-2">
        <TopMenuItem
          icon={<Bell className="h-5 w-5" />}
          label="Notifications"
          href="/notifications"
          active={location === "/notifications"}
        />
      </div>
    </GlassCard>
  );
};

export default SimpleTopMenuBar;