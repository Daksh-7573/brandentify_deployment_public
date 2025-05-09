import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  User, 
  Briefcase, 
  Book, 
  Zap, 
  MessageSquare, 
  Settings, 
  Lightbulb 
} from "lucide-react";
import { VisionButton } from "@/components/ui/vision-button";

interface VisionLayoutProps {
  children: React.ReactNode;
}

export function VisionLayout({ children }: VisionLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/brand-quests", label: "Brand Quests", icon: Zap },
    { href: "/mentorship", label: "Mentorship", icon: Briefcase },
    { href: "/vision-ui", label: "Vision UI", icon: Lightbulb },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Background with dynamic blur effect */}
      <div className="vision-blur-bg">
        <div className="animate-pulse-slow absolute -top-10 -left-10 w-72 h-72 bg-[#4F8CFF]/5 rounded-full blur-3xl opacity-50"></div>
        <div className="animate-pulse-slower absolute bottom-10 right-10 w-96 h-96 bg-[#3ED7C2]/5 rounded-full blur-3xl opacity-50"></div>
        <div className="animate-float absolute top-1/3 left-1/3 w-80 h-80 bg-[#4ADE80]/5 rounded-full blur-3xl opacity-30"></div>
      </div>
      
      {/* Top navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#3A3A3C] bg-[#1C1C1E]/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center">
              <span className="text-[#E5E5E7] font-bold text-xl">Brandentifier</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <VisionButton variant="glass" size="sm">
              <User className="mr-2 h-4 w-4" />
              Account
            </VisionButton>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Side navigation */}
        <aside className="hidden lg:block w-[240px] border-r border-[#3A3A3C] bg-[#1C1C1E]/70 backdrop-blur-md">
          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <VisionButton
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive 
                        ? "bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 text-[#E5E5E7]" 
                        : "text-[#A1A1AA] border-transparent"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </VisionButton>
                </Link>
              );
            })}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}