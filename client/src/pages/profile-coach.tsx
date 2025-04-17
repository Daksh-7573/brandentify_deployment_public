import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import ProfileSectionEditor from "@/components/profile-coach/profile-section-editor";
import ProfileCompleteness from "@/components/profile-coach/profile-completeness";
import ProfileImprovement from "@/components/profile-coach/profile-improvement";
import SkeletonProfileCoach from "@/components/profile-coach/skeleton-profile-coach";
import { AlertCircle, BookOpen, BriefcaseBusiness, Building2, Brain, Award, FileEdit } from "lucide-react";

export default function ProfileCoach() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState("overview");
  const [editSection, setEditSection] = useState<string | null>(null);
  const [sectionContent, setSectionContent] = useState<any>(null);
  
  // Fetch profile analysis from the API
  const { data: profileAnalysis, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/profile-coach/analyze", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await fetch(`/api/profile-coach/analyze?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile analysis");
      }
      
      return response.json();
    },
    enabled: !!user?.id,
  });
  
  // Request a refresh of the profile analysis
  const refreshAnalysisMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await fetch(`/api/profile-coach/refresh-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to refresh analysis");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis Refreshed",
        description: "Your profile analysis has been updated with the latest data.",
      });
      refetch();
    },
    onError: (error) => {
      console.error("Error refreshing analysis:", error);
      toast({
        title: "Error",
        description: "Failed to refresh your profile analysis. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Open the section editor
  const openSectionEditor = (section: string, content: any = {}) => {
    setEditSection(section);
    setSectionContent(content);
  };
  
  // Close the section editor and refresh data
  const closeSectionEditor = () => {
    setEditSection(null);
    setSectionContent(null);
    refetch();
  };
  
  // Handle section tab click
  const handleSectionTabClick = (section: string) => {
    setCurrentTab(section);
  };
  
  // If loading or error, show appropriate UI
  if (isLoading) return <SkeletonProfileCoach />;
  
  if (error) {
    return (
      <>
        <Header />
        <div className="container py-8 px-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Unable to Load Profile Analysis</h2>
            <p className="text-muted-foreground mb-6">
              We encountered an error while analyzing your profile. Please try again later.
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </>
    );
  }
  
  // Show section editor if a section is being edited
  if (editSection) {
    return (
      <>
        <Header />
        <div className="container py-8 px-4">
          <ProfileSectionEditor
            section={editSection}
            content={sectionContent}
            userId={user?.id}
            onClose={closeSectionEditor}
          />
        </div>
      </>
    );
  }
  
  // Render main profile coach view
  return (
    <>
      <SiteHeader />
      <div className="container py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Profile Coach</h1>
            <p className="text-muted-foreground">
              AI-powered insights and recommendations to enhance your professional profile
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refreshAnalysisMutation.mutate()}
            disabled={refreshAnalysisMutation.isPending}
          >
            {refreshAnalysisMutation.isPending ? "Refreshing..." : "Refresh Analysis"}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Completeness Card */}
          <ProfileCompleteness 
            score={profileAnalysis?.completenessScore || 0} 
            className="lg:col-span-4"
          />
          
          {/* Profile Improvement Card */}
          <ProfileImprovement 
            priorities={profileAnalysis?.improvementPriorities || []}
            keywords={profileAnalysis?.recommendedKeywords || []}
            className="lg:col-span-8"
          />
        </div>
        
        {/* Overall Analysis */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Overall Analysis</CardTitle>
            <CardDescription>
              AI-generated insights about your current profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              {profileAnalysis?.overallAnalysis || "No analysis available yet. Please refresh your analysis."}
            </p>
          </CardContent>
        </Card>
        
        {/* Section Feedback */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Section-by-Section Feedback</CardTitle>
            <CardDescription>
              Review and improve specific sections of your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="overview" 
              value={currentTab} 
              onValueChange={setCurrentTab}
              className="w-full"
            >
              <TabsList className="mb-4 flex flex-wrap">
                <TabsTrigger value="overview" onClick={() => handleSectionTabClick("overview")}>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="basic" onClick={() => handleSectionTabClick("basic")}>
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="experience" onClick={() => handleSectionTabClick("experience")}>
                  Experience
                </TabsTrigger>
                <TabsTrigger value="education" onClick={() => handleSectionTabClick("education")}>
                  Education
                </TabsTrigger>
                <TabsTrigger value="skills" onClick={() => handleSectionTabClick("skills")}>
                  Skills
                </TabsTrigger>
                <TabsTrigger value="projects" onClick={() => handleSectionTabClick("projects")}>
                  Projects
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Basic Info Card */}
                  <Card className="cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => handleSectionTabClick("basic")}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-primary" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {profileAnalysis?.basicFeedback?.summary || "Complete your basic information"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{profileAnalysis?.basicFeedback?.completeness || 0}% Complete</span>
                        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={(e) => {
                          e.stopPropagation();
                          openSectionEditor("basic", profileAnalysis?.basicInfo);
                        }}>
                          <FileEdit className="h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Experience Card */}
                  <Card className="cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => handleSectionTabClick("experience")}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <BriefcaseBusiness className="h-5 w-5 mr-2 text-primary" />
                        Work Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {profileAnalysis?.experienceFeedback?.summary || "Add your work experience"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{profileAnalysis?.experienceFeedback?.count || 0} Entries</span>
                        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={(e) => {
                          e.stopPropagation();
                          openSectionEditor("experience");
                        }}>
                          <FileEdit className="h-3 w-3" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Education Card */}
                  <Card className="cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => handleSectionTabClick("education")}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-primary" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {profileAnalysis?.educationFeedback?.summary || "Add your education history"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{profileAnalysis?.educationFeedback?.count || 0} Entries</span>
                        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={(e) => {
                          e.stopPropagation();
                          openSectionEditor("education");
                        }}>
                          <FileEdit className="h-3 w-3" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Skills Card */}
                  <Card className="cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => handleSectionTabClick("skills")}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-primary" />
                        Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {profileAnalysis?.skillsFeedback?.summary || "Add your professional skills"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{profileAnalysis?.skillsFeedback?.count || 0} Skills</span>
                        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={(e) => {
                          e.stopPropagation();
                          openSectionEditor("skills");
                        }}>
                          <FileEdit className="h-3 w-3" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Projects Card */}
                  <Card className="cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => handleSectionTabClick("projects")}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Award className="h-5 w-5 mr-2 text-primary" />
                        Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {profileAnalysis?.projectsFeedback?.summary || "Add your showcase projects"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{profileAnalysis?.projectsFeedback?.count || 0} Projects</span>
                        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={(e) => {
                          e.stopPropagation();
                          openSectionEditor("projects");
                        }}>
                          <FileEdit className="h-3 w-3" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="basic">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <Button onClick={() => openSectionEditor("basic", profileAnalysis?.basicInfo)}>
                      Edit Basic Info
                    </Button>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Current Status</h4>
                      <ul className="space-y-2 text-sm">
                        {profileAnalysis?.basicFeedback?.strengths?.map((strength: string, index: number) => (
                          <li key={`strength-${index}`} className="flex items-start gap-2">
                            <div className="text-emerald-500 mt-0.5">✓</div>
                            <span className="text-muted-foreground">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Improvement Opportunities</h4>
                      <ul className="space-y-2 text-sm">
                        {profileAnalysis?.basicFeedback?.improvements?.map((improvement: string, index: number) => (
                          <li key={`improvement-${index}`} className="flex items-start gap-2">
                            <div className="text-amber-500 mt-0.5">→</div>
                            <span className="text-muted-foreground">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="experience">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Work Experience</h3>
                    <Button onClick={() => openSectionEditor("experience")}>
                      Add Work Experience
                    </Button>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Current Status</h4>
                      <ul className="space-y-2 text-sm">
                        {profileAnalysis?.experienceFeedback?.strengths?.map((strength: string, index: number) => (
                          <li key={`exp-strength-${index}`} className="flex items-start gap-2">
                            <div className="text-emerald-500 mt-0.5">✓</div>
                            <span className="text-muted-foreground">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Improvement Opportunities</h4>
                      <ul className="space-y-2 text-sm">
                        {profileAnalysis?.experienceFeedback?.improvements?.map((improvement: string, index: number) => (
                          <li key={`exp-improvement-${index}`} className="flex items-start gap-2">
                            <div className="text-amber-500 mt-0.5">→</div>
                            <span className="text-muted-foreground">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* List of Experience Entries */}
                  {profileAnalysis?.experiences && profileAnalysis.experiences.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">Your Experience Entries</h4>
                      <div className="space-y-3">
                        {profileAnalysis.experiences.map((exp: any, index: number) => (
                          <Card key={`exp-entry-${index}`} className="overflow-hidden">
                            <div className="flex justify-between items-start p-4">
                              <div>
                                <h5 className="font-medium">{exp.title}</h5>
                                <p className="text-sm text-muted-foreground">
                                  {exp.company}{exp.location ? `, ${exp.location}` : ''} | {exp.startDate} - {exp.endDate || 'Present'}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openSectionEditor("experience", exp)}
                              >
                                Edit
                              </Button>
                            </div>
                            {exp.description && (
                              <div className="px-4 pb-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">{exp.description}</p>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="education">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Education</h3>
                    <Button onClick={() => openSectionEditor("education")}>
                      Add Education
                    </Button>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Current Status</h4>
                      <ul className="space-y-2 text-sm">
                        {profileAnalysis?.educationFeedback?.strengths?.map((strength: string, index: number) => (
                          <li key={`edu-strength-${index}`} className="flex items-start gap-2">
                            <div className="text-emerald-500 mt-0.5">✓</div>
                            <span className="text-muted-foreground">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Improvement Opportunities</h4>
                      <ul className="space-y-2 text-sm">
                        {profileAnalysis?.educationFeedback?.improvements?.map((improvement: string, index: number) => (
                          <li key={`edu-improvement-${index}`} className="flex items-start gap-2">
                            <div className="text-amber-500 mt-0.5">→</div>
                            <span className="text-muted-foreground">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* List of Education Entries */}
                  {profileAnalysis?.educations && profileAnalysis.educations.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">Your Education Entries</h4>
                      <div className="space-y-3">
                        {profileAnalysis.educations.map((edu: any, index: number) => (
                          <Card key={`edu-entry-${index}`} className="overflow-hidden">
                            <div className="flex justify-between items-start p-4">
                              <div>
                                <h5 className="font-medium">{edu.degree} in {edu.fieldOfStudy}</h5>
                                <p className="text-sm text-muted-foreground">
                                  {edu.institution} | {edu.startDate} - {edu.endDate || 'Present'}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openSectionEditor("education", edu)}
                              >
                                Edit
                              </Button>
                            </div>
                            {edu.description && (
                              <div className="px-4 pb-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">{edu.description}</p>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="skills">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Skills</h3>
                    <Button onClick={() => openSectionEditor("skills")}>
                      Add Skill
                    </Button>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Current Status</h4>
                      <ul className="space-y-2 text-sm">
                        {profileAnalysis?.skillsFeedback?.strengths?.map((strength: string, index: number) => (
                          <li key={`skill-strength-${index}`} className="flex items-start gap-2">
                            <div className="text-emerald-500 mt-0.5">✓</div>
                            <span className="text-muted-foreground">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Improvement Opportunities</h4>
                      <ul className="space-y-2 text-sm">
                        {profileAnalysis?.skillsFeedback?.improvements?.map((improvement: string, index: number) => (
                          <li key={`skill-improvement-${index}`} className="flex items-start gap-2">
                            <div className="text-amber-500 mt-0.5">→</div>
                            <span className="text-muted-foreground">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* List of Skills */}
                  {profileAnalysis?.skills && profileAnalysis.skills.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">Your Skills</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {profileAnalysis.skills.map((skill: any, index: number) => (
                          <Card key={`skill-entry-${index}`} className="overflow-hidden">
                            <div className="flex justify-between items-start p-4">
                              <div>
                                <h5 className="font-medium">{skill.name}</h5>
                                <p className="text-sm text-muted-foreground flex items-center">
                                  <span className="mr-2">{skill.proficiency}</span>
                                  {skill.yearsOfExperience && (
                                    <span>• {skill.yearsOfExperience} years</span>
                                  )}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openSectionEditor("skills", skill)}
                              >
                                Edit
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="projects">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Projects</h3>
                    <Button onClick={() => openSectionEditor("projects")}>
                      Add Project
                    </Button>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Current Status</h4>
                      <ul className="space-y-2 text-sm">
                        {profileAnalysis?.projectsFeedback?.strengths?.map((strength: string, index: number) => (
                          <li key={`proj-strength-${index}`} className="flex items-start gap-2">
                            <div className="text-emerald-500 mt-0.5">✓</div>
                            <span className="text-muted-foreground">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Improvement Opportunities</h4>
                      <ul className="space-y-2 text-sm">
                        {profileAnalysis?.projectsFeedback?.improvements?.map((improvement: string, index: number) => (
                          <li key={`proj-improvement-${index}`} className="flex items-start gap-2">
                            <div className="text-amber-500 mt-0.5">→</div>
                            <span className="text-muted-foreground">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* List of Projects */}
                  {profileAnalysis?.projects && profileAnalysis.projects.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">Your Projects</h4>
                      <div className="space-y-3">
                        {profileAnalysis.projects.map((project: any, index: number) => (
                          <Card key={`proj-entry-${index}`} className="overflow-hidden">
                            <div className="flex justify-between items-start p-4">
                              <div>
                                <h5 className="font-medium">{project.title}</h5>
                                <p className="text-sm text-muted-foreground">
                                  {project.startDate} - {project.endDate || 'Ongoing'} • {project.status || 'No Status'}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openSectionEditor("projects", project)}
                              >
                                Edit
                              </Button>
                            </div>
                            {project.description && (
                              <div className="px-4 pb-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                {project.url && (
                                  <a 
                                    href={project.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary mt-2 inline-block hover:underline"
                                  >
                                    View Project
                                  </a>
                                )}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}