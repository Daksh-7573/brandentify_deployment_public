import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import Header from "@/components/layout/header";
import { 
  ArrowLeft,
  Calendar, 
  ExternalLink, 
  Users, 
  Star,
  MapPin,
  Building,
  Globe,
  Briefcase
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [_, setLocation] = useLocation();

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId
  });

  // Fetch collaborators
  const { data: collaborators = [], isLoading: collaboratorsLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/collaborators`],
    enabled: !!projectId
  });

  // Fetch endorsements
  const { data: endorsements = [], isLoading: endorsementsLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/endorsements`],
    enabled: !!projectId
  });

  const isLoading = projectLoading || collaboratorsLoading || endorsementsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation('/industry-pulse')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Industry Pulse
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <NeoGlassLayout>
        <div className="container mx-auto px-4 py-6">
          {/* Navigation */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/industry-pulse')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Industry Pulse
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Project Content */}
            <div className="lg:col-span-2 space-y-6">
              <NeoGlassSection>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white mb-2">
                        {project.title}
                      </CardTitle>
                      {project.category && (
                        <Badge variant="secondary" className="mb-3">
                          {project.category}
                        </Badge>
                      )}
                    </div>
                    {project.projectUrl && (
                      <Button asChild size="sm">
                        <a 
                          href={project.projectUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Project
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Project Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      {project.startDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Started {formatDistanceToNow(new Date(project.startDate))} ago
                        </div>
                      )}
                      {project.industry && (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          {project.industry}
                        </div>
                      )}
                    </div>

                    <Separator className="bg-white/20" />

                    {/* Project Description */}
                    {project.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {project.description}
                        </p>
                      </div>
                    )}

                    {/* Project Media */}
                    {project.mediaUrls && project.mediaUrls.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Project Gallery</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {project.mediaUrls.slice(0, 4).map((url: string, index: number) => (
                            <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                              <img 
                                src={url} 
                                alt={`Project media ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </NeoGlassSection>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team Members */}
              {collaborators && collaborators.length > 0 && (
                <NeoGlassSection>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Team Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {collaborators.map((collaborator: any) => (
                        <div key={collaborator.id} className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-purple-600 text-white">
                              {collaborator.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {collaborator.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {collaborator.role}
                            </p>
                          </div>
                          {collaborator.profileLink && (
                            <Button size="sm" variant="ghost" asChild>
                              <a 
                                href={collaborator.profileLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </NeoGlassSection>
              )}

              {/* Client Endorsements */}
              {endorsements && endorsements.length > 0 && (
                <NeoGlassSection>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      Client Endorsements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {endorsements.map((endorsement: any) => (
                        <div key={endorsement.id} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex items-start space-x-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-green-600 text-white">
                                {endorsement.endorserName.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white">
                                {endorsement.endorserName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {endorsement.endorserTitle} at {endorsement.endorserCompany}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 italic">
                            "{endorsement.endorsementText}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </NeoGlassSection>
              )}
            </div>
          </div>
        </div>
      </NeoGlassLayout>
    </div>
  );
}