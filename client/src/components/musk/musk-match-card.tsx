import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  UserCheck, 
  X, 
  Star, 
  Lightbulb, 
  BrainCircuit, 
  Building2, 
  MapPin, 
  Briefcase 
} from 'lucide-react';
import { MuskMatch } from '@/types/musk-match';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface MuskMatchCardProps {
  match: MuskMatch;
  onAction?: () => void;
}

export default function MuskMatchCard({ match, onAction }: MuskMatchCardProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest('/api/musk-matches/connect', 'PATCH', { matchId: match.id });
      toast({
        title: "Connection request sent!",
        description: "You've connected with this professional."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/musk-matches'] });
      if (onAction) onAction();
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "There was an error connecting with this professional.",
        variant: "destructive"
      });
    }
  };
  
  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest('/api/musk-matches/dismiss', 'PATCH', { matchId: match.id });
      toast({
        title: "Match dismissed",
        description: "This match has been removed from your suggestions."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/musk-matches'] });
      if (onAction) onAction();
    } catch (error) {
      toast({
        title: "Error dismissing match",
        description: "There was an error dismissing this match.",
        variant: "destructive"
      });
    }
  };
  
  const markAsRead = async () => {
    if (!match.isRead) {
      try {
        await apiRequest('/api/musk-matches/read', 'PATCH', { matchId: match.id });
        queryClient.invalidateQueries({ queryKey: ['/api/musk-matches'] });
      } catch (error) {
        console.error("Error marking match as read:", error);
      }
    }
  };
  
  // Toggle expanded state and mark as read when the card is clicked
  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
    markAsRead();
  };
  
  const formatSkills = (skills: string[]) => {
    if (skills.length <= 3) return skills;
    return [...skills.slice(0, 3), `+${skills.length - 3} more`];
  };
  
  const cardVariants = {
    collapsed: { height: 'auto' },
    expanded: { height: 'auto' }
  };
  
  const contentVariants = {
    collapsed: { opacity: 0, height: 0 },
    expanded: { opacity: 1, height: 'auto' }
  };
  
  // Calculate a color for the match score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-orange-400';
  };
  
  const scoreColor = getScoreColor(match.matchScore);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
          !match.isRead ? 'border-l-4 border-l-primary' : ''
        }`}
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow">
              {match.suggestedUser?.photoURL ? (
                <AvatarImage src={match.suggestedUser.photoURL} alt={match.suggestedUser.name || "User"} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {match.suggestedUser?.name?.charAt(0) || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">
                  {match.suggestedUser?.name || "Professional"}
                </h3>
                <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                  {match.matchType}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {match.suggestedUser?.title || "Professional"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center ${scoreColor}`}>
              <Star className="h-4 w-4 mr-1 fill-current" />
              <span className="font-bold">{match.matchScore}%</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pt-0 pb-2">
          <div className="flex flex-wrap gap-2 mt-2">
            {match.industry && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {match.industry}
              </Badge>
            )}
            {match.domain && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {match.domain}
              </Badge>
            )}
            {match.suggestedUser?.location && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {match.suggestedUser.location}
              </Badge>
            )}
          </div>
          
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {isExpanded && (
              <div className="mt-3 space-y-3">
                <div>
                  <h4 className="font-medium flex items-center text-sm">
                    <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
                    Why you match
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {match.matchReason}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium flex items-center text-sm">
                    <BrainCircuit className="h-4 w-4 mr-1 text-purple-500" />
                    Common skills
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Array.isArray(match.skills) && formatSkills(match.skills).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-xs text-muted-foreground">
                  Musk AI matched you based on your career goals and professional profile
                </div>
              </div>
            )}
          </motion.div>
        </CardContent>
        
        <CardFooter className="p-3 flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-muted-foreground"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4 mr-1" />
            Dismiss
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleConnect}
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Connect
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}