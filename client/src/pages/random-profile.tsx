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

  // Show loading state while portfolio data is being fetched
  if (isPortfolioLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <FeedSkeleton />
        </div>
      </div>
    );
  }

  // Determine which layout to use
  // Priority: User has portfolio record > use professional layout as default
  let layoutToRender = portfolioData?.layout || 'professional';

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
};

export default RandomProfile;