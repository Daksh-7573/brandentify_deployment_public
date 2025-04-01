import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ChatInterface from "@/components/chat/chat-interface";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function AICareer() {
  const { isAuthenticated, isLoading, user, isDemoMode } = useAuth();
  const [_, setLocation] = useLocation();
  const [activeQuestion, setActiveQuestion] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const userId = isDemoMode ? 1 : user?.uid ? parseInt(user.uid) : null;

  // Fetch user's skills, experiences, and education
  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
    enabled: !!userId && isAuthenticated,
  });

  const { data: experiences, isLoading: experiencesLoading } = useQuery({
    queryKey: [`/api/users/${userId}/experiences`],
    enabled: !!userId && isAuthenticated,
  });

  const { data: educations, isLoading: educationsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/educations`],
    enabled: !!userId && isAuthenticated,
  });

  // Redirect to landing if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Personalized suggested questions based on user profile
  const suggestedQuestions = [
    user?.title 
      ? `What skills should I develop as a ${user?.title}?`
      : "What skills should I develop for my next career move?",
    user?.title
      ? `How can I transition from ${user?.title} to a leadership role?`
      : "How can I transition to a leadership role?",
    "What certifications would be most valuable for my career?",
    user?.location
      ? `What are the current job trends in ${user?.location}?`
      : "What are the current industry trends I should be aware of?"
  ];

  const handleQuestionClick = (question: string) => {
    setActiveQuestion(question);
  };

  // Profile completeness calculation
  const calculateProfileCompleteness = () => {
    let score = 0;
    if (user?.name) score += 20;
    if (user?.title) score += 20;
    if (user?.location) score += 10;
    if (skills && Array.isArray(skills) && skills.length > 0) score += 20;
    if (experiences && Array.isArray(experiences) && experiences.length > 0) score += 20;
    if (educations && Array.isArray(educations) && educations.length > 0) score += 10;
    return score;
  };

  const profileCompleteness = calculateProfileCompleteness();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activePage="ai-career" />

        {/* Center content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50 flex flex-col">
          <div className="mx-auto w-full max-w-3xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">AI Career Booster</h1>
              <Badge variant="outline" className="px-3 py-1 text-sm">
                {profileCompleteness < 40 
                  ? "Limited Profile Analysis" 
                  : profileCompleteness < 70 
                    ? "Partial Profile Analysis" 
                    : "Full Profile Analysis"}
              </Badge>
            </div>
            
            {/* Profile Snapshot Card */}
            <Card className="mb-6 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profile Being Analyzed by Musk
                </CardTitle>
                <CardDescription>
                  Musk uses this information to provide personalized career advice
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="font-medium">{user?.name || "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Title</p>
                    <p className="font-medium">{user?.title || "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="font-medium">{user?.location || "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Profile Completeness</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          profileCompleteness < 40 ? 'bg-red-500' : 
                          profileCompleteness < 70 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`} 
                        style={{ width: `${profileCompleteness}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {profileCompleteness}% complete
                      {profileCompleteness < 70 && " (add more details for better advice)"}
                    </p>
                  </div>
                </div>
                
                {/* Skills */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                  {skillsLoading ? (
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  ) : skills && Array.isArray(skills) && skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: any) => (
                        <Badge key={skill.id} variant="secondary" className="px-2 py-1">
                          {skill.name}
                          {skill.level && ` (${skill.level})`}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No skills specified</p>
                  )}
                </div>
                
                {/* Experience Summary */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Experience</h3>
                  {experiencesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : experiences && Array.isArray(experiences) && experiences.length > 0 ? (
                    <div className="text-sm space-y-1">
                      {experiences.slice(0, 2).map((exp: any) => (
                        <p key={exp.id}>
                          <span className="font-medium">{exp.title}</span> at {exp.company}
                        </p>
                      ))}
                      {experiences.length > 2 && (
                        <p className="text-xs text-gray-500">+ {experiences.length - 2} more experiences</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No work experience specified</p>
                  )}
                </div>
                
                {/* Education Summary */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Education</h3>
                  {educationsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : educations && Array.isArray(educations) && educations.length > 0 ? (
                    <div className="text-sm">
                      {educations.slice(0, 2).map((edu: any) => (
                        <p key={edu.id}>
                          <span className="font-medium">{edu.degree}</span> from {edu.institution}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No education specified</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* AI Chat Interface */}
            <ChatInterface initialQuestion={activeQuestion} />
            
            {/* Suggested Questions */}
            <Card className="mt-6 shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Personalized Suggested Questions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`justify-start text-left ${
                        activeQuestion === question 
                          ? 'bg-primary/10 text-primary border-primary' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => handleQuestionClick(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
