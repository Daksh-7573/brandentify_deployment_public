import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

interface UserProfile {
  id: number;
  name: string;
  username: string;
  photoURL?: string;
  title?: string;
  company?: string;
}

interface TeamMemberProps {
  profileLink: string;
  name: string;
  role: string;
  onProfileFound?: (userData: UserProfile) => void;
}

interface ClientEndorsementProps {
  clientName: string;
  clientTitle?: string;
  clientCompany?: string;
  clientEmail?: string;
  isVerified?: boolean;
  rating?: number;
  message?: string;
  profileLink?: string;
  approvalStatus?: string;
}

/**
 * Display team member with profile picture and info
 */
export function TeamMemberDisplay({ 
  profileLink, 
  name, 
  role,
  onProfileFound 
}: TeamMemberProps) {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Extract username or ID from profile link
        const match = profileLink.match(/(?:\/profile\/|\/\@)([a-zA-Z0-9_-]+)$/);
        if (!match) {
          setLoading(false);
          return;
        }

        const identifier = match[1];
        const response = await apiRequest('GET', `/api/users/profile/${identifier}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          onProfileFound?.(data);
        }
      } catch (error) {
        console.error('Error fetching team member profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [profileLink, onProfileFound]);

  const displayName = userData?.name || name || 'Team Member';
  const displayTitle = userData?.title || role;
  const displayUsername = userData?.username;

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={userData?.photoURL || ''} alt={displayName} />
        <AvatarFallback>{displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {displayUsername ? (
            <Link to={`/@${displayUsername}`} className="font-medium hover:text-primary truncate">
              {displayName}
            </Link>
          ) : (
            <p className="font-medium truncate">{displayName}</p>
          )}
        </div>
        {displayTitle && (
          <p className="text-sm text-muted-foreground truncate">{displayTitle}</p>
        )}
        {displayUsername && (
          <p className="text-xs text-muted-foreground">@{displayUsername}</p>
        )}
      </div>

      {profileLink && (
        <a 
          href={profileLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 flex-shrink-0"
          aria-label="View full profile"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

/**
 * Display client endorsement with verification status and profile
 */
export function ClientEndorsementDisplay({
  clientName,
  clientTitle,
  clientCompany,
  clientEmail,
  isVerified,
  rating,
  message,
  profileLink,
  approvalStatus
}: ClientEndorsementProps) {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!profileLink) {
          setLoading(false);
          return;
        }

        // Extract username or ID from profile link
        const match = profileLink.match(/(?:\/profile\/|\/\@)([a-zA-Z0-9_-]+)$/);
        if (!match) {
          setLoading(false);
          return;
        }

        const identifier = match[1];
        const response = await apiRequest('GET', `/api/users/profile/${identifier}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching client profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [profileLink]);

  const displayName = userData?.name || clientName || 'Client';
  const displayTitle = userData?.title || clientTitle;
  const displayCompany = userData?.company || clientCompany;
  const displayUsername = userData?.username;

  const isWaiting = approvalStatus === 'pending' || !isVerified;

  return (
    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0 mt-1">
          <AvatarImage src={userData?.photoURL || ''} alt={displayName} />
          <AvatarFallback>{displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {displayUsername ? (
              <Link to={`/@${displayUsername}`} className="font-medium hover:text-primary">
                {displayName}
              </Link>
            ) : (
              <p className="font-medium">{displayName}</p>
            )}
            {isVerified ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : isWaiting ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            ) : null}
          </div>

          {(displayTitle || displayCompany) && (
            <p className="text-sm text-muted-foreground">
              {displayTitle}{displayTitle && displayCompany ? ', ' : ''}{displayCompany}
            </p>
          )}

          {displayUsername && (
            <p className="text-xs text-muted-foreground">@{displayUsername}</p>
          )}

          {message && (
            <p className="text-sm mt-2 italic text-muted-foreground">"{message}"</p>
          )}

          {rating && (
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-lg ${i < rating ? '⭐' : '☆'}`} />
              ))}
            </div>
          )}

          {isWaiting && (
            <p className="text-xs text-amber-600 mt-2">
              Waiting for client verification to display on your profile
            </p>
          )}
        </div>

        {profileLink && (
          <a 
            href={profileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 flex-shrink-0 mt-1"
            aria-label="View full profile"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Simple team/client display for project cards (minimal version)
 */
export function ProjectTeamPreview({ 
  teamMembers, 
  clientCount 
}: { 
  teamMembers: string[]; 
  clientCount: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {teamMembers.length > 0 && (
        <div className="flex -space-x-2">
          {teamMembers.slice(0, 3).map((_, index) => (
            <Avatar key={index} className="h-6 w-6 border-2 border-background">
              <AvatarFallback className="text-xs">TM</AvatarFallback>
            </Avatar>
          ))}
          {teamMembers.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
              +{teamMembers.length - 3}
            </div>
          )}
        </div>
      )}
      {clientCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {clientCount} client{clientCount !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}
