import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MuskAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MuskAvatar({ size = 'md', className }: MuskAvatarProps) {
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  
  // Default Musk avatar image path - ideally we'd use an import here
  // but for simplicity we'll use a hardcoded path relative to public
  const avatarSrc = "/musk-avatar.png";
  
  return (
    <Avatar className={cn(sizeClass[size], className)}>
      <AvatarImage src={avatarSrc} alt="Musk AI" />
      <AvatarFallback className="bg-primary/10">
        <span className="text-primary font-semibold">M</span>
      </AvatarFallback>
    </Avatar>
  );
}