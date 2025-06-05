import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, Briefcase, Heart, Mail, Phone } from "lucide-react";

// Portfolio template imports
import MinimalistPro from "@/components/portfolio/templates/minimalist-pro";
import TimelineStoryteller from "@/components/portfolio/templates/timeline-storyteller";
import VisualExpert from "@/components/portfolio/templates/visual-expert";
import FreelancerHub from "@/components/portfolio/templates/freelancer-hub";
import Scholar from "@/components/portfolio/templates/scholar";
import AnimatedOdyssey from "@/components/portfolio/templates/animated-odyssey";
import DynamicInnovator from "@/components/portfolio/templates/dynamic-innovator";
import CorporateExecutive from "@/components/portfolio/templates/corporate-executive";

interface UserData {
  id: number;
  username: string;
  name: string | null;
  email?: string | null;
  brandName: string;
  photoURL: string | null;
  title: string | null;
  aboutMe: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  lookingFor: string | null;
  whatIOffer: string | null;
  selectedPortfolioLayout: string;
  visitingCardType: string | null;
  jobLevel?: string | null;
  createdAt: string;
}

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

export default function BrandProfile() {
  const params = useParams();
  const brandName = params.brandName;

  console.log(`[BrandProfile] Loading profile for brand name: ${brandName}`);

  // Fetch user data by brand name
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: [`/api/users/brand/${brandName}`],
    enabled: !!brandName,
  }) as { data: UserData | undefined, isLoading: boolean, error: any };

  // Fetch user's profile data once we have the user ID
  const { data: userSkills = [], isLoading: isSkillsLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/skills`],
    enabled: !!userData?.id,
  });

  const { data: userExperiences = [], isLoading: isExperiencesLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/experiences`],
    enabled: !!userData?.id,
  });

  const { data: userProjects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/projects`],
    enabled: !!userData?.id,
  });

  const { data: userEducations = [], isLoading: isEducationsLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/educations`],
    enabled: !!userData?.id,
  });

  const { data: userServices = [], isLoading: isServicesLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/services`],
    enabled: !!userData?.id,
  });

  // Construct portfolio data from all fetched components
  const portfolioData: PortfolioData | null = userData ? {
    layout: userData.selectedPortfolioLayout || 'professional',
    publicUrl: null,
    isPublished: true,
    customTitle: userData.name || userData.username,
    customBio: userData.aboutMe || '',
    customizationOptions: {
      theme: 'colorful',
      showContact: true
    },
    featuredProjects: [],
    featuredSkills: [],
    featuredExperiences: [],
    skills: userSkills,
    experiences: userExperiences,
    projects: userProjects,
    educations: userEducations,
    services: userServices,
    userData: userData
  } : null;

  const isPortfolioLoading = isSkillsLoading || isExperiencesLoading || isProjectsLoading || 
                            isEducationsLoading || isServicesLoading;

  // Handle loading state
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle user not found
  if (userError || !userData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 max-w-6xl">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <User className="h-16 w-16 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Profile Not Found</h1>
                <p className="text-muted-foreground">
                  The profile URL "{brandName}" doesn't exist or has been removed.
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show basic profile view for now
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 max-w-6xl">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userData?.photoURL || undefined} alt={userData?.name || userData?.username} />
                <AvatarFallback>
                  {userData?.name?.charAt(0) || userData?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{userData?.name || userData?.username}</h1>
                {userData?.title && (
                  <p className="text-lg text-muted-foreground mt-1">{userData.title}</p>
                )}
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
                  {userData?.location && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      {userData.location}
                    </Badge>
                  )}
                  {userData?.industry && (
                    <Badge variant="outline" className="gap-1">
                      <Briefcase className="w-3 h-3" />
                      {userData.industry}
                    </Badge>
                  )}
                  {userData?.lookingFor && (
                    <Badge variant="outline" className="gap-1">
                      <Heart className="w-3 h-3" />
                      {userData.lookingFor.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                
                {userData?.aboutMe && (
                  <p className="mt-4 text-muted-foreground">{userData.aboutMe}</p>
                )}

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Portfolio Layout: <span className="font-medium">{userData?.selectedPortfolioLayout || 'professional'}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Profile URL: {window.location.host}/{userData?.brandName}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}