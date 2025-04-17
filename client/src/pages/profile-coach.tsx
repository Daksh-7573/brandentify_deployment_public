import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Award,
  LineChart,
  Briefcase,
  GraduationCap,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import ProfileSectionEditor from "@/components/profile-coach/profile-section-editor";
import ProfileCompleteness from "@/components/profile-coach/profile-completeness";
import ProfileImprovement from "@/components/profile-coach/profile-improvement";
import SkeletonProfileCoach from "@/components/profile-coach/skeleton-profile-coach";

interface ProfileAnalysis {
  overallAnalysis: string;
  profileCompleteness: number;
  sectionFeedback: {
    basic: {
      strengths: string[];
      weaknesses: string[];
    };
    experience: {
      strengths: string[];
      weaknesses: string[];
    };
    education: {
      strengths: string[];
      weaknesses: string[];
    };
    skills: {
      strengths: string[];
      weaknesses: string[];
    };
    projects: {
      strengths: string[];
      weaknesses: string[];
    };
  };
  improvementPriorities: string[];
  keywordRecommendations: string[];
}

export default function ProfileCoachPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionContent, setSectionContent] = useState<any>(null);
  
  // Fetch profile analysis
  const { data: profileAnalysis, isLoading, error, refetch } = useQuery<ProfileAnalysis>({
    queryKey: ["/api/profile-coach/analysis", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await fetch(`/api/profile-coach/analysis/${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile analysis");
      }
      return response.json();
    },
    enabled: !!user?.id,
  });
  
  const handleRefreshAnalysis = () => {
    refetch();
    toast({
      title: "Analysis Refreshed",
      description: "Your profile analysis has been updated with the latest data."
    });
  };
  
  const handleEditSection = (section: string, content: any) => {
    setActiveSection(section);
    setSectionContent(content);
  };
  
  const handleCloseEditor = () => {
    setActiveSection(null);
    setSectionContent(null);
    // Refresh analysis to get updated data
    refetch();
  };
  
  if (isLoading) {
    return <SkeletonProfileCoach />;
  }
  
  if (error) {
    return (
      <Card className="mx-auto max-w-5xl mt-8">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">Error Loading Profile Analysis</CardTitle>
          <CardDescription>
            We couldn't load your profile analysis. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!profileAnalysis) {
    return (
      <Card className="mx-auto max-w-5xl mt-8">
        <CardHeader>
          <CardTitle className="text-xl">No Profile Analysis Available</CardTitle>
          <CardDescription>
            We couldn't find any analysis for your profile. Let's create one now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>Generate Profile Analysis</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="container py-8 px-4">
      {activeSection ? (
        <ProfileSectionEditor 
          section={activeSection}
          content={sectionContent}
          userId={user?.id}
          onClose={handleCloseEditor}
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profile Coach</h1>
              <p className="text-muted-foreground mt-1">
                Get AI-powered analysis and recommendations to enhance your professional profile
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefreshAnalysis}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Analysis
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Profile Completeness Card */}
            <ProfileCompleteness 
              score={profileAnalysis.profileCompleteness} 
              className="lg:col-span-4"
            />
            
            {/* Profile Improvement Card */}
            <ProfileImprovement 
              priorities={profileAnalysis.improvementPriorities}
              keywords={profileAnalysis.keywordRecommendations}
              className="lg:col-span-8"
            />
          </div>
          
          {/* Overall Analysis */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">Overall Analysis</CardTitle>
              <CardDescription>
                Expert review of your professional profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {profileAnalysis.overallAnalysis}
              </p>
            </CardContent>
          </Card>
          
          {/* Section Feedback */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">Section Feedback</CardTitle>
              <CardDescription>
                Detailed analysis of each section of your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center mb-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-medium">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {profileAnalysis.sectionFeedback.basic.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                        <h3 className="font-medium">Areas to Improve</h3>
                      </div>
                      <ul className="space-y-2">
                        {profileAnalysis.sectionFeedback.basic.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button
                    onClick={() => handleEditSection("basic", user)}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Basic Info
                  </Button>
                </TabsContent>
                
                <TabsContent value="experience" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center mb-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-medium">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {profileAnalysis.sectionFeedback.experience.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                        <h3 className="font-medium">Areas to Improve</h3>
                      </div>
                      <ul className="space-y-2">
                        {profileAnalysis.sectionFeedback.experience.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button
                    onClick={() => handleEditSection("experience", {})}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Work Experience
                  </Button>
                </TabsContent>
                
                <TabsContent value="education" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center mb-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-medium">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {profileAnalysis.sectionFeedback.education.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                        <h3 className="font-medium">Areas to Improve</h3>
                      </div>
                      <ul className="space-y-2">
                        {profileAnalysis.sectionFeedback.education.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button
                    onClick={() => handleEditSection("education", {})}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Education
                  </Button>
                </TabsContent>
                
                <TabsContent value="skills" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center mb-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-medium">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {profileAnalysis.sectionFeedback.skills.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                        <h3 className="font-medium">Areas to Improve</h3>
                      </div>
                      <ul className="space-y-2">
                        {profileAnalysis.sectionFeedback.skills.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button
                    onClick={() => handleEditSection("skills", {})}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Skills
                  </Button>
                </TabsContent>
                
                <TabsContent value="projects" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center mb-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-medium">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {profileAnalysis.sectionFeedback.projects.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                        <h3 className="font-medium">Areas to Improve</h3>
                      </div>
                      <ul className="space-y-2">
                        {profileAnalysis.sectionFeedback.projects.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button
                    onClick={() => handleEditSection("projects", {})}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Projects
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}