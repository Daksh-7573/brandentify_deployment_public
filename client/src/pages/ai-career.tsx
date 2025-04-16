import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import MuskButton from '@/components/musk/musk-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function AICareerPage() {
  const { user } = useAuth();
  const userId = user?.id || 1; // Use authenticated user or fallback to demo
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  // Context data to pass to Musk AI
  const muskContext = {
    page: 'ai-career',
    userId: userId,
    section: selectedSection || undefined
  };
  
  const features = [
    {
      id: 'career-advice',
      title: 'Career Growth Strategy',
      description: 'Get personalized advice to advance your career based on your profile and industry trends.',
      icon: '📈'
    },
    {
      id: 'resume-analysis',
      title: 'Resume Analysis & Enhancement',
      description: 'Receive detailed feedback on your resume with specific improvement suggestions.',
      icon: '📝'
    },
    {
      id: 'industry-insights',
      title: 'Industry & Market Insights',
      description: 'Stay informed about the latest trends, in-demand skills, and opportunities in your field.',
      icon: '🔍'
    },
    {
      id: 'networking',
      title: 'Networking Strategy',
      description: 'Develop effective connection approaches customized to your career goals and industry.',
      icon: '🤝'
    },
    {
      id: 'personal-brand',
      title: 'Personal Brand Building',
      description: 'Create a compelling professional identity that stands out in your field.',
      icon: '✨'
    },
    {
      id: 'job-hunting',
      title: 'Job Search Optimization',
      description: 'Smart job search strategies including interview preparation and salary negotiation.',
      icon: '🎯'
    }
  ];
  
  const handleSelectFeature = (featureId: string) => {
    setSelectedSection(featureId);
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Musk AI Career Assistant</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your personal AI-powered career advisor, ready to provide tailored guidance
              and help you reach your professional goals.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {features.map((feature) => (
              <Card 
                key={feature.id}
                className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
                onClick={() => handleSelectFeature(feature.id)}
              >
                <CardHeader className="pb-2">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground min-h-[60px]">
                    {feature.description}
                  </CardDescription>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFeature(feature.id);
                    }}
                  >
                    Ask Musk
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Musk AI integrates with your profile data to provide highly personalized career guidance.
              <br />
              The more complete your profile, the more tailored advice you'll receive.
            </p>
          </div>
        </div>
      </div>
      
      {/* Musk AI Button - Floating at bottom right */}
      <MuskButton context={muskContext} initialOpen={false} />
    </DashboardLayout>
  );
}