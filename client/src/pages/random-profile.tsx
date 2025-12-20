import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { ExternalLink, Github, Globe, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { FeedSkeleton } from "@/components/ui/skeleton-components";

// Import portfolio templates
import { 
  getPortfolioTemplate, 
  buildPortfolioTemplateProps 
} from "@/components/portfolio/templateRegistry";

// Type for our user data
interface UserData {
  id: number;
  username: string;
  name: string | null;
  email: string;
  photoURL: string | null;
  title: string | null;
  location: string | null;
  industry: string | null;
  domain?: string | null;
  lookingFor: string | null;
  phoneNumber: string | null;
  aboutMe?: string | null;
  whatIOffer?: string | null;
  jobLevel?: string | null;
  brandName: string | null;
  randomProfileLink?: string | null;
  selectedPortfolioLayout?: string | null;
  visitingCardType?: string | null;
  tagline?: string | null;
  visionStatement?: string | null;
  missionStatement?: string | null;
  coreValues?: string[] | null;
  uniqueValueProposition?: string | null;
  primaryAudience?: string[] | null;
  secondaryAudience?: string[] | null;
}

// Type for portfolio data
interface PortfolioData {
  layout: string;
  publicUrl: string | null;
  isPublished: boolean;
  customTitle: string;
  customBio: string;
  customizationOptions: {
    theme: string;
    showContact: boolean;
  };
  featuredProjects: any[];
  featuredSkills: any[];
  featuredExperiences: any[];
  skills: any[];
  experiences: any[];
  projects: any[];
  educations: any[];
  services: any[];
  userData: UserData;
}

// Random Profile Component
const RandomProfile = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Extract random link from URL - handle both /r/:randomLink and /profile/:userId
  const [matchRandom, paramsRandom] = useRoute("/r/:randomLink");
  const [matchProfile, paramsProfile] = useRoute("/profile/:userId");
  
  const randomLink = paramsRandom?.randomLink;
  const userId = paramsProfile?.userId;
  
  // Determine which endpoint to use - if userId is provided, fetch directly; otherwise use random link
  const useDirectUserId = !!userId && !randomLink;

  // Fetch user data by random link OR direct user ID
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery<UserData>({
    queryKey: useDirectUserId ? [`/api/users/${userId}`] : [`/api/r/${randomLink}`],
    enabled: useDirectUserId ? !!userId : !!randomLink,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch portfolio data if user exists
  const { data: portfolioData, isLoading: isPortfolioLoading } = useQuery<PortfolioData>({
    queryKey: [`/api/users/${userData?.id}/portfolio`],
    enabled: !!userData?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user experiences, projects, etc.
  const { data: experiences = [] } = useQuery<any[]>({
    queryKey: [`/api/users/${userData?.id}/experiences`],
    enabled: !!userData?.id,
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: [`/api/users/${userData?.id}/projects`],
    enabled: !!userData?.id,
  });

  const { data: skills = [] } = useQuery<any[]>({
    queryKey: [`/api/users/${userData?.id}/skills`],
    enabled: !!userData?.id,
  });

  const { data: educations = [] } = useQuery<any[]>({
    queryKey: [`/api/users/${userData?.id}/educations`],
    enabled: !!userData?.id,
  });

  const { data: services = [] } = useQuery<any[]>({
    queryKey: [`/api/users/${userData?.id}/services`],
    enabled: !!userData?.id,
  });

  // Handle loading state
  if (!randomLink && !userId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Profile Link</h1>
              <p className="text-gray-600 mb-6">The profile link you're looking for is not valid.</p>
              <Button onClick={() => navigate("/")}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <FeedSkeleton />
        </div>
      </div>
    );
  }

  if (userError || !userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Profile Not Found</h1>
              <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate("/")}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Determine which layout to use
  // Priority: Published portfolio > Default to Corporate Executive
  let layoutToRender = 'executive'; // Default: Corporate Executive
  
  if (portfolioData && portfolioData.isPublished) {
    // User has published a portfolio - use that layout
    layoutToRender = portfolioData.layout;
  }

  // Build template props using shared helper
  const templateProps = buildPortfolioTemplateProps(
    {
      ...userData,
      name: userData.name || userData.username,
      tagline: userData.tagline || null,
      visionStatement: userData.visionStatement || null,
      missionStatement: userData.missionStatement || null,
      coreValues: userData.coreValues || [],
      uniqueValueProposition: userData.uniqueValueProposition || null,
      brandName: userData.brandName || null,
      primaryAudience: userData.primaryAudience || [],
      secondaryAudience: userData.secondaryAudience || []
    },
    {
      skills: skills,
      experiences: experiences,
      projects: projects,
      educations: educations,
      services: services
    }
  );

  // Get the appropriate template component and render it
  const TemplateComponent = getPortfolioTemplate(layoutToRender);
  return <TemplateComponent {...templateProps} />;

  // Default profile view if no portfolio is published
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={userData.photoURL || ""} 
                  alt={userData.name || userData.username} 
                />
                <AvatarFallback className="text-lg">
                  {(userData.name || userData.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {userData.name || userData.username}
                </h1>
                {userData.title && (
                  <p className="text-xl text-gray-600 mb-3">{userData.title}</p>
                )}
                {userData.location && (
                  <p className="text-gray-500 flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4" />
                    {userData.location}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {userData.industry && (
                    <Badge variant="secondary">{userData.industry}</Badge>
                  )}
                  {userData.domain && (
                    <Badge variant="outline">{userData.domain}</Badge>
                  )}
                </div>
                
                {userData.aboutMe && (
                  <p className="text-gray-700 leading-relaxed">{userData.aboutMe}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {userData.whatIOffer && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">What I Offer</h2>
              <p className="text-gray-700 leading-relaxed">{userData.whatIOffer}</p>
            </CardContent>
          </Card>
        )}

        {userData.lookingFor && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Looking For</h2>
              <p className="text-gray-700 leading-relaxed">{userData.lookingFor}</p>
            </CardContent>
          </Card>
        )}

        {/* Display skills if available */}
        {skills.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any) => (
                  <Badge key={skill.id} variant="outline">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Connect</h2>
            <p className="text-gray-600 mb-4">Interested in connecting? Reach out through the platform!</p>
            <Button onClick={() => navigate("/")}>
              Visit Brandentifier
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RandomProfile;