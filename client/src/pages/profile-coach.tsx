import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProfileSectionEditor from "../components/profile-coach/profile-section-editor";
import ProfileCompleteness from "../components/profile-coach/profile-completeness";
import ProfileImprovement from "../components/profile-coach/profile-improvement";
import SkeletonProfileCoach from "../components/profile-coach/skeleton-profile-coach";
import Header from "../components/layout/header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ProfileCoach() {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const { toast } = useToast();
  
  // In a real app, this would be the logged-in user's ID
  const userId = 1;
  
  // Fetch profile analysis data
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/profile-coach/analyze", userId],
    queryFn: async () => {
      const response = await apiRequest(`/api/profile-coach/analyze?userId=${userId}`);
      return response;
    },
  });
  
  // Handle section edit
  const handleEditSection = (section: string, content: any) => {
    setEditingSection(section);
    setEditingContent(content);
  };
  
  // Handle section edit close
  const handleCloseEditor = () => {
    setEditingSection(null);
    setEditingContent(null);
    // Refetch profile data to get updated information
    refetch();
  };
  
  // Handle refresh analysis
  const handleRefreshAnalysis = async () => {
    try {
      await apiRequest("/api/profile-coach/refresh-analysis", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      
      toast({
        title: "Analysis refreshed",
        description: "Your profile analysis has been updated.",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh analysis. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <SkeletonProfileCoach />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              An error occurred while loading your profile analysis. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      {editingSection ? (
        <ProfileSectionEditor
          section={editingSection}
          content={editingContent}
          userId={userId}
          onClose={handleCloseEditor}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Profile Coach</h1>
              <p className="text-lg text-muted-foreground">
                Get personalized recommendations to improve your professional profile
              </p>
            </div>
            <Button variant="outline" onClick={handleRefreshAnalysis}>
              Refresh Analysis
            </Button>
          </div>
          
          <ProfileCompleteness
            score={profileData.completenessScore}
            priorities={profileData.improvementPriorities}
            className="mb-8"
          />
          
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-8"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Analysis</CardTitle>
                  <CardDescription>
                    Comprehensive evaluation of your professional profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Recommended Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.recommendedKeywords.map((keyword: string, index: number) => (
                        <span
                          key={index}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Overall Analysis</h3>
                    <div className="whitespace-pre-line text-muted-foreground">
                      {profileData.overallAnalysis}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="basic">
              <ProfileImprovement
                title="Basic Information"
                data={profileData.basicInfo}
                feedback={profileData.basicFeedback}
                onEdit={() => handleEditSection("basic", profileData.basicInfo)}
              />
            </TabsContent>
            
            <TabsContent value="experience">
              <ProfileImprovement
                title="Work Experience"
                data={profileData.experiences}
                feedback={profileData.experienceFeedback}
                onEdit={(item) => handleEditSection("experience", item)}
                onAdd={() => handleEditSection("experience", { userId })}
                isCollection
              />
            </TabsContent>
            
            <TabsContent value="education">
              <ProfileImprovement
                title="Education"
                data={profileData.educations}
                feedback={profileData.educationFeedback}
                onEdit={(item) => handleEditSection("education", item)}
                onAdd={() => handleEditSection("education", { userId })}
                isCollection
              />
            </TabsContent>
            
            <TabsContent value="skills">
              <ProfileImprovement
                title="Skills"
                data={profileData.skills}
                feedback={profileData.skillsFeedback}
                onEdit={(item) => handleEditSection("skills", item)}
                onAdd={() => handleEditSection("skills", { userId })}
                isCollection
              />
            </TabsContent>
            
            <TabsContent value="projects">
              <ProfileImprovement
                title="Projects"
                data={profileData.projects}
                feedback={profileData.projectsFeedback}
                onEdit={(item) => handleEditSection("projects", item)}
                onAdd={() => handleEditSection("projects", { userId })}
                isCollection
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}