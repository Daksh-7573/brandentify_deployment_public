import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProfileImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ src, alt, className }) => {
  // Extract first letter of name for fallback
  const fallbackLetter = alt?.charAt(0) || '?';

  return (
    <Avatar className={className}>
      {src ? (
        <AvatarImage src={src} alt={alt} />
      ) : (
        <AvatarFallback>{fallbackLetter}</AvatarFallback>
      )}
    </Avatar>
  );
};

export default ProfileImage;