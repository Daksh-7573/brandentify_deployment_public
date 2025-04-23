import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, UserRound, Star } from "lucide-react";
import { BrandOfTheDay as BrandOfTheDayType, User } from "@shared/schema";

interface BrandOfTheDayWithUser extends BrandOfTheDayType {
  userData?: {
    name: string | null;
    photoURL: string | null;
    title: string | null;
  };
}

export default function BrandOfTheDay() {
  const { user } = useAuth();
  const [brandWithUser, setBrandWithUser] = useState<BrandOfTheDayWithUser | null>(null);
  
  // Get user's industry and domain for fetching relevant Brand of the Day
  // Use the user context data - these are passed to authUser
  const industry = user?.title?.split(' ')[0] || "Technology"; // Default to Technology if not set
  const domain = "all"; // Default to 'all' as domain is not in AuthUser
  
  // Query to fetch Brand of the Day for the user's industry and domain
  // Generate a timestamp that changes every minute to ensure dynamic score updates
  const currentMinute = Math.floor(Date.now() / (30 * 1000)); // Changes every 30 seconds
  
  const { 
    data: brandOfTheDay, 
    isLoading, 
    error 
  } = useQuery<BrandOfTheDayType>({
    queryKey: [`/api/brands-of-the-day/${industry}/${domain}?demo=true&t=${currentMinute}`],
    enabled: !!user, // Only run if user is logged in
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refetch every 30 seconds to show dynamic score changes
    // Handle 404 responses gracefully
    retry: (failureCount, error: any) => {
      // Don't retry if 404 (no brand of the day found)
      return !(error.status === 404) && failureCount < 3;
    }
  });
  
  // Fetch user data for the Brand of the Day
  useEffect(() => {
    const fetchUserData = async () => {
      if (brandOfTheDay) {
        try {
          // Use our dedicated endpoint for enhanced user data that doesn't affect profile editing
          const response = await fetch(`/api/enhanced-user/${brandOfTheDay.userId}`);
          
          if (response.ok) {
            const userData = await response.json() as User;
            console.log("Fetched enhanced user data for Brand of the Day:", userData);
            setBrandWithUser({
              ...brandOfTheDay,
              userData: {
                name: userData.name,
                photoURL: userData.photoURL,
                title: userData.title
              }
            });
          } else {
            // Fallback to standard user data if the dedicated endpoint fails
            console.log("Enhanced user endpoint failed, falling back to standard user data");
            const fallbackResponse = await fetch(`/api/users/${brandOfTheDay.userId}`);
            if (fallbackResponse.ok) {
              const userData = await fallbackResponse.json() as User;
              setBrandWithUser({
                ...brandOfTheDay,
                userData: {
                  name: userData.name,
                  photoURL: userData.photoURL || "/images/default-avatar.png", // Default avatar if none exists
                  title: userData.title
                }
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user data for Brand of the Day:", error);
        }
      }
    };
    
    if (brandOfTheDay) {
      fetchUserData();
    }
  }, [brandOfTheDay]);
  
  // If there's no brand of the day or loading, return null (don't show the section)
  if (isLoading || error || (!brandOfTheDay && !brandWithUser)) {
    return null;
  }
  
  // If we have the brand but still loading user data, show a loading state
  if (brandOfTheDay && !brandWithUser) {
    return (
      <Card className="mb-4 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <span>Brand Of The Day</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-12 w-12 rounded-full bg-muted"></div>
            <div className="flex-1">
              <div className="h-4 w-32 bg-muted rounded mb-2"></div>
              <div className="h-3 w-24 bg-muted rounded"></div>
              <div className="h-3 w-16 bg-muted rounded mt-1"></div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full bg-muted rounded"></div>
            <div className="h-3 w-2/3 bg-muted rounded"></div>
          </div>
          <div className="mt-3">
            <div className="h-8 w-full bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-4 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Award className="h-4 w-4 text-yellow-500" />
          <span>Brand Of The Day</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {brandWithUser && (
          <>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src={brandWithUser.userData?.photoURL || undefined} alt={brandWithUser.userData?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {brandWithUser.userData?.name?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold">{brandWithUser.userData?.name}</h4>
                <p className="text-sm text-muted-foreground">{brandWithUser.userData?.title}</p>
                <div className="flex items-center mt-1">
                  {brandWithUser.brandValueScore && (
                    <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                      <Award className="h-3 w-3 text-blue-500" />
                      {brandWithUser.brandValueScore}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm">{brandWithUser.muskComment}</p>
            </div>
            <div className="mt-3">
              {/* View Profile Button */}
              <a href={`/profile/${brandWithUser.userId}`} target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="default" 
                  size="sm"
                  className="w-full flex items-center gap-1"
                >
                  <UserRound className="h-3 w-3" />
                  <span>View Full Profile</span>
                </Button>
              </a>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}