import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  UserPlus, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  ChevronDown, 
  ChevronUp,
  Lightbulb
} from "lucide-react";

// Define the types for the match results
interface MatchUser {
  id: number;
  name: string | null;
  title: string | null;
  photoURL: string | null;
  location: string | null;
  industry: string | null;
}

interface MatchResult {
  user: MatchUser;
  score: number;
  strengthAreas: string[];
  compatibilityInsights: string[];
  matchReasons: string[];
}

interface SmartConnectResponse {
  matches: MatchResult[];
  matchCount: number;
  matchingCriteria: any;
}

export function MatchResults({ userId }: { userId: number }) {
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  
  // Fetch match results
  const { data, isLoading, error } = useQuery<SmartConnectResponse>({
    queryKey: ["/api/smart-connect"],
  });
  
  const toggleExpand = (matchId: number) => {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchId);
    }
  };
  
  // Loading state
  if (isLoading) {
    return <MatchResultsLoading />;
  }
  
  // Error state
  if (error) {
    return (
      <Card className="w-full mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">Error Loading Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We couldn't load your match results. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }
  
  // No matches found
  if (!data || data.matches.length === 0) {
    return (
      <Card className="w-full mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl">No Matches Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            We couldn't find any matches based on your criteria. Try adjusting your search
            parameters to find more connections.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl">Your Smart Connect Matches</CardTitle>
        <CardDescription>
          Found {data.matchCount} professionals matching your criteria
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {data.matches.map((match) => (
          <div key={match.user.id} className="border rounded-lg overflow-hidden bg-card">
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                {/* Avatar and basic info */}
                <div className="flex-shrink-0">
                  <Avatar className="h-16 w-16">
                    {match.user.photoURL ? (
                      <AvatarImage src={match.user.photoURL} alt={match.user.name || "User"} />
                    ) : (
                      <AvatarFallback>
                        {match.user.name
                          ? match.user.name.substring(0, 2).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                
                <div className="flex-1 space-y-2">
                  {/* Name and title */}
                  <div>
                    <h3 className="text-lg font-medium">{match.user.name || "Anonymous User"}</h3>
                    <p className="text-muted-foreground">
                      {match.user.title || "Professional"}
                    </p>
                  </div>
                  
                  {/* Match score visualization */}
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Match Score:</div>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.round(match.score * 100)}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium">
                      {Math.round(match.score * 100)}%
                    </div>
                  </div>
                  
                  {/* Location and industry */}
                  <div className="flex flex-wrap gap-3">
                    {match.user.location && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {match.user.location}
                      </Badge>
                    )}
                    {match.user.industry && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {match.user.industry}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Strength areas */}
                  <div className="flex flex-wrap gap-2">
                    {match.strengthAreas.map((area) => (
                      <Badge key={area} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex md:flex-col gap-2 w-full md:w-auto">
                  <Button variant="default" className="flex-1 md:flex-initial">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                  <Button variant="outline" className="flex-1 md:flex-initial">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
              
              {/* Compatibility insights - Preview */}
              {!expandedMatch && match.compatibilityInsights.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">{match.compatibilityInsights[0]}</span>
                  </div>
                  {match.compatibilityInsights.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() => toggleExpand(match.user.id)}
                    >
                      Show more insights
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
              
              {/* Detailed view - when expanded */}
              {expandedMatch === match.user.id && (
                <div className="mt-4 pt-4 border-t">
                  <Tabs defaultValue="insights">
                    <TabsList className="mb-4">
                      <TabsTrigger value="insights">Compatibility</TabsTrigger>
                      <TabsTrigger value="reasons">Match Reasons</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="insights">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Why You Match</h4>
                        <ul className="space-y-2">
                          {match.compatibilityInsights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                              <span className="text-sm">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reasons">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Reasons to Connect</h4>
                        <ul className="space-y-2">
                          {match.matchReasons.map((reason, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Award className="h-4 w-4 text-primary mt-0.5" />
                              <span className="text-sm">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 text-xs"
                    onClick={() => toggleExpand(match.user.id)}
                  >
                    Show less
                    <ChevronUp className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="flex-col text-center text-sm text-muted-foreground">
        <p>
          These matches are generated by our intelligent matching algorithm based on your criteria.
        </p>
      </CardFooter>
    </Card>
  );
}

function MatchResultsLoading() {
  return (
    <Card className="w-full mx-auto max-w-4xl">
      <CardHeader>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
              <Skeleton className="h-16 w-16 rounded-full" />
              
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </div>
                
                <Skeleton className="h-2 w-full" />
                
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
                
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              
              <div className="flex md:flex-col gap-2 w-full md:w-auto">
                <Skeleton className="h-10 w-full md:w-28" />
                <Skeleton className="h-10 w-full md:w-28" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}