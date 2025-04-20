import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, UserRound } from "lucide-react";
import { BrandOfTheDay, User } from "@shared/schema";

interface BrandOfTheDayWithUser extends BrandOfTheDay {
  userData?: {
    name: string | null;
    photoURL: string | null;
    title: string | null;
  };
}

export default function FeaturedProfessional() {
  const { user } = useAuth();
  const [brandWithUser, setBrandWithUser] = useState<BrandOfTheDayWithUser | null>(null);
  
  // Get user's industry and domain for fetching relevant Brand of the Day
  // Use the user context data - these are passed to authUser
  const industry = user?.title?.split(' ')[0] || "Technology"; // Default to Technology if not set
  const domain = "all"; // Default to 'all' as domain is not in AuthUser
  
  // Query to fetch Brand of the Day for the user's industry and domain
  const { 
    data: brandOfTheDay, 
    isLoading, 
    error 
  } = useQuery<BrandOfTheDay>({
    queryKey: [`/api/brands-of-the-day/${industry}/${domain}?demo=true`],
    enabled: !!user, // Only run if user is logged in
    refetchOnWindowFocus: false,
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
          // Use the same demo mode parameter to get enhanced user data
          const response = await fetch(`/api/users/${brandOfTheDay.userId}?demo=true`);
          if (response.ok) {
            const userData = await response.json() as User;
            console.log("Fetched user data for Brand of the Day:", userData);
            setBrandWithUser({
              ...brandOfTheDay,
              userData: {
                name: userData.name,
                photoURL: userData.photoURL,
                title: userData.title
              }
            });
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
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
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
                <div className="flex items-center mt-1 gap-2">
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    Brand of the Day
                  </Badge>
                  {brandWithUser.brandValueScore && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Brand Value: {brandWithUser.brandValueScore}/100
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