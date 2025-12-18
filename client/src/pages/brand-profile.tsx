import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, Briefcase, Heart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Portfolio template imports
import { 
  getPortfolioTemplate, 
  buildPortfolioTemplateProps 
} from "@/components/portfolio/templateRegistry";
import { ProfilePageSkeleton } from "@/components/ui/page-skeletons/profile-skeleton";

interface UserData {
  id: number;
  username: string;
  name: string | null;
  email?: string | null;
  brandName: string;
  photoURL: string | null;
  title: string | null;
  company: string | null;
  aboutMe: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  lookingFor: string | null;
  whatIOffer: string | null;
  selectedPortfolioLayout: string;
  visitingCardType: string | null;
  jobLevel?: string | null;
  tagline: string | null;
  visionStatement: string | null;
  missionStatement: string | null;
  coreValues: string[];
  uniqueValueProposition: string | null;
  primaryAudience: string[];
  secondaryAudience: string[];
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

interface BrandProfileProps {
  brandName: string;
}

export default function BrandProfile({ brandName }: BrandProfileProps) {
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

  // Fetch the user's published portfolio (optional - render even if this fails)
  const { data: publishedPortfolio } = useQuery({
    queryKey: [`/api/users/${userData?.id}/portfolio`], 
    queryFn: async () => {
      if (!userData?.id) return null;
      try {
        const response = await fetch(`/api/users/${userData.id}/portfolio`);
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error('Portfolio fetch error:', error);
        return null;
      }
    },
    enabled: !!userData?.id,
    retry: false
  });

  // Loading state - only wait for essential queries
  if (isUserLoading) {
    return <ProfilePageSkeleton />;
  }
  
  // Wait for other data if still loading
  if (isSkillsLoading || isExperiencesLoading || isProjectsLoading || isEducationsLoading || isServicesLoading) {
    return <ProfilePageSkeleton />;
  }

  // Construct portfolio data from all fetched components
  const portfolioData: PortfolioData | null = userData && publishedPortfolio ? {
    layout: publishedPortfolio.layout,
    publicUrl: publishedPortfolio.publicUrl,
    isPublished: publishedPortfolio.isPublished,
    customTitle: publishedPortfolio.customTitle || userData.name || userData.username,
    customBio: publishedPortfolio.customBio || userData.aboutMe || '',
    customizationOptions: publishedPortfolio.customizationOptions || {
      theme: 'colorful',
      showContact: true
    },
    featuredProjects: publishedPortfolio.featuredProjects || [],
    featuredSkills: publishedPortfolio.featuredSkills || [],
    featuredExperiences: publishedPortfolio.featuredExperiences || [],
    skills: Array.isArray(userSkills) ? userSkills : [],
    experiences: Array.isArray(userExperiences) ? userExperiences : [],
    projects: Array.isArray(userProjects) ? userProjects : [],
    educations: Array.isArray(userEducations) ? userEducations : [],
    services: Array.isArray(userServices) ? userServices : [],
    userData: userData
  } : null;

  // If user data exists, we can render - don't wait for portfolio data
  // Portfolio data will fill in template details if available
  if (!userData) {
    console.log("No userData available");
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 max-w-6xl">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <h1 className="text-2xl font-bold">User Not Found</h1>
                <p className="text-muted-foreground">
                  Unable to load user data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the appropriate portfolio template based on selected layout
  const renderPortfolioTemplate = () => {
    const layout = portfolioData?.layout || 'corporate-executive';
    
    console.log("Rendering portfolio template:");
    console.log("- layout:", layout);
    console.log("- portfolioData:", portfolioData);
    
    // Build template props using shared helper
    const templateProps = buildPortfolioTemplateProps(
      {
        ...userData,
        name: userData.name || userData.username,
        company: userData.company || null,
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
        skills: portfolioData?.skills,
        experiences: portfolioData?.experiences,
        projects: portfolioData?.projects,
        educations: portfolioData?.educations,
        services: portfolioData?.services
      }
    );
    
    // Get the appropriate template component and render it
    const TemplateComponent = getPortfolioTemplate(layout);
    return <TemplateComponent {...templateProps} />;
  };

  return renderPortfolioTemplate();
}