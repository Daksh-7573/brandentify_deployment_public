import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, 
  MessageSquare, 
  User, 
  Briefcase, 
  Code, 
  GraduationCap, 
  Home,
  Mail,
  Share2,
  Star
} from 'lucide-react';

interface NeoSidebarProps {
  className?: string;
}

export const NeoSidebar: React.FC<NeoSidebarProps> = ({ className = '' }) => {
  const { user } = useAuth();

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <aside className={`neo-sidebar ${className}`}>
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-3">
          <Avatar className="neo-avatar w-24 h-24">
            <AvatarImage src={user?.photoURL || undefined} alt={user?.name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="neo-status-dot"></span>
        </div>
        <h2 className="text-xl font-semibold mb-1">{user?.name || "User"}</h2>
        <p className="text-sm text-neo-text-secondary mb-3">{user?.title || "Professional"}</p>
        <Link href="/chat">
          <a className="neo-button w-full text-center mb-3">
            <MessageSquare className="inline-block mr-2 h-4 w-4" />
            Talk
          </a>
        </Link>
        <Link href="/resume">
          <a className="text-neo-text-secondary hover:text-neo-text-primary transition-colors">
            <FileText className="inline-block mr-1 h-4 w-4" />
            Grab My Resume
          </a>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-1 w-full">
        <NavItem href="/" icon={<Home />} label="Home" />
        <NavItem href="/profile" icon={<User />} label="Profile" />
        <NavItem href="/portfolio" icon={<Briefcase />} label="Portfolio" />
        <NavItem href="/projects" icon={<Code />} label="Projects" />
        <NavItem href="/education" icon={<GraduationCap />} label="Education" />
        <NavItem href="/connect" icon={<Share2 />} label="Connect" />
        <NavItem href="/messages" icon={<Mail />} label="Messages" />
        <NavItem href="/services" icon={<Star />} label="Services" />
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 text-center text-xs text-neo-text-secondary">
        <p>© 2025 Brandentifier</p>
        <p className="mt-1">Connect. Showcase. Grow.</p>
      </div>
    </aside>
  );
};

// Navigation Item Component
interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label }) => {
  const [location] = React.useState(window.location.pathname);
  const isActive = location === href;

  return (
    <Link href={href}>
      <a className={`
        flex items-center px-4 py-2.5 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-primary/20 text-primary' 
          : 'text-neo-text-secondary hover:bg-primary/10 hover:text-neo-text-primary'}
      `}>
        <span className="mr-3">{icon}</span>
        {label}
      </a>
    </Link>
  );
};